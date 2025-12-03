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
 * Create a user in Keycloak
 */
export async function createKeycloakUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    enabled?: boolean;
}) {
    await ensureAuthenticated();

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
}

/**
 * Add user to a group
 */
export async function addUserToGroup(userId: string, groupName: string) {
    await ensureAuthenticated();

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
}

/**
 * Delete a user from Keycloak
 */
export async function deleteKeycloakUser(userId: string) {
    await ensureAuthenticated();

    const realm = process.env.KEYCLOAK_REALM || 'marketplace';

    try {
        await keycloakAdmin.users.del({ realm, id: userId });
        console.log('User deleted from Keycloak:', userId);
    } catch (error) {
        console.error('Error deleting Keycloak user:', error);
        throw error;
    }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
    await ensureAuthenticated();

    const realm = process.env.KEYCLOAK_REALM || 'marketplace';

    try {
        const users = await keycloakAdmin.users.find({ realm, email, exact: true });
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

export default keycloakAdmin;
