# MAGRO - Documentation d'Installation

## Présentation du projet

MAGRO est une Marketplace Agricole moderne destinée au Mali. Elle connecte directement les agriculteurs maliens avec divers types d'acheteurs (particuliers, commerçants, industries) en assurant la traçabilité, la gestion des litiges, la vérification d'identité (KYC/KYB) et la sécurisation des paiements via un système de séquestre (Acompte Mobile Money).

### Objectifs
- Offrir un canal de vente direct pour les agriculteurs.
- Sécuriser les transactions via un calcul de risque et un système d'acompte (30% à 50%).
- Fournir une plateforme de contractualisation B2B pour les industriels (contrats saisonniers).
- Assurer la qualité via un système d'audit et de certification par des experts.

### Technologies utilisées
- **Frontend** : React 18, Vite, TypeScript, TailwindCSS, Framer Motion, Composants Radix UI / Shadcn.
- **Backend** : Node.js, Express, TypeScript, Prisma ORM, Socket.io, JWT.
- **Base de données** : PostgreSQL.
- **Outils** : NPM/PNPM workspaces, Docker, Docker Compose.

---

## Prérequis

Avant de procéder à l'installation, assurez-vous d'avoir les outils suivants installés sur votre machine :
- **Node.js** (v18 ou supérieur requis)
- **NPM** (inclus avec Node.js)
- **PostgreSQL** (v14 ou supérieur) actif sur le port 5432
- **Git**

*(Note : Contrairement à d'autres projets mobiles, MAGRO est une PWA/WebApp complète, l'installation de Flutter ou Android Studio n'est donc pas requise).*

---

## Installation

Suivez ces étapes pour installer le projet localement :

```bash
# 1. Cloner le dépôt
git clone <repository-url>
cd MAGRO

# 2. Le projet est divisé en deux parties principales (frontend et backend).
# Installez les dépendances pour chaque partie.
cd backend
npm install

cd ../frontend
npm install
```

---

## Configuration

Le projet utilise des variables d'environnement. Des fichiers `.env.example` sont fournis à titre de modèle.

### 1. Configuration Backend (`backend/.env`)

Dans le dossier `backend`, créez un fichier `.env` :

```env
# Connexion à la base de données PostgreSQL
DATABASE_URL=postgresql://<utilisateur>:<mot_de_passe>@localhost:5432/magro

# Port de l'API
PORT=4000
NODE_ENV=development

# Clés de sécurité (remplacez par des chaînes longues et aléatoires)
ACCESS_TOKEN_SECRET=votre-cle-secrete-access-token
REFRESH_TOKEN_SECRET=votre-cle-secrete-refresh-token

# Origine du Frontend pour le CORS
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Configuration Frontend (`frontend/.env`)

Dans le dossier `frontend`, créez un fichier `.env` :

```env
# URL de l'API Backend
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Activer/Désactiver le mode Mock (utile si le backend n'est pas disponible)
VITE_MOCK_DATA_ENABLED=false
```

---

## Lancement du backend

Une fois la configuration terminée, vous devez préparer la base de données et démarrer l'API.

```bash
cd backend

# 1. Générer le client Prisma
npx prisma generate

# 2. Pousser le schéma dans la base de données
npx prisma db push
# (ou npx prisma migrate dev pour créer l'historique des migrations)

# 3. Peupler la base de données avec des données de test
npm run prisma:seed

# 4. Lancer le serveur en mode développement
npm run dev
```

Le backend sera accessible sur `http://localhost:4000`.

---

## Lancement du frontend

Dans un second terminal, démarrez l'application React :

```bash
cd frontend

# Démarrer le serveur de développement Vite
npm run dev
```

L'application web sera accessible sur `http://localhost:5173`.

---

## Build de production

Pour déployer l'application sur un serveur de production :

### Build Frontend
```bash
cd frontend
npm run build
```
Les fichiers générés se trouveront dans le dossier `frontend/dist/`. Ils peuvent être servis par Nginx ou Apache.

### Build Backend
```bash
cd backend
npm run build
```
Les fichiers compilés se trouveront dans le dossier `backend/dist/`. Vous pouvez ensuite démarrer le serveur avec `npm run start` ou via PM2.

---

## Dépannage (Problèmes fréquents)

### `Can't reach database server at localhost:5432`
- **Cause** : Le service PostgreSQL n'est pas démarré ou les identifiants dans `DATABASE_URL` sont incorrects.
- **Solution** : Vérifiez que PostgreSQL est bien lancé via les services Windows (ou `systemctl` sous Linux). Assurez-vous que l'utilisateur, le mot de passe et le nom de la base de données dans votre `.env` sont corrects.

### `PrismaClientInitializationError` ou `Module not found: @prisma/client`
- **Cause** : Le client Prisma n'a pas été généré ou est asynchrone par rapport au schéma.
- **Solution** : Placez-vous dans le dossier `backend` et exécutez `npx prisma generate`.

### Les imports échouent lors du build Frontend (`npm run build`)
- **Cause** : Le cache de Vite peut parfois conserver des anciens chemins.
- **Solution** : Supprimez le dossier `node_modules/.vite` ou relancez l'installation complète avec `rm -rf node_modules package-lock.json && npm install`.

### `CORS policy: No 'Access-Control-Allow-Origin'`
- **Cause** : L'URL du frontend n'est pas autorisée par le backend.
- **Solution** : Vérifiez la variable `CLIENT_ORIGIN` dans `backend/.env`. Elle doit correspondre exactement à l'URL sur laquelle tourne le frontend (ex: `http://localhost:5173` sans slash à la fin).
