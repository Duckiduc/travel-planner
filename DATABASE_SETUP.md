# Database Setup Guide

This document provides instructions for setting up and managing the database for the Travel Planner application.

## Prerequisites

- Docker and Docker Compose installed
- The application uses PostgreSQL 16 with Prisma ORM

## Initial Setup

### 1. Start the Services

```bash
docker compose up -d
```

This will start both the PostgreSQL database and the web application.

### 2. Run Database Migrations

Create and apply the database schema:

```bash
docker compose exec -T web npx prisma migrate dev --name init
```

For production deployments, use:

```bash
docker compose exec -T web npx prisma migrate deploy
```

### 3. Seed the Database

Populate the database with initial data (default user, checklist templates, and regional notes):

```bash
docker compose exec -T web npm run db:seed
```

Or directly:

```bash
docker compose exec -T web npx tsx prisma/seed.ts
```

### 4. Default Login Credentials

After seeding the database, you can log in with:

- **Email:** `admin@example.com`
- **Password:** `password123`

**⚠️ IMPORTANT:** Change these credentials immediately after first login, especially in production environments!

## Common Commands

### Create a New Migration

When you modify the Prisma schema:

```bash
docker compose exec -T web npx prisma migrate dev --name <migration_name>
```

### Reset the Database

**Warning: This will delete all data!**

```bash
docker compose exec -T web npx prisma migrate reset
```

### Open Prisma Studio

To browse and edit your database through a GUI:

```bash
docker compose exec web npx prisma studio
```

Then open http://localhost:5555 in your browser.

### Generate Prisma Client

After schema changes:

```bash
docker compose exec -T web npx prisma generate
```

### Access the Database via Adminer

Start Adminer (database management UI):

```bash
docker compose --profile tools up -d adminer
```

Then open http://localhost:8080 and use these credentials:
- **System:** PostgreSQL
- **Server:** db
- **Username:** travel
- **Password:** travel
- **Database:** travel_planner

## Database Schema Overview

The application uses the following main models:

- **User**: User accounts with authentication
- **Trip**: Main trip entity with status tracking
- **Traveler**: People included in a trip
- **DestinationStop**: Locations visited during a trip
- **ItineraryDay**: Daily schedules with items
- **BudgetItem**: Budget tracking and expenses
- **Reservation**: Bookings for transport, lodging, activities
- **Document**: Travel documents (passports, visas, insurance)
- **ChecklistItem**: Trip-specific checklist items
- **ChecklistTemplate**: Reusable checklist templates
- **RegionalNote**: Country/destination-specific travel tips

## Troubleshooting

### OpenSSL Errors

If you encounter OpenSSL-related errors with Prisma, ensure the Dockerfile includes:

```dockerfile
RUN apk add --no-cache openssl
```

Then rebuild:

```bash
docker compose build --no-cache web
```

### Migration Conflicts

If migrations are out of sync:

1. Check the current migration status:
   ```bash
   docker compose exec -T web npx prisma migrate status
   ```

2. Resolve conflicts by either:
   - Applying pending migrations: `npx prisma migrate deploy`
   - Resetting the database: `npx prisma migrate reset`

### Connection Issues

If the web service can't connect to the database:

1. Check that the database is healthy:
   ```bash
   docker compose ps
   ```

2. Verify the DATABASE_URL environment variable in docker-compose.yml:
   ```
   postgresql://travel:travel@db:5432/travel_planner
   ```

3. Restart the services:
   ```bash
   docker compose restart
   ```

## Environment Variables

The following environment variables are used for database configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_USER`: Database user (default: travel)
- `POSTGRES_PASSWORD`: Database password (default: travel)
- `POSTGRES_DB`: Database name (default: travel_planner)

## Backup and Restore

### Create a Backup

```bash
docker compose exec -T db pg_dump -U travel travel_planner > backup.sql
```

### Restore from Backup

```bash
docker compose exec -T db psql -U travel travel_planner < backup.sql
```

## Production Considerations

1. **Change default credentials** in docker-compose.yml
2. Use **strong passwords** for POSTGRES_PASSWORD and NEXTAUTH_SECRET
3. Enable **SSL connections** for the database
4. Set up **regular backups**
5. Use `prisma migrate deploy` instead of `migrate dev`
6. Monitor database performance and connection pools

## Seeded Data

The seed script populates:

1. **Default User**: Admin user with email `admin@example.com` and password `password123`
2. **Checklist Template**: "Family Packing List" with 12 essential items
3. **Regional Notes**: 12 travel tips for France, Indonesia, and Philippines

You can modify the seed data in `prisma/seed.ts`.

### Changing Default Credentials

For production, update the seed file to use strong credentials or remove the default user creation entirely and implement a proper user registration flow.