# Adventure — Family Trip Planner

A web-first travel organization app focused on **family trip planning** before departure.

## Tech Stack

- **Frontend/API**: Next.js 15 (App Router) + TypeScript
- **Styling/UI**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Auth**: NextAuth.js (credentials)
- **Runtime**: Docker Compose

## Features

- 🗺️ **Trip Workspace** — Create, edit, and archive trips with travelers and notes
- 📅 **Itinerary Planner** — Destination stops, day-by-day planner, `LIGHT`/`MODERATE`/`BUSY` pace indicators
- 💰 **Budget Planner** — Planned/actual amounts by category with per-destination breakdown
- 📋 **Reservations & Documents** — Transport, lodging, activity records + passport/visa/insurance tracking with expiry warnings
- ✅ **Preparation Checklist** — Reusable templates, trip-specific items with priorities and due dates
- 🌏 **Regional Helpers** — Pre-seeded planning notes for France, Indonesia, and Philippines
- 📄 **Exports** — PDF itinerary, budget CSV, checklist CSV

## Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 20+ for local development

### Run with Docker Compose

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Build and start all services
docker compose up --build

# 3. Run database migrations
docker compose exec web npx prisma migrate deploy

# 4. Seed database with initial data (user, templates, regional notes)
docker compose exec -T web npm run db:seed

# 5. Open the app and login
open http://localhost:3000
```

### Default Login Credentials

After seeding the database, use these credentials to log in:

- **Email:** `admin@example.com`
- **Password:** `password123`

**⚠️ IMPORTANT:** Change these credentials immediately after first login, especially in production!

For more details, see [DATABASE_SETUP.md](DATABASE_SETUP.md).

```

### Optional: Database UI (Adminer)

```bash
docker compose --profile tools up -d adminer
# Open http://localhost:8080
```

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations (requires running PostgreSQL)
npm run db:migrate:dev

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://travel:travel@localhost:5432/travel_planner` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | *(required)* |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` |

## API Reference

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET/POST | `/api/trips` | List / create trips |
| GET/PATCH/DELETE | `/api/trips/:tripId` | Get / update / delete trip |
| GET/POST | `/api/trips/:tripId/travelers` | Manage travelers |
| GET/POST | `/api/trips/:tripId/stops` | Manage destination stops |
| PATCH | `/api/stops/:stopId/reorder` | Reorder a stop |
| GET/POST | `/api/trips/:tripId/days` | Manage itinerary days |
| GET/POST | `/api/days/:dayId/items` | Manage day activities |
| GET/POST | `/api/trips/:tripId/budget-items` | Manage budget items |
| GET | `/api/trips/:tripId/budget-summary` | Budget totals by category |
| GET/POST | `/api/trips/:tripId/reservations` | Manage reservations |
| GET/POST | `/api/trips/:tripId/documents` | Manage documents |
| GET/POST | `/api/trips/:tripId/checklist-items` | Manage checklist items |
| GET/POST | `/api/checklist-templates` | Manage checklist templates |
| GET | `/api/regional-notes?country=FR` | Regional planning notes |
| GET | `/api/export/:tripId/itinerary.pdf` | Download itinerary PDF |
| GET | `/api/export/:tripId/budget.csv` | Download budget CSV |
| GET | `/api/export/:tripId/checklist.csv` | Download checklist CSV |

## Domain Model

```
User → Trip → Traveler
            → DestinationStop → ItineraryDay → ItineraryItem
            → BudgetItem
            → Reservation
            → Document
            → ChecklistItem

ChecklistTemplate → ChecklistTemplateItem
RegionalNote
```

## Milestones

- [x] Foundation — Auth, schema, migrations, trip CRUD, responsive shell
- [x] Itinerary Core — Stops, day planner, reorder, pace markers
- [x] Budget — Planned/actual items + summaries
- [x] Docs & Reservations — Structured records + expiry warnings
- [x] Checklist + Regional Notes — Templates, trip tasks, FR/ID/PH helpers
- [x] Export + Stabilization — PDF/CSV exports