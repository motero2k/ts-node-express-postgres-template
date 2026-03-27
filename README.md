# Express TypeScript Boilerplate

A layered Express API boilerplate with TypeScript, PostgreSQL, and Prisma (Requires Node.js 24+).

## Scripts

- `npm install` — Install dependencies
- `npm run dev` — Start in development mode
- `npm run build` — Compile TypeScript to JavaScript
- `npm run start` — Start compiled app
- `npx prisma migrate dev` — Create/apply local database migrations
- `npx prisma generate` — Generate Prisma client

## Docker

Development with Docker Compose (recommended):

```bash
docker compose -f compose.dev.yml up --build --remove-orphans -d
npm run prisma:generate
npm run prisma:migrate -- --name init
```

Run tests (requires a reachable PostgreSQL instance via DATABASE_URL):

```bash
npm test
```

Stop and remove containers:

```bash
docker compose -f compose.dev.yml down
```

Production-like local image:

Build image:

```bash
docker build -t template:local .
```

Run container:

```bash
docker run --rm --name template \
 -p 3000:3000 \
 -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/template" \
 -e PORT=3000 \
 template:local
```

## Features

- OAS Telemetry middleware with in-memory traces, logs, and metrics
- Swagger API documentation
- Centralized error handling
- Standardized API responses
- Environment variable management with dotenv
- PostgreSQL integration with Prisma
- Structured logging with tags
- Layered architecture (routes, controllers, services, models)
- TypeScript for type safety
- ESLint and Prettier for code quality and formatting
- Unit tests with Vitest
- GitHub Actions CI/CD pipeline
- Health check endpoint
- Husky pre-commit hooks
- Dockerfile for containerization
- Request validation with Express Validator
- Helmet for security headers
