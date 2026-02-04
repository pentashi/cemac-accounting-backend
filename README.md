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
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM=no-reply@example.com
FRONTEND_URL=http://localhost:3000
```

### Database
- Run migrations or let TypeORM auto-sync entities (recommended for development only).

### Running the App

```bash
npm run start:dev
```

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
