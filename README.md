# MAGRO

Marketplace Agricole pour le Mali - Application web moderne avec React, Express, PostgreSQL et Docker.

Le projet original est disponible sur [Figma](https://www.figma.com/design/1Lbosqe9oH6caqNqN86F0I/MAGRO).

## Structure du Projet

```
MAGRO/
├── frontend/               # Application React (Vite)
│   ├── src/               # Code source React
│   ├── Dockerfile         # Configuration Docker pour le frontend
│   ├── nginx.conf         # Configuration Nginx
│   ├── package.json       # Dépendances frontend
│   └── .env              # Variables d'environnement frontend
├── backend/               # API Express (Node.js)
│   ├── src/              # Code source backend
│   ├── prisma/           # Schema Prisma
│   ├── Dockerfile        # Configuration Docker pour le backend
│   ├── package.json      # Dépendances backend
│   └── .env             # Variables d'environnement backend
├── docker-compose.yml    # Orchestration Docker
└── README.md            # Ce fichier
```

## Démarrage avec Docker

### Prérequis

- Docker Desktop installé
- Docker Compose installé

### Démarrage rapide

```bash
# Cloner le repository
git clone <repository-url>
cd MAGRO

# Démarrer tous les services
docker-compose up --build

# L'application sera accessible sur:
# - Frontend: http://localhost
# - Backend API: http://localhost:4000
# - PostgreSQL: localhost:5432
```

### Arrêter les services

```bash
docker-compose down
```

### Voir les logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Développement Local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur http://localhost:5173

### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend sera accessible sur http://localhost:4000

### Base de Données PostgreSQL

```bash
# Installer PostgreSQL localement
# Créer la base de données
createdb magro

# Exécuter les migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

## Configuration

### Variables d'Environnement Frontend (frontend/.env)

```bash
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_MOCK_DATA_ENABLED=true
VITE_SMS_API_ENABLED=false
VITE_GOOGLE_AUTH_ENABLED=false
```

### Variables d'Environnement Backend (backend/.env)

```bash
DATABASE_URL=postgresql://magro_user:magro_password@localhost:5432/magro
PORT=4000
NODE_ENV=development
JWT_SECRET=magro-dev-secret-key-change-in-production-12345
CLIENT_ORIGIN=http://localhost:5173
```

## Fonctionnalités

- ✅ Authentification par téléphone avec OTP
- ✅ Validation des numéros maliens
- ✅ Marketplace de produits agricoles
- ✅ Dashboard agriculteur
- ✅ Gestion des commandes
- ✅ Chat en temps réel
- ✅ Mode développement intelligent (données mockées)
- ✅ Bascule automatique entre API réelle et mode simulé

## Documentation

- [Guide d'intégration des APIs](API_INTEGRATION.md) - Instructions pour brancher les APIs réelles
- [Rapport d'audit](AUDIT_REPORT.md) - Rapport complet de l'audit du projet

## Technologies

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Express, TypeScript, Prisma, Socket.io
- **Database**: PostgreSQL
- **Containerization**: Docker, Docker Compose, Nginx

## Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur le repository.
