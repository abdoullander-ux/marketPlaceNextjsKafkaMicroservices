import KcAdminClient from '@keycloak/keycloak-admin-client';

const keycloakAdmin = new KcAdminClient({
    baseUrl: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
    realmName: 'master', // We authenticate to master realm
});

let authenticated = false;

/**
 * Authenticate with Keycloak admin
 */
export async function authenticateAdmin() {
    try {
        await keycloakAdmin.auth({
            username: process.env.KEYCLOAK_ADMIN_USER || 'admin',
            password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
            grantType: 'password',
            clientId: 'admin-cli',
        });
        authenticated = true;
        console.log('Keycloak admin authenticated successfully');
    } catch (error) {
        console.error('Failed to authenticate Keycloak admin:', error);
        authenticated = false;
        throw error;
    }
}

/**
 * Ensure admin is authenticated before operations
 */
async function ensureAuthenticated() {
    if (!authenticated) {
        await authenticateAdmin();
    }
}

/**
 * Wrapper to handle 401 Unauthorized and retry authentication
 */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
        await ensureAuthenticated();
        return await operation();
    } catch (error: any) {
        if (error.response?.status === 401 || (error.message && error.message.includes('401'))) {
            console.log('Keycloak admin token expired or invalid, re-authenticating...');
            authenticated = false;
            await authenticateAdmin();
            return await operation();
        }
        throw error;
    }
}

/**
 * Create a user in Keycloak
 */
export async function createKeycloakUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    enabled?: boolean;
}) {
    return withRetry(async () => {
        const realm = process.env.KEYCLOAK_REALM || 'marketplace';

        try {
            // Create user
            const user = await keycloakAdmin.users.create({
                realm,
                username: userData.email,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                enabled: userData.enabled !== false,
                emailVerified: true,
                credentials: [
                    {
                        type: 'password',
                        value: userData.password,
                        temporary: false,
                    },
                ],
            });

            console.log('User created in Keycloak:', user.id);
            return user.id;
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('User with this email already exists');
            }
            console.error('Error creating Keycloak user:', error);
            throw error;
        }
    });
}

/**
 * Add user to a group
 */
export async function addUserToGroup(userId: string, groupName: string) {
    return withRetry(async () => {
        const realm = process.env.KEYCLOAK_REALM || 'marketplace';

        try {
            // Find the group by name
            const groups = await keycloakAdmin.groups.find({ realm, search: groupName });
            const group = groups.find(g => g.name === groupName);

            if (!group || !group.id) {
                throw new Error(`Group '${groupName}' not found in Keycloak`);
            }

            // Add user to group
            await keycloakAdmin.users.addToGroup({
                realm,
                id: userId,
                groupId: group.id,
            });

            console.log(`User ${userId} added to group ${groupName}`);
        } catch (error) {
            console.error('Error adding user to group:', error);
            throw error;
        }
    });
}

/**
 * Delete a user from Keycloak
 */
export async function deleteKeycloakUser(userId: string) {
    return withRetry(async () => {
        const realm = process.env.KEYCLOAK_REALM || 'marketplace';

        try {
            await keycloakAdmin.users.del({ realm, id: userId });
            console.log('User deleted from Keycloak:', userId);
        } catch (error) {
            console.error('Error deleting Keycloak user:', error);
            throw error;
        }
    });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
    return withRetry(async () => {
        const realm = process.env.KEYCLOAK_REALM || 'marketplace';

        try {
            const users = await keycloakAdmin.users.find({ realm, email, exact: true });
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    });
}

/**
 * Configure Keycloak Client (e.g. add redirect URIs)
 */
export async function configureKeycloakClient() {
    return withRetry(async () => {
        const realm = process.env.KEYCLOAK_REALM || 'marketplace';
        const clientId = process.env.KEYCLOAK_CLIENT_ID || 'marketplace-frontend';

        try {
            const clients = await keycloakAdmin.clients.find({ realm, clientId: clientId });
            const client = clients.find(c => c.clientId === clientId);

            if (!client || !client.id) {
                console.error(`Client '${clientId}' not found in Keycloak`);
                return;
            }

            // Update client with specific redirect URIs to allow IP access
            // We add both localhost and the specific IP the user is using
            const redirectUris = [
                '*', // Wildcard
                'http://localhost:3000/*',
                'http://localhost:3000',
                'http://localhost/*',
                'http://localhost',
                'http://192.168.226.128/*',
                'http://192.168.226.128',
            ];

            await keycloakAdmin.clients.update({ realm, id: client.id }, {
                redirectUris: redirectUris,
                webOrigins: ['*'],
                attributes: {
                    'post.logout.redirect.uris': '+' // Allow all redirect URIs for post-logout
                }
            });

            console.log(`Updated Keycloak client '${clientId}' redirect URIs and post-logout URIs`);
        } catch (error) {
            console.error('Error configuring Keycloak client:', error);
            // Don't throw, just log
        }
    });
}

export default keycloakAdmin;
