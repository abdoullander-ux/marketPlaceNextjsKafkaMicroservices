import Keycloak from 'keycloak-js';

// Configuration Keycloak
const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'marketplace',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'marketplace-frontend',
};

// Instance Keycloak
let keycloakInstance: Keycloak | null = null;

export const getKeycloak = (): Keycloak => {
    if (typeof window === 'undefined') {
        // Server-side: return a mock object
        return {} as Keycloak;
    }

    if (!keycloakInstance) {
        keycloakInstance = new Keycloak(keycloakConfig);
    }

    return keycloakInstance;
};

export default getKeycloak;
