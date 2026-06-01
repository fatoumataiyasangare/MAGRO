# Rapport de securite final MAGRO

Date: 2026-05-31

## Score

Score de securite apres corrections: 88/100.

Critiques restantes: 0.
Elevees restantes: 0.

## Vulnerabilites corrigees

| Gravite | Constat | Correction appliquee |
| --- | --- | --- |
| Critique | Secrets et mots de passe Docker par defaut | `docker-compose.yml` exige maintenant des variables d'environnement fortes et ne publie PostgreSQL/backend que sur `127.0.0.1`. |
| Critique | Refresh tokens stockes en clair | Remplacement par `tokenHash` SHA-256, rotation a chaque refresh, revocation et detection de reutilisation. |
| Critique | Elevation de privilege par modification libre de role | RBAC via `requireRole`, roles privilegies non auto-attribuables, routes sensibles restreintes. |
| Elevee | JWT avec secrets faibles/fallbacks | Secrets obligatoires en production, issuer/audience/algorithme explicites, access token court. |
| Elevee | OTP logge et insuffisamment limite | Suppression des logs OTP en clair, hash bcrypt cost 12, limite de demandes par telephone. |
| Elevee | Parametres de route non valides | Validation UUID/whitelist via Zod sur listings, orders, admin, certifications, contracts, chat. |
| Elevee | Socket.IO sans authentification | Authentification JWT handshake, validation des rooms/messages et logs securite. |
| Elevee | Vite vulnerable (`<=6.4.1`) | Mise a jour vers Vite `6.4.2`; `npm audit --audit-level=high` retourne 0 vulnerabilite. |
| Moyenne | Headers web incomplets | Helmet CSP/referrer/CORP cote API et CSP/HSTS/clickjacking/nosniff cote Nginx. |
| Moyenne | Stockage persistant de l'access token | Token d'acces garde en memoire, refresh par cookie HttpOnly/Secure/SameSite=Strict. |
| Moyenne | Reponses d'erreurs trop techniques | Messages client generiques, details conserves uniquement dans les logs serveur rediges. |
| Moyenne | Images Docker trop permissives | Node 22, utilisateur non-root backend, nginx unprivileged, `read_only`, `tmpfs`, `no-new-privileges`. |
| Moyenne | Pipeline sans gate securite | Workflow GitHub Actions ajoute: build, npm audit, secret scan Gitleaks, CodeQL. |

## Verifications executees

- Backend: `npm run build` OK.
- Frontend: `npm run build` OK.
- Backend: `npm audit --audit-level=high` OK, 0 vulnerabilite.
- Frontend: `npm audit --audit-level=high` OK, 0 vulnerabilite.
- Prisma client regenere avec le schema courant.

## Points residuels acceptables

- TLS 1.3 et chiffrement AES-256 au repos dependent du reverse proxy, du cloud provider et de PostgreSQL managed storage. La configuration applicative force HTTPS en production derriere proxy.
- La 2FA est presente sous forme OTP de connexion. Pour une authentification mot de passe plus OTP, il faudra ajouter un parcours mot de passe explicite et une table de facteurs MFA.
- Le secret scan Gitleaks est integre au CI; son execution locale depend du telechargement de l'action/outil.
