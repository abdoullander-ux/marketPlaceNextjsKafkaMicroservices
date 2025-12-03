'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import getKeycloak from '../lib/keycloak';

interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    groups: string[];
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: () => void;
    loginWithPassword: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    hasGroup: (group: string) => boolean;
    isOwner: boolean;
    isMerchant: boolean;
    isClient: boolean;
    registerMerchant: (data: any) => Promise<void>;
    registerClient: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                const kc = getKeycloak();
                setKeycloak(kc);

                const authenticated = await kc.init({
                    onLoad: 'check-sso',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                });

                if (authenticated && kc.tokenParsed) {
                    setIsAuthenticated(true);
                    setToken(kc.token || null);

                    const userData: User = {
                        id: kc.tokenParsed.sub || '',
                        email: kc.tokenParsed.email || '',
                        name: kc.tokenParsed.name || '',
                        username: kc.tokenParsed.preferred_username || '',
                        groups: kc.tokenParsed.groups || [],
                    };
                    console.log('Keycloak Token Structure:', kc.tokenParsed);
                    console.log('User Data:', userData);
                    setUser(userData);
                }

                setIsLoading(false);

                // Auto-refresh token
                kc.onTokenExpired = () => {
                    kc.updateToken(30).then((refreshed: boolean) => {
                        if (refreshed) {
                            setToken(kc.token || null);
                        }
                    }).catch(() => {
                        console.error('Failed to refresh token');
                        logout();
                    });
                };
            } catch (error) {
                console.error('Keycloak initialization failed:', error);
                setIsLoading(false);
            }
        };

        initKeycloak();
    }, []);

    const login = () => {
        keycloak?.login();
    };

    const loginWithPassword = async (email: string, password: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'marketplace-frontend',
                        username: email,
                        password: password,
                        grant_type: 'password',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            const kc = getKeycloak();

            // Manually set the token
            kc.token = data.access_token;
            kc.refreshToken = data.refresh_token;

            // Parse token manually (base64 decode the payload)
            const base64Url = data.access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            kc.tokenParsed = JSON.parse(jsonPayload);

            setIsAuthenticated(true);
            setToken(data.access_token);

            const userData: User = {
                id: kc.tokenParsed?.sub || '',
                email: kc.tokenParsed?.email || '',
                name: kc.tokenParsed?.name || '',
                username: kc.tokenParsed?.preferred_username || '',
                groups: kc.tokenParsed?.groups || [],
            };
            setUser(userData);
            setKeycloak(kc);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const registerMerchant = async (data: any) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register/merchant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    };

    const registerClient = async (data: any) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register/client`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    };

    const logout = () => {
        keycloak?.logout({
            redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
    };

    const hasGroup = (group: string): boolean => {
        if (!user) return false;
        const normalizedGroup = group.startsWith('/') ? group : `/${group}`;
        return user.groups.some(g => g === normalizedGroup || g === group);
    };

    const isOwner = hasGroup('owner');
    const isMerchant = hasGroup('merchant');
    const isClient = hasGroup('client');

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                token,
                login,
                loginWithPassword,
                logout,
                isLoading,
                hasGroup,
                isOwner,
                isMerchant,
                isClient,
                registerMerchant,
                registerClient,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
