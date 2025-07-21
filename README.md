# NestJS Production Boilerplate

A comprehensive, production-ready NestJS boilerplate with best practices, modular architecture, and industry-standard approaches.

## Features

✅ **Core Features**

- NestJS with TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication & Authorization
- Role-based Access Control (RBAC)
- Centralized Error Handling
- Request/Response Transformation
- API Versioning
- Swagger Documentation

✅ **Security & Performance**

- Helmet for security headers
- CORS configuration
- Rate limiting with Throttler
- Request validation with class-validator
- Password hashing with bcrypt
- Input sanitization

✅ **Monitoring & Logging**

- Centralized logging system
- Health checks with Terminus
- Request/Response logging
- Error tracking

✅ **Development Experience**

- Hot reload in development
- Docker & Docker Compose
- Database migrations & seeding
- Comprehensive test setup
- ESLint & Prettier configuration
- Environment validation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd nestjs-boilerplate
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Update environment variables in .env
   ```

3. **Database setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # Seed database
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## API Documentation

Access Swagger documentation at: `http://localhost:3000/docs`

## Project Structure

```
src/
├── common/           # Shared utilities, filters, interceptors
├── config/          # Configuration files
├── database/        # Database connection and services
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── users/       # Users module
│   └── health/      # Health check module
├── app.module.ts    # Root application module
└── main.ts          # Application entry point
```

## Authentication

### Default Users

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

### Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/profile` - Get user profile (protected)

## Available Scripts

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build application
npm run start:prod     # Start production server

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run format         # Run Prettier
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

This project is licensed under the MIT License.
