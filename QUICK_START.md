# Quick Start Reference

## 🚀 Getting Started

### Start the Application

```bash
docker compose up -d
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## 🔐 Default Login Credentials

After running the database seed:

- **Email:** `admin@example.com`
- **Password:** `password123`

> ⚠️ **IMPORTANT:** Change these credentials immediately after first login!

---

## 📦 Database Setup

### Initial Setup (First Time Only)

```bash
# 1. Start services
docker compose up -d

# 2. Run migrations
docker compose exec -T web npx prisma migrate deploy

# 3. Seed database (creates default user + templates)
docker compose exec -T web npm run db:seed
```

### Reset Database (⚠️ Deletes all data!)

```bash
docker compose exec -T web npx prisma migrate reset
```

---

## 🛠️ Common Commands

### Docker Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f web

# Rebuild after code changes
docker compose up -d --build
```

### Database Operations

```bash
# Run migrations
docker compose exec -T web npx prisma migrate deploy

# Create new migration
docker compose exec -T web npx prisma migrate dev --name <migration_name>

# Seed database
docker compose exec -T web npm run db:seed

# Open Prisma Studio (Database GUI)
docker compose exec web npx prisma studio
# Then open http://localhost:5555
```

### Database Access (Adminer)

```bash
# Start Adminer
docker compose --profile tools up -d adminer

# Open http://localhost:8080 and use:
# - System: PostgreSQL
# - Server: db
# - Username: travel
# - Password: travel
# - Database: travel_planner
```

### Direct Database Queries

```bash
# Connect to PostgreSQL
docker compose exec -T db psql -U travel travel_planner

# Run SQL query
docker compose exec -T db psql -U travel travel_planner -c "SELECT * FROM \"User\";"
```

---

## 📚 Key Features

- **Trip Planning** - Create and manage family trips
- **Itinerary** - Day-by-day planning with destination stops
- **Budget Tracking** - Planned vs actual expenses
- **Reservations** - Transport, lodging, and activities
- **Documents** - Passports, visas, insurance tracking
- **Checklist** - Packing lists and preparation tasks
- **Regional Notes** - Pre-seeded travel tips for France, Indonesia, Philippines
- **Export** - PDF itineraries, CSV budgets and checklists

---

## 🔍 Troubleshooting

### Application won't start

```bash
# Check service status
docker compose ps

# View logs
docker compose logs web

# Restart services
docker compose restart
```

### Database connection issues

```bash
# Check database health
docker compose ps

# Restart database
docker compose restart db

# Verify connection
docker compose exec -T db pg_isready -U travel
```

### OpenSSL/Prisma errors

```bash
# Rebuild with fresh dependencies
docker compose down
docker compose build --no-cache web
docker compose up -d
```

### Port already in use

```bash
# Change port in docker-compose.yml
# Change "3000:3000" to "3001:3000" for web
# Change "8080:8080" to "8081:8080" for adminer
```

---

## 📖 Documentation

- **Full Setup Guide:** [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Project README:** [README.md](README.md)
- **Prisma Schema:** [prisma/schema.prisma](prisma/schema.prisma)

---

## 🔒 Security Notes

1. **Change default credentials** after first login
2. **Update environment variables** in production:
   - `NEXTAUTH_SECRET` - Use a strong random string
   - `POSTGRES_PASSWORD` - Change from default
3. **Never commit** `.env` files to version control
4. **Enable SSL** for database connections in production
5. **Set up proper backup** procedures for production data

---

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Main application |
| Adminer | http://localhost:8080 | Database management UI |
| Prisma Studio | http://localhost:5555 | Database browser (when running) |

---

## 💡 Tips

- Use `docker compose logs -f web` to watch application logs in real-time
- Press `Ctrl+C` to stop following logs
- Use `-T` flag with `docker compose exec` when running non-interactive commands
- Regular backups: `docker compose exec -T db pg_dump -U travel travel_planner > backup.sql`
- Restore from backup: `docker compose exec -T db psql -U travel travel_planner < backup.sql`

---

**Need more help?** Check the full documentation in [DATABASE_SETUP.md](DATABASE_SETUP.md)