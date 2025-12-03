/**
 * Middleware d'autorisation basé sur les groupes Keycloak
 */

/**
 * Vérifie que l'utilisateur appartient à un groupe spécifique
 * @param {string} groupName - Nom du groupe requis (ex: '/owner', '/merchant', '/client')
 */
const requireGroup = (groupName) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userGroups = req.user.groups || [];

        // Normaliser le nom du groupe (avec ou sans /)
        const normalizedGroupName = groupName.startsWith('/') ? groupName : `/${groupName}`;

        const hasGroup = userGroups.some(group =>
            group === normalizedGroupName || group === groupName
        );

        if (!hasGroup) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Access denied. Required group: ${groupName}`,
                userGroups: userGroups
            });
        }

        next();
    };
};

/**
 * Vérifie que l'utilisateur appartient à au moins un des groupes spécifiés
 * @param {string[]} groupNames - Liste des groupes acceptés
 */
const requireAnyGroup = (groupNames) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userGroups = req.user.groups || [];

        // Normaliser tous les noms de groupes
        const normalizedGroupNames = groupNames.map(name =>
            name.startsWith('/') ? name : `/${name}`
        );

        const hasAnyGroup = userGroups.some(userGroup =>
            normalizedGroupNames.includes(userGroup) ||
            groupNames.includes(userGroup.replace('/', ''))
        );

        if (!hasAnyGroup) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Access denied. Required one of: ${groupNames.join(', ')}`,
                userGroups: userGroups
            });
        }

        next();
    };
};

/**
 * Vérifie que l'utilisateur est propriétaire de la ressource OU admin
 * @param {Function} getResourceOwnerId - Fonction qui retourne l'ID du propriétaire de la ressource
 */
const requireOwnerOrAdmin = (getResourceOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userGroups = req.user.groups || [];
        const isOwner = userGroups.some(g => g === '/owner' || g === 'owner');

        // Si c'est un owner du marketplace, autoriser
        if (isOwner) {
            return next();
        }

        // Sinon, vérifier si c'est le propriétaire de la ressource
        try {
            const resourceOwnerId = await getResourceOwnerId(req);

            if (req.user.id === resourceOwnerId) {
                return next();
            }

            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own resources'
            });
        } catch (error) {
            console.error('Error checking resource ownership:', error);
            return res.status(500).json({ error: 'Error checking permissions' });
        }
    };
};

/**
 * Vérifie que l'utilisateur est un owner du marketplace
 */
const requireOwner = requireGroup('owner');

/**
 * Vérifie que l'utilisateur est un merchant
 */
const requireMerchant = requireGroup('merchant');

/**
 * Vérifie que l'utilisateur est un client
 */
const requireClient = requireGroup('client');

/**
 * Vérifie que l'utilisateur est merchant ou owner
 */
const requireMerchantOrOwner = requireAnyGroup(['merchant', 'owner']);

module.exports = {
    requireGroup,
    requireAnyGroup,
    requireOwnerOrAdmin,
    requireOwner,
    requireMerchant,
    requireClient,
    requireMerchantOrOwner
};
