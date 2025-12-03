# Guide de Configuration Keycloak pour Marketplace

Ce guide vous explique comment configurer Keycloak pour votre marketplace avec les trois groupes d'utilisateurs : **owner**, **merchant**, et **client**.

## Prérequis

Assurez-vous que tous les services sont démarrés :

```bash
cd /home/madasoft/Desktop/Gravity/marketPlaceNextjsKafkaMicroservices
docker-compose up -d
```

Attendez quelques minutes que Keycloak démarre complètement.

## Étape 1 : Accéder à l'interface d'administration Keycloak

1. Ouvrez votre navigateur et accédez à : http://localhost:8081
2. Cliquez sur "Administration Console"
3. Connectez-vous avec :
   - **Username**: `admin`
   - **Password**: `admin`

## Étape 2 : Créer le Realm "marketplace"

1. Dans le menu déroulant en haut à gauche (actuellement sur "master"), cliquez sur **"Create Realm"**
2. Remplissez les informations :
   - **Realm name**: `marketplace`
   - **Enabled**: ON
3. Cliquez sur **"Create"**

## Étape 3 : Créer les Groupes

### Groupe "owner"

1. Dans le menu de gauche, cliquez sur **"Groups"**
2. Cliquez sur **"Create group"**
3. Entrez le nom : `owner`
4. Cliquez sur **"Create"**

### Groupe "merchant"

1. Cliquez à nouveau sur **"Create group"**
2. Entrez le nom : `merchant`
3. Cliquez sur **"Create"**

### Groupe "client"

1. Cliquez à nouveau sur **"Create group"**
2. Entrez le nom : `client`
3. Cliquez sur **"Create"**

### Étape 4 : Créer le Client Frontend

1. Dans le menu de gauche, cliquez sur **Clients**
2. Cliquez sur **Create client**
3. Remplissez les informations :
   - **Client type** : OpenID Connect
   - **Client ID** : `marketplace-frontend`
   - Cliquez sur **Next**

4. **Capability config** :
   - **Client authentication** : OFF (public client)
   - **Authorization** : OFF
   - **Authentication flow** :
     - ✅ Standard flow
     - ✅ Direct access grants (IMPORTANT : requis pour login avec email/password)
     - ❌ Implicit flow
     - ❌ Service accounts roles
   - Cliquez sur **Next**

5. **Login settings** (IMPORTANT - utilisez `localhost` même avec Docker) :
   - **Root URL** : `http://localhost:3000`
   - **Home URL** : `http://localhost:3000`
   - **Valid redirect URIs** : `http://localhost:3000/*`
   - **Valid post logout redirect URIs** : `http://localhost:3000/*`
   - **Web origins** : `http://localhost:3000`
   
   > **Note Docker** : Même si votre application tourne dans Docker, utilisez `localhost:3000` car c'est l'URL que votre navigateur utilise pour accéder à l'application (grâce au port mapping dans docker-compose).

6. Cliquez sur **Save**

## Étape 5 : Configurer le Mapper pour les Groupes

Pour que les groupes soient inclus dans le token JWT :

1. Restez dans le client **"marketplace-frontend"**
2. Cliquez sur l'onglet **"Client scopes"**
3. Cliquez sur **"marketplace-frontend-dedicated"**
4. Cliquez sur **"Add mapper"** → **"By configuration"**
5. Sélectionnez **"Group Membership"**
6. Configurez :
   - **Name**: `groups`
   - **Token Claim Name**: `groups`
   - **Full group path**: OFF (important !)
   - **Add to ID token**: ON
   - **Add to access token**: ON
   - **Add to userinfo**: ON
7. Cliquez sur **"Save"**

## Étape 6 : Créer des Utilisateurs de Test

### Utilisateur Owner

1. Dans le menu de gauche, cliquez sur **"Users"**
2. Cliquez sur **"Create new user"**
3. Remplissez :
   - **Username**: `owner@marketplace.com`
   - **Email**: `owner@marketplace.com`
   - **Email verified**: ON
   - **First name**: `Admin`
   - **Last name**: `Owner`
4. Cliquez sur **"Create"**
5. Allez dans l'onglet **"Credentials"**
6. Cliquez sur **"Set password"**
   - **Password**: `owner123`
   - **Temporary**: OFF
7. Cliquez sur **"Save"**
8. Allez dans l'onglet **"Groups"**
9. Cliquez sur **"Join Group"**
10. Sélectionnez **"owner"** et cliquez sur **"Join"**

### Utilisateur Merchant

1. Répétez les étapes ci-dessus avec :
   - **Username**: `merchant@marketplace.com`
   - **Email**: `merchant@marketplace.com`
   - **First name**: `John`
   - **Last name**: `Merchant`
   - **Password**: `merchant123`
   - **Group**: `merchant`

### Utilisateur Client

1. Répétez les étapes ci-dessus avec :
   - **Username**: `client@marketplace.com`
   - **Email**: `client@marketplace.com`
   - **First name**: `Jane`
   - **Last name**: `Client`
   - **Password**: `client123`
   - **Group**: `client`

## Étape 7 : Vérifier la Configuration

### Test via l'API Keycloak

Vous pouvez tester l'authentification avec curl :

```bash
# Obtenir un token pour l'owner
curl -X POST 'http://localhost:8081/realms/marketplace/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=marketplace-frontend' \
  -d 'username=owner@marketplace.com' \
  -d 'password=owner123' \
  -d 'grant_type=password'
```

Vous devriez recevoir un `access_token` en réponse.

### Décoder le Token

Copiez l'`access_token` et allez sur https://jwt.io pour le décoder. Vous devriez voir :
- `groups: ["owner"]`
- `email: "owner@marketplace.com"`
- `name: "Admin Owner"`

## Étape 8 : Configuration Optionnelle

### Personnaliser la Page de Connexion

1. Allez dans **"Realm settings"** → **"Themes"**
2. Vous pouvez changer le thème de login si vous le souhaitez

### Configurer la Durée des Tokens

1. Allez dans **"Realm settings"** → **"Tokens"**
2. Ajustez :
   - **Access Token Lifespan**: 5 minutes (par défaut)
   - **Refresh Token Lifespan**: 30 minutes

## Résumé des Identifiants

| Rôle | Email | Password | Groupe |
|------|-------|----------|--------|
| Owner | owner@marketplace.com | owner123 | owner |
| Merchant | merchant@marketplace.com | merchant123 | merchant |
| Client | client@marketplace.com | client123 | client |

## Prochaines Étapes

Maintenant que Keycloak est configuré, vous pouvez :
1. Tester l'authentification depuis le frontend
2. Vérifier que les endpoints protégés fonctionnent correctement
3. Créer des utilisateurs supplémentaires selon vos besoins

## Dépannage

### Keycloak ne démarre pas
- Vérifiez les logs : `docker-compose logs keycloak`
- Assurez-vous que PostgreSQL est bien démarré

### Les groupes n'apparaissent pas dans le token
- Vérifiez que le mapper "groups" est bien configuré
- Assurez-vous que "Full group path" est sur OFF
- Vérifiez que l'utilisateur est bien membre du groupe

### Erreur CORS
- Vérifiez que les "Web origins" sont bien configurés dans le client
- Redémarrez Nginx : `docker-compose restart nginx`
