# MAGRO - Documentation officielle et Installation

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

## 🛠️ Prérequis

Avant de procéder à l'installation, assurez-vous d'avoir les outils suivants installés sur votre machine :
- **Node.js** (v18 ou supérieur requis)
- **NPM** (inclus avec Node.js)
- **Git**

*(Note : Contrairement à d'autres projets mobiles, MAGRO est une PWA/WebApp complète, l'installation de Flutter ou Android Studio n'est donc pas requise).*

---

## 🚀 Installation rapide

Suivez ces étapes pour récupérer le code et installer les bibliothèques :

```bash
# 1. Cloner le dépôt
git clone <repository-url>
cd MAGRO

# 2. Le projet est divisé en deux parties (frontend et backend).
# Installez les dépendances pour le backend :
cd backend
npm install

# Installez les dépendances pour le frontend :
cd ../frontend
npm install
```

---

## 🗄️ Configuration de la Base de données (PostgreSQL)

MAGRO nécessite une base de données PostgreSQL. Vous avez **3 options** pour la configurer, de la plus simple à la plus avancée.

### Option 1 : Utiliser Docker (Recommandé pour le développement local)
C'est la méthode la plus rapide si vous avez **Docker Desktop** installé sur votre machine.

1. Téléchargez et installez [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Ouvrez un terminal à la racine du projet `MAGRO`.
3. Lancez la base de données isolée en arrière-plan :
   ```bash
   docker compose up -d postgres
   ```
4. Dans le fichier `backend/.env`, configurez votre URL de connexion ainsi :
   `DATABASE_URL=postgresql://magro_user:magro_password@localhost:5432/magro`

### Option 2 : Utiliser Supabase (Recommandé si vous n'avez pas Docker)
Supabase offre une base de données PostgreSQL gratuite et gérée dans le cloud, sans rien installer sur votre ordinateur.

1. Créez un compte gratuit sur [Supabase](https://supabase.com).
2. Créez un nouveau "Project".
3. Allez dans *Project Settings* > *Database* et copiez l'**URI de connexion (Connection string)**.
4. Dans le fichier `backend/.env`, collez l'URL fournie par Supabase. Elle ressemble à ceci :
   `DATABASE_URL=postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[VOTRE_ID].supabase.co:5432/postgres`

### Option 3 : Installation locale classique (PostgreSQL natif)
Si vous préférez installer PostgreSQL directement sur votre système (Windows/Mac/Linux).

1. Téléchargez et installez [PostgreSQL](https://www.postgresql.org/download/).
2. Ouvrez l'outil pgAdmin ou le terminal `psql`.
3. Créez une base de données nommée `magro`.
4. Dans le fichier `backend/.env`, configurez l'URL selon vos identifiants locaux :
   `DATABASE_URL=postgresql://postgres:votre_mot_de_passe_local@localhost:5432/magro`

---

## ⚙️ Configuration des variables d'environnement

### 1. Configuration Backend (`backend/.env`)

Dans le dossier `backend`, créez un fichier `.env` :

```env
# Connexion à la base de données PostgreSQL (Voir les options au-dessus)
DATABASE_URL=postgresql://...

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

# Activer/Désactiver le mode Mock (Simulateur sans backend)
# Mettez 'true' si vous n'arrivez pas à démarrer la base de données et voulez quand même tester l'interface.
VITE_MOCK_DATA_ENABLED=false
```

---

## 🟢 Lancement de l'application

### 1. Préparer et démarrer le Backend
Ouvrez un premier terminal :
```bash
cd backend

# 1. Générer le client Prisma
npx prisma generate

# 2. Créer les tables dans la base de données
npx prisma db push

# 3. Peupler la base de données avec des données de test
npm run prisma:seed

# 4. Lancer le serveur (tournera sur le port 4000)
npm run dev
```

### 2. Démarrer le Frontend
Ouvrez un second terminal :
```bash
cd frontend

# Démarrer le serveur React/Vite
npm run dev
```
L'application est maintenant accessible sur `http://localhost:5173` !

---

## 🚧 Dépannage (Problèmes fréquents)

### `Can't reach database server at localhost:5432`
- **Cause** : Votre base de données n'est pas allumée.
- **Solution** : Si vous utilisez Docker, vérifiez que Docker Desktop est ouvert et tapez `docker compose up -d postgres`. Si vous utilisez Supabase, assurez-vous que votre mot de passe dans `DATABASE_URL` est exact (sans crochets `[]`).

### `PrismaClientInitializationError` ou `Module not found: @prisma/client`
- **Cause** : Le client Prisma n'a pas été généré.
- **Solution** : Placez-vous dans le dossier `backend` et exécutez `npx prisma generate`.

### Les imports échouent lors du build Frontend (`npm run build`)
- **Cause** : Le cache de Vite peut conserver des anciens fichiers.
- **Solution** : Supprimez le dossier `node_modules/.vite` ou relancez l'installation avec `rm -rf node_modules package-lock.json && npm install`.

### L'application frontend affiche "Failed to fetch" ou reste bloquée au login
- **Cause** : Le frontend n'arrive pas à communiquer avec le backend (port incorrect ou backend éteint).
- **Solution** : Vérifiez que le backend tourne bien sans erreur sur le port 4000. Vous pouvez aussi passer temporairement `VITE_MOCK_DATA_ENABLED=true` dans `frontend/.env` pour tester l'interface sans le backend.
