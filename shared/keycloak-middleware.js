const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Configuration du client JWKS pour récupérer les clés publiques de Keycloak
const client = jwksClient({
    jwksUri: `${process.env.KEYCLOAK_URL || 'http://keycloak:8080'}/realms/${process.env.KEYCLOAK_REALM || 'marketplace'}/protocol/openid-connect/certs`,
    cache: true,
    cacheMaxAge: 86400000, // 24 heures
    rateLimit: true,
    jwksRequestsPerMinute: 10
});

// Fonction pour obtenir la clé de signature
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

/**
 * Middleware d'authentification Keycloak
 * Vérifie la validité du token JWT et extrait les informations utilisateur
 */
const authenticateKeycloak = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Build list of accepted issuers (internal and external)
    const internalIssuer = `${process.env.KEYCLOAK_URL || 'http://keycloak:8080'}/realms/${process.env.KEYCLOAK_REALM || 'marketplace'}`;
    const externalIssuer = `${process.env.KEYCLOAK_EXTERNAL_URL || 'http://192.168.226.128:8081'}/realms/${process.env.KEYCLOAK_REALM || 'marketplace'}`;

    // Vérifier le token avec la clé publique de Keycloak (sans vérifier l'issuer d'abord)
    jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        ignoreExpiration: false
    }, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Manually verify issuer against both internal and external URLs
        if (decoded.iss !== internalIssuer && decoded.iss !== externalIssuer) {
            console.error('Token issuer mismatch. Expected:', internalIssuer, 'or', externalIssuer, 'Got:', decoded.iss);
            return res.status(401).json({ error: 'Invalid token issuer' });
        }

        // Extraire les informations utilisateur et les groupes
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            preferredUsername: decoded.preferred_username,
            groups: decoded.groups || [],
            roles: decoded.realm_access?.roles || [],
            token: token
        };

        next();
    });
};

/**
 * Middleware optionnel - n'échoue pas si pas de token
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.substring(7);

    // Build list of accepted issuers (internal and external)
    const internalIssuer = `${process.env.KEYCLOAK_URL || 'http://keycloak:8080'}/realms/${process.env.KEYCLOAK_REALM || 'marketplace'}`;
    const externalIssuer = `${process.env.KEYCLOAK_EXTERNAL_URL || 'http://192.168.226.128:8081'}/realms/${process.env.KEYCLOAK_REALM || 'marketplace'}`;

    jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        ignoreExpiration: false
    }, (err, decoded) => {
        if (err) {
            req.user = null;
        } else if (decoded.iss !== internalIssuer && decoded.iss !== externalIssuer) {
            // Invalid issuer
            req.user = null;
        } else {
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                preferredUsername: decoded.preferred_username,
                groups: decoded.groups || [],
                roles: decoded.realm_access?.roles || [],
                token: token
            };
        }
        next();
    });
};

module.exports = {
    authenticateKeycloak,
    optionalAuth
};
