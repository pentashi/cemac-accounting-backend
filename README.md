# CEMAC-Compliant Accounting Backend

This project is a modular, production-grade backend for CEMAC-compliant accounting management, built with NestJS, TypeORM, and PostgreSQL. It is designed for enterprise use, with a focus on security, auditability, and extensibility.

## Key Features

- Secure JWT authentication with RBAC (admin/user roles)
- Modular architecture: invoices, partners, accounting, reporting, audit, notifications
- Comprehensive audit logging (login, CRUD, exports)
- Export/import for invoices, accounting entries, and partners (PDF, Excel, CSV)
- Password reset with email integration
- Notification system for key events
- Swagger API documentation at `/api-docs`
- Unit and e2e test coverage

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 13

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=cemac_db
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=3600s
# Optional override for TypeORM schema auto-sync (production default is already false).
DB_SYNCHRONIZE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=replace-with-your-twilio-auth-token
TWILIO_SMS_FROM=+1234567890
TWILIO_WHATSAPP_FROM=+14155238886
SMS_PROVIDER_URL=
WHATSAPP_PROVIDER_URL=
```

For local setup, copy `.env.example` to `.env` and fill in your real credentials. Do not commit real secrets.

### Database
- Run migrations or let TypeORM auto-sync entities (recommended for development only).

### Running the App

```bash
npm run start:dev
```

For production-style startup (used by `npm run start`), the app builds first and runs `dist/main`.

### API Documentation
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Testing
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Project Structure
- `src/auth` - Authentication & RBAC
- `src/invoice` - Invoicing
- `src/partner` - Clients & Suppliers
- `src/accounting` - Accounting entries
- `src/reporting` - Dashboards & statistics
- `src/audit` - Audit logging
- `src/notification` - Notifications

## Security & Production

- Use strong secrets and secure environment variables in production
- Set up HTTPS and proper CORS policies
- Regularly review audit logs for compliance
- Run all tests and monitor code coverage

## License

MIT
