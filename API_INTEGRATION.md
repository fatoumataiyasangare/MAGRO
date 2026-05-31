# Guide d'Intégration des APIs Réelles - MAGRO

Ce document explique comment brancher les APIs réelles dans l'application MAGRO. L'application est conçue pour basculer automatiquement entre le mode développement (données mockées) et le mode production (APIs réelles).

## Table des Matières

1. [Configuration Générale](#configuration-générale)
2. [Service SMS](#service-sms)
3. [Authentification Google](#authentification-google)
4. [Base de Données PostgreSQL](#base-de-données-postgresql)
5. [Backend API](#backend-api)
6. [Points d'Intégration dans le Code](#points-dintégration-dans-le-code)

---

## Configuration Générale

### Variables d'Environnement

L'application utilise des variables d'environnement pour contrôler le mode de fonctionnement:

#### Frontend (`.env`)
```bash
# API Backend
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Mode Développement
VITE_MOCK_DATA_ENABLED=true  # true = mode mock, false = API réelle

# Service SMS
VITE_SMS_API_ENABLED=false   # true = API SMS réelle, false = mode simulé
VITE_SMS_API_KEY=            # Clé API du fournisseur SMS
VITE_SMS_API_URL=            # URL du endpoint SMS

# Authentification Google
VITE_GOOGLE_AUTH_ENABLED=false  # true = Google OAuth réel, false = mode simulé
VITE_GOOGLE_CLIENT_ID=          # Client ID Google OAuth
```

#### Backend (`server/.env`)
```bash
# Base de Données
DATABASE_URL=postgresql://user:password@localhost:5432/magro

# Serveur
PORT=4000
NODE_ENV=production

# JWT
JWT_SECRET=votre-secret-jet-securise-ici

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Service SMS
SMS_API_ENABLED=false
SMS_API_KEY=
SMS_API_URL=
SMS_SENDER_ID=MAGRO

# Google Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

---

## Service SMS

### Fournisseurs SMS Supportés

L'application est compatible avec les fournisseurs SMS suivants:

1. **Twilio** (https://www.twilio.com)
2. **Africa's Talking** (https://www.africastalking.com)
3. **Orange SMS** (https://www.orange.com)
4. **MTN SMS** (https://www.mtn.com)

### Étapes d'Intégration

#### 1. Obtenir les Credentials SMS

Pour Twilio par exemple:
1. Créez un compte sur https://www.twilio.com
2. Obtenez votre Account SID et Auth Token
3. Achetez un numéro de téléphone

#### 2. Configurer les Variables d'Environnement

```bash
# Frontend (.env)
VITE_SMS_API_ENABLED=true
VITE_SMS_API_KEY=your_twilio_auth_token
VITE_SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json

# Backend (server/.env)
SMS_API_ENABLED=true
SMS_API_KEY=your_twilio_auth_token
SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
SMS_SENDER_ID=+22370123456  # Votre numéro Twilio
```

#### 3. Implémenter l'Appel API Réel

Dans `src/services/smsService.ts`, modifiez la méthode `sendOtp` de la classe `RealSMSService`:

```typescript
async sendOtp(phone: string, code: string): Promise<void> {
  const cfg = import.meta.env;
  const apiKey = cfg.VITE_SMS_API_KEY;
  const apiUrl = cfg.VITE_SMS_API_URL;
  
  if (!apiKey || !apiUrl) {
    throw new Error("SMS API credentials not configured");
  }

  // Exemple pour Twilio
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(apiKey + ":")}`
    },
    body: new URLSearchParams({
      To: phone,
      From: cfg.VITE_SMS_SENDER_ID || "MAGRO",
      Body: `Votre code de vérification MAGRO est: ${code}`
    })
  });
  
  if (!response.ok) {
    throw new Error("Failed to send SMS");
  }
}
```

#### 4. Point d'Intégration

Le service SMS est utilisé dans:
- `src/services/auth.ts` - `requestOtp()` et `verifyOtp()`
- `src/app/components/mvp/LoginSignupMVP.tsx` - Formulaire de connexion

---

## Authentification Google

### Étapes d'Intégration

#### 1. Créer un Projet Google Console

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez Google+ API ou Google Identity Platform

#### 2. Configurer OAuth 2.0

1. Allez dans "Credentials" > "Create Credentials" > "OAuth client ID"
2. Sélectionnez "Web application"
3. Configurez les "Authorized redirect URIs":
   - Développement: `http://localhost:5173/auth/google/callback`
   - Production: `https://votre-domaine.com/auth/google/callback`
4. Obtenez le Client ID et Client Secret

#### 3. Configurer les Variables d'Environnement

```bash
# Frontend (.env)
VITE_GOOGLE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Backend (server/.env)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

#### 4. Implémenter Google OAuth Réel

Dans `src/services/googleAuthService.ts`, modifiez la méthode `signIn` de la classe `RealGoogleAuthService`:

```typescript
async signIn(): Promise<UserProfile> {
  const cfg = import.meta.env;
  const clientId = cfg.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error("Google OAuth credentials not configured");
  }

  // Utiliser Google Identity Services
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'profile email',
    callback: async (response) => {
      const userInfo = await this.fetchGoogleUserInfo(response.access_token);
      return this.mapGoogleUserToProfile(userInfo);
    },
  });
  
  tokenClient.requestAccessToken();
  
  // Note: Cette implémentation nécessite d'ajouter le script Google Identity Services
  // dans index.html: <script src="https://accounts.google.com/gsi/client" async defer></script>
  
  throw new Error("Google OAuth implementation requires additional setup");
}
```

#### 5. Point d'Intégration

Le service Google Auth est utilisé dans:
- `src/app/components/mvp/LoginSignupMVP.tsx` - Bouton "Continuer avec Google"
- `src/services/auth.ts` - `signInWithGoogle()`

---

## Base de Données PostgreSQL

### Configuration

#### 1. Installer PostgreSQL

```bash
# Windows
# Télécharger et installer depuis https://www.postgresql.org/download/windows/

# macOS
brew install postgresql
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Créer la Base de Données

```bash
# Connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE magro;

# Créer un utilisateur
CREATE USER magro_user WITH PASSWORD 'magro_password';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE magro TO magro_user;

# Quitter
\q
```

#### 3. Configurer la Variable d'Environnement

```bash
# Backend (server/.env)
DATABASE_URL=postgresql://magro_user:magro_password@localhost:5432/magro
```

#### 4. Exécuter les Migrations Prisma

```bash
cd server
pnpm prisma migrate dev --name init
pnpm prisma generate
```

#### 5. Optionnel: Seed de Données de Test

```bash
cd server
pnpm prisma db seed
```

---

## Backend API

### Démarrer le Backend

```bash
cd server
pnpm install
pnpm run dev
```

Le backend sera disponible sur `http://localhost:4000`

### Endpoints API

#### Authentification
- `POST /api/v1/auth/request-otp` - Demander un code OTP
- `POST /api/v1/auth/verify-otp` - Vérifier un code OTP
- `POST /api/v1/auth/refresh` - Rafraîchir le token
- `POST /api/v1/auth/logout` - Déconnexion

#### Listings
- `GET /api/v1/listings` - Récupérer toutes les annonces
- `GET /api/v1/listings/mine` - Récupérer mes annonces
- `POST /api/v1/listings` - Créer une annonce
- `DELETE /api/v1/listings/:id` - Supprimer une annonce

#### Commandes
- `POST /api/v1/orders` - Créer une commande
- `GET /api/v1/orders/mine` - Récupérer mes commandes

#### Profil
- `GET /api/v1/profile` - Récupérer mon profil
- `PATCH /api/v1/profile/role` - Mettre à jour mon rôle

#### Chat
- `GET /api/v1/chat/contacts` - Récupérer les contacts
- `GET /api/v1/chat/messages/:contactId` - Récupérer les messages

---

## Points d'Intégration dans le Code

### Services Frontend avec Bascule Automatique

Tous les services frontend utilisent la fonction `fetchWithFallback` pour basculer automatiquement entre API réelle et mode simulé:

- `src/services/auth.ts` - Authentification
- `src/services/listings.ts` - Annonces
- `src/services/orders.ts` - Commandes
- `src/services/smsService.ts` - Service SMS
- `src/services/googleAuthService.ts` - Authentification Google

### Logique de Bascule

La logique de bascule est implémentée dans `src/services/config.ts`:

```typescript
export async function fetchWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  errorMessage?: string
): Promise<T> {
  const cfg = getConfig();
  
  // Si l'API n'est pas disponible ou si les données mockées sont activées
  if (!cfg.isApiAvailable || cfg.mockDataEnabled) {
    console.warn("API non disponible ou mode mock activé, utilisation des données de fallback");
    return fallbackData;
  }
  
  try {
    return await apiCall();
  } catch (error) {
    console.warn("Erreur lors de l'appel API, utilisation des données de fallback");
    return fallbackData;
  }
}
```

### Activer le Mode Production

Pour passer en mode production et utiliser les APIs réelles:

1. **Désactiver les données mockées**:
   ```bash
   VITE_MOCK_DATA_ENABLED=false
   ```

2. **Configurer l'URL de l'API backend**:
   ```bash
   VITE_API_BASE_URL=https://votre-api-backend.com/api/v1
   ```

3. **Configurer les APIs externes** (SMS, Google, etc.) comme décrit ci-dessus

4. **Redémarrer l'application**:
   ```bash
   pnpm run dev
   ```

---

## Dépannage

### L'API ne répond pas

1. Vérifiez que le backend est démarré: `cd server && pnpm run dev`
2. Vérifiez l'URL de l'API dans `.env`: `VITE_API_BASE_URL`
3. Vérifiez les logs du backend pour les erreurs

### Les SMS ne sont pas envoyés

1. Vérifiez que `VITE_SMS_API_ENABLED=true`
2. Vérifiez les credentials SMS dans `.env`
3. Vérifiez les logs du backend pour les erreurs SMS
4. En mode développement, l'OTP est affiché dans la console

### Google OAuth ne fonctionne pas

1. Vérifiez que `VITE_GOOGLE_AUTH_ENABLED=true`
2. Vérifiez le Client ID Google dans `.env`
3. Vérifiez que le redirect URI est configuré dans Google Console
4. Vérifiez que le script Google Identity Services est chargé

### Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez la chaîne de connexion `DATABASE_URL`
3. Vérifiez que les migrations Prisma ont été exécutées
4. Vérifiez que le client Prisma a été généré: `pnpm prisma generate`

---

## Support

Pour toute question ou problème d'intégration, consultez:
- Documentation Prisma: https://www.prisma.io/docs
- Documentation Twilio: https://www.twilio.com/docs
- Documentation Google OAuth: https://developers.google.com/identity
