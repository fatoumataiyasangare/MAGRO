# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Production-ready CI/CD pipeline with GitHub Actions (4 jobs: backend build, frontend build, CodeQL SAST, Gitleaks secret scanning)
- `SECURITY.md` — vulnerability reporting policy
- `CONTRIBUTING.md` — contribution guidelines
- `CHANGELOG.md` — project change log

### Changed
- **Backend routes**: Wrapped all `async` route handlers with `asyncHandler` middleware for centralized, consistent error handling (`orders.ts`, `contracts.ts`). Removed redundant manual `try/catch` blocks.
- **Database schema**: Added performance indexes on `Listing` (farmerId, region, createdAt), `Order` (buyerId, listingId, status), `Dispute` (orderId, openedBy, status), and `Message` (conversationId, senderId) models.

### Security
- **`.gitignore`** hardened: Added exclusion of `postgres.zip`, `pg_extracted/`, `*.zip`, and shell scripts (`start_db.sh`, `stop_db.sh`) to prevent large binaries and local config files from being pushed to remote.

### Fixed
- Resolved `git push` failure caused by a `postgres.zip` file (333 MB) exceeding GitHub's 100 MB file size limit. File removed from tracked commits.

---

## [0.1.0] - 2026-06-01

### Added
- Initial MVP of the MAGRO agricultural marketplace platform.
- Phone OTP authentication with 6-digit code, 5-minute expiry, and bcrypt hashing.
- Google OAuth login & signup flow.
- JWT access tokens + HttpOnly cookie refresh tokens with rotation and revocation.
- RBAC with roles: `BUYER`, `FARMER`, `COOPERATIVE`, `EXPERT`, `MODERATOR`, `ANALYST`, `SUPER_ADMIN`.
- Marketplace listing creation, update, and deletion with stock management.
- Order lifecycle management: creation, status updates, delivery confirmation, cancellation.
- Dispute system: opening, evidence tracking, and admin resolution.
- Real-time chat with Socket.IO (conversations + messages, unread count).
- Seasonal contracts between industrial buyers and farmers.
- Cooperative membership management.
- Expert certification system with badge levels (GOLD, SILVER).
- Availability alerts for buyers (crop/region-based notifications).
- Admin dashboard: user management, suspension, analytics export, API key management.
- Favorites system for buyers.
- Docker + Docker Compose setup for containerized deployment.
- Vite + React frontend with React Router.
- Zod input validation on all API endpoints.
- Helmet security headers and express-rate-limit on all routes.
- CORS and trusted origin middleware.

[Unreleased]: https://github.com/fatoumataiyasangare/MAGRO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fatoumataiyasangare/MAGRO/releases/tag/v0.1.0
