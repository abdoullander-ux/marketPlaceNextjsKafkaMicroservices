import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createKeycloakUser, addUserToGroup } from '../lib/keycloakAdmin';

const prisma = new PrismaClient();

/**
 * Register a new merchant
 */
export const registerMerchant = async (req: Request, res: Response) => {
    try {
        const { email, password, name, shopName, mvolaNumber } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Split name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Create user in Keycloak
        const keycloakUserId = await createKeycloakUser({
            email,
            password,
            firstName,
            lastName,
            enabled: true,
        });

        // Create user in local database
        const user = await prisma.user.create({
            data: {
                email,
                password: '', // Password is managed by Keycloak
                name,
                role: 'BUYER', // Default role until approved
            },
        });

        // Create merchant profile
        await prisma.merchantProfile.create({
            data: {
                userId: user.id,
                shopName,
                logo: req.body.logo,
                address: req.body.address,
                mvolaNumber: mvolaNumber || null,
                commissionRate: 5.0,
                balance: 0.0,
                status: 'PENDING'
            },
        });

        res.status(201).json({
            message: 'Merchant registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                keycloakId: keycloakUserId,
            },
        });
    } catch (error: any) {
        console.error('Error registering merchant:', error);

        if (error.message?.includes('already exists')) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        res.status(500).json({ error: 'Failed to register merchant' });
    }
};

/**
 * Register a new client
 */
export const registerClient = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Split name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Create user in Keycloak
        const keycloakUserId = await createKeycloakUser({
            email,
            password,
            firstName,
            lastName,
            enabled: true,
        });

        // Add user to client group
        await addUserToGroup(keycloakUserId, 'client');

        // Create user in local database
        const user = await prisma.user.create({
            data: {
                email,
                password: '', // Password is managed by Keycloak
                name,
                role: 'BUYER',
            },
        });

        res.status(201).json({
            message: 'Client registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                keycloakId: keycloakUserId,
            },
        });
    } catch (error: any) {
        console.error('Error registering client:', error);

        if (error.message?.includes('already exists')) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        res.status(500).json({ error: 'Failed to register client' });
    }
};
