# CEMAC Accounting Backend
Production-ready NestJS backend for CEMAC-aligned accounting workflows, invoicing, reporting, and auditability.

## Badges
[![Build Status](https://github.com/pentashi/cemac-accounting-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/pentashi/cemac-accounting-backend/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-lightgrey.svg)
![Coverage](https://img.shields.io/badge/coverage-not%20published-lightgrey.svg)

## Overview
CEMAC Accounting Backend is a modular API built with NestJS, TypeORM, and PostgreSQL.
It centralizes invoice lifecycle management, partner management, accounting entries, user authentication, and audit logs in one service.
The project exists to give accounting teams and product teams a backend that is compliant-oriented, extensible, and observable in production.
It is for engineering teams building finance platforms for CEMAC markets.

## Architecture Overview
```text
Clients (Web/Mobile/Admin)
        |
        v
   NestJS API (Controllers + Guards)
        |
        +--> Auth + OTP (JWT, Redis, EncryptionService, AuthMessageService)
        +--> Domain Modules (Invoice, Partner, Accounting, Reporting, Settings, Notifications)
        +--> Audit Module (cross-cutting action logging)
        |
        v
 PostgreSQL (TypeORM entities)
        |
        +--> Redis (OTP/rate-limit store; in-memory fallback when Redis host is not set)
        +--> SMTP / Twilio / Webhook providers (message delivery)
```

### Tech Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis (with in-memory fallback)
- **Authentication**: JWT with role-based access control (RBAC)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with e2e and unit tests
- **CI/CD**: GitHub Actions
- **Message Delivery**: SMTP, Twilio, Webhook providers

## Key Engineering Decisions
- **JWT + RBAC**: Token-based authentication with role-based authorization for secure access control
- **Audit Logging**: Comprehensive audit trail for compliance and security monitoring
- **OTP Security**: Encrypted one-time passwords with Redis-based rate limiting
- **Rate Limiting**: Redis-backed request throttling to prevent abuse
- **Swagger/OpenAPI**: Interactive API documentation for easier integration and testing
- **PostgreSQL**: Robust relational database with ACID compliance for financial data
- **Automated Testing**: Jest-based unit and e2e tests for reliability
- **CI/CD Pipeline**: GitHub Actions for automated testing and builds

## Key Features
- Enforces JWT auth plus role-based access control for admin/user permissions.
- Supports full invoice lifecycle: calculate, create, update status, register payments, and export.
- Manages clients and suppliers with CSV import and PDF/Excel/CSV export.
- Produces accounting statements (balance, balance sheet, income statement) and date/account/type filtering.
- Captures audit trails for login, registration, exports, and reporting actions.
- Delivers OTP verification and password reset codes through SMTP, Twilio, or webhook providers.
- Exposes OpenAPI/Swagger docs for faster integration and API validation.

## Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 13+
- Redis (recommended for OTP durability and shared rate limiting)

## Installation & Quick Start
```bash
git clone https://github.com/pentashi/cemac-accounting-backend.git
cd cemac-accounting-backend
npm install
cp .env.example .env
npm run start:dev
```

Open Swagger UI at `http://localhost:3000/api-docs`.

## Configuration
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `PORT` | number | `3000` | HTTP port for the NestJS server. |
| `NODE_ENV` | string | `development` | Environment mode used for runtime behavior (e.g., DB sync default). |
| `DB_HOST` | string | - | PostgreSQL host. |
| `DB_PORT` | number | `5432` | PostgreSQL port. |
| `DB_USER` | string | - | PostgreSQL username. |
| `DB_PASSWORD` | string | - | PostgreSQL password. |
| `DB_NAME` | string | - | PostgreSQL database name. |
| `DB_SYNCHRONIZE` | boolean | `true` outside production | Explicit TypeORM schema sync override. |
| `JWT_SECRET` | string | `defaultsecret` in JWT strategy fallback | JWT signing secret (required in production). |
| `JWT_EXPIRES_IN` | string | - | JWT token TTL passed to `jsonwebtoken` (example: `3600s`). |
| `MAIL_HOST` | string | - | SMTP server host. |
| `MAIL_PORT` | number | `587` | SMTP server port. |
| `MAIL_SECURE` | boolean | `true` when port is `465`, else `false` | SMTP TLS mode. |
| `MAIL_USERNAME` | string | - | SMTP auth username and fallback sender address. |
| `MAIL_PASSWORD` | string | - | SMTP auth password. |
| `MAIL_FROM_NAME` | string | empty | Sender display name. |
| `MAIL_FROM_ADDRESS` | string | `MAIL_USERNAME` | Sender email address. |
| `FRONTEND_URL` | string | `http://localhost:3000` | Base URL used in password reset links. |
| `TWILIO_ACCOUNT_SID` | string | - | Twilio account SID for SMS/WhatsApp delivery. |
| `TWILIO_AUTH_TOKEN` | string | - | Twilio auth token. |
| `TWILIO_SERVICE_SID` | string | - | Twilio Messaging Service SID. |
| `SMS_PROVIDER_URL` | string | - | Webhook fallback endpoint for SMS delivery when Twilio is unavailable. |
| `WHATSAPP_PROVIDER_URL` | string | - | Webhook fallback endpoint for WhatsApp delivery when Twilio is unavailable. |
| `REDIS_HOST` | string | unset | Redis host; when unset, OTP storage uses in-memory fallback. |
| `REDIS_PORT` | number | `6379` | Redis port. |
| `REDIS_USER` | string | empty | Redis username. |
| `REDIS_PASSWORD` | string | empty | Redis password. |
| `REDIS_TTL` | number | `3600` | Default Redis TTL for key writes in seconds. |
| `OTP_ENCRYPTION_ALGORITHM` | string | `aes-256-gcm` | OTP encryption algorithm. |
| `OTP_ENCRYPTION_KEY` | hex string | derived from `JWT_SECRET` if missing | 64-char hex key for OTP encryption. |
| `OTP_ENCRYPTION_FALLBACK_SALT` | string | SHA-256-derived value from JWT secret | Salt used when deriving OTP key from JWT secret. |
| `OTP_IV_LENGTH` | number | `16` | IV byte length for OTP encryption payloads. |
| `OTP_SALT_LENGTH` | number | `64` | Salt byte length used in OTP key derivation. |
| `OTP_TAG_LENGTH` | number | `16` | GCM auth tag byte length. |
| `OTP_KEY_LENGTH` | number | `32` | Derived key length in bytes. |
| `OTP_PBKDF2_ITERATIONS` | number | `100000` | PBKDF2 iteration count for OTP encryption/decryption. |
| `OTP_EXPIRY` | number | `300` | OTP expiration in seconds. |
| `OTP_MAX_ATTEMPTS` | number | `3` | Max resend attempts in rate limit window. |
| `OTP_PREFIX` | string | `otp:` | Redis key prefix for OTP payloads. |
| `OTP_RATE_LIMIT_PREFIX` | string | `rate_limit:` | Redis key prefix for OTP request counters. |
| `OTP_RATE_LIMIT_WINDOW` | number | `900` | OTP rate-limit window in seconds. |

## Usage Examples
### 1) Register, verify account, and log in
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "raisonSociale":"ACME SARL",
    "emailProfessionnel":"finance@acme.cm",
    "telephone":"+237600000000",
    "motDePasse":"StrongP@ssw0rd",
    "confirmerMotDePasse":"StrongP@ssw0rd",
    "role":"user"
  }'

# Send verification code (manual step)
curl -X POST http://localhost:3000/auth/envoyer-code-verification \
  -H "Content-Type: application/json" \
  -d '{"emailProfessionnel":"finance@acme.cm","canal":"email"}'

# Verify received code
curl -X POST http://localhost:3000/auth/verifier-code \
  -H "Content-Type: application/json" \
  -d '{"emailProfessionnel":"finance@acme.cm","code":"123456"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailProfessionnel":"finance@acme.cm","motDePasse":"StrongP@ssw0rd"}'
```

### 2) Create an invoice with bearer auth
```bash
# Replace <bearer-token-header> with a valid bearer auth header
curl -X POST http://localhost:3000/facture \
  -H "<bearer-token-header>" \
  -H "Content-Type: application/json" \
  -d '{
    "reference":"FAC-2026-0001",
    "clientId":1,
    "dateEmission":"2026-05-01",
    "dateEcheance":"2026-05-31",
    "devise":"XAF",
    "lignes":[
      {"description":"Audit comptable","quantite":1,"prixUnitaire":150000,"tva":19.25}
    ]
  }'
```

### 3) Export accounting entries
```bash
# Replace <bearer-token-header> with a valid bearer auth header
curl -L "http://localhost:3000/ecriture/export?format=csv" \
  -H "<bearer-token-header>" \
  -o ecritures.csv
```

## API Reference
- Interactive OpenAPI docs: `GET /api-docs`
- Authentication: bearer JWT in the `Authorization` header.

Core route groups:
- `POST /auth/*` — authentication, account verification, password reset
- `GET|POST|PATCH|DELETE /users/*` — user lifecycle and profile updates
- `GET|POST|PATCH|DELETE /facture/*` — invoice lifecycle and exports
- `GET|POST|PATCH|DELETE /partner/*` — client/supplier management and import/export
- `GET|POST /ecriture/*` — accounting entries, statements, and exports
- `GET /reporting/*` — sales, purchases, and performance reports
- `GET /audit-logs/*` — audit trail retrieval
- `GET|POST|PATCH /notifications/*` — user notifications
- `GET|PUT /settings` — application settings

## Testing
Run locally:
```bash
npm test -- --runInBand
npm run test:e2e
npm run test:cov
npm run build
```

## Deployment
- Set `NODE_ENV=production` and explicitly set `DB_SYNCHRONIZE=false`.
- Inject secrets through a secure secret manager; never bake secrets into images.
- Use managed PostgreSQL with automated backups and point-in-time recovery.
- Use Redis in production for OTP consistency across instances.
- Enforce TLS at the ingress/load balancer and restrict CORS origins.
- Add centralized log aggregation and alerting for authentication and audit events.
- Run CI (`npm test`, `npm run build`) on every merge to `main`.

## Contributing
1. Create a branch from `main` using: `feature/<ticket-or-scope>-<short-description>`.
2. Keep changes scoped and atomic; update tests and docs when behavior changes.
3. Run `npm run build` and `npm test -- --runInBand` before opening a PR.
4. Open a pull request with a clear summary, risk notes, and rollback plan.
5. Request at least one review before merge.

Code standards:
- TypeScript + NestJS conventions.
- ESLint + Prettier via repository scripts.
- Keep API contracts explicit through DTOs and Swagger decorators.

## Security
Report vulnerabilities through GitHub Security Advisories for this repository.
Do not open public issues for security defects that expose exploitable details.
Include reproduction steps, impact assessment, and suggested remediation when reporting.

## License
UNLICENSED
