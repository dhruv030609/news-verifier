# Docker Setup Guide for NewsVerifier

This guide explains how to run the NewsVerifier platform with Docker for database management.

## Prerequisites

- **Docker** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **Node.js 18+** ([Download](https://nodejs.org/))
- **pnpm** (`npm install -g pnpm`)

## Quick Start with Docker

### 1. Start MySQL Container

```bash
# Navigate to project directory
cd /path/to/news-verifier

# Start Docker containers (MySQL + phpMyAdmin)
docker-compose up -d

# Verify containers are running
docker-compose ps
```

You should see:
- `news-verifier-db` (MySQL) - running on port 3306
- `news-verifier-phpmyadmin` (phpMyAdmin) - running on port 8080

### 2. Configure Environment Variables

```bash
# Copy Docker environment template
cp .env.docker .env.local

# Edit .env.local with your Manus OAuth credentials
# Replace these placeholders:
# - your_app_id_here
# - your_jwt_secret_here
# - your_owner_open_id_here
# - your_forge_api_key_here
# - etc.
```

### 3. Set Up Database Schema

```bash
# Install dependencies
pnpm install

# Push database schema (creates tables)
pnpm db:push

# Verify tables were created
# Visit: http://localhost:8080
# Login: root / root
# Database: news_verifier
```

### 4. Start Development Server

```bash
# Start the app (port 3000)
pnpm dev

# Open in browser
# http://localhost:3000
```

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs

# MySQL only
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f
```

### Access MySQL Directly
```bash
docker-compose exec mysql mysql -u root -p news_verifier
# Password: root
```

### Restart Services
```bash
docker-compose restart
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

## Database Access

### Via phpMyAdmin (Web UI)
- **URL**: http://localhost:8080
- **Username**: root
- **Password**: root
- **Database**: news_verifier

### Via MySQL CLI
```bash
# From your machine
mysql -h localhost -u news_user -p news_verifier
# Password: news_password

# Or via Docker
docker-compose exec mysql mysql -u news_user -p news_verifier
# Password: news_password
```

### Via Application
The app automatically connects using credentials in `.env.local`:
```
DATABASE_URL=mysql://news_user:news_password@localhost:3306/news_verifier
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs mysql

# Rebuild containers
docker-compose down -v
docker-compose up -d --build
```

### Port Already in Use
If port 3306 or 8080 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # Change 3306 to 3307
```

Then update `.env.local`:
```
DATABASE_URL=mysql://news_user:news_password@localhost:3307/news_verifier
```

### Connection Refused
```bash
# Wait for MySQL to be ready
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
# Password: root

# If it fails, check container status
docker-compose ps
```

### Data Persistence
- Database data is stored in Docker volume `mysql_data`
- Data persists between container restarts
- To reset data: `docker-compose down -v`

## Environment Variables

### Database Connection
- `DATABASE_URL`: MySQL connection string

### OAuth (from Manus)
- `VITE_APP_ID`: Your OAuth app ID
- `OAUTH_SERVER_URL`: Manus OAuth backend
- `VITE_OAUTH_PORTAL_URL`: Manus login portal
- `JWT_SECRET`: Session signing secret
- `OWNER_OPEN_ID`: Your Manus user ID

### Manus APIs
- `BUILT_IN_FORGE_API_KEY`: Server-side API key
- `BUILT_IN_FORGE_API_URL`: API endpoint
- `VITE_FRONTEND_FORGE_API_KEY`: Client-side API key
- `VITE_FRONTEND_FORGE_API_URL`: API endpoint

## Development Workflow

### Normal Development
```bash
# Terminal 1: Start Docker
docker-compose up -d

# Terminal 2: Start dev server
pnpm dev

# App runs on http://localhost:3000
# Database on localhost:3306
# phpMyAdmin on http://localhost:8080
```

### After Schema Changes
```bash
# Update schema in drizzle/schema.ts
# Then push changes
pnpm db:push

# Restart dev server if needed
# Ctrl+C to stop, then pnpm dev
```

### Running Tests
```bash
# Tests use the same database
pnpm test

# Tests run against localhost:3306
```

## Production Deployment

For production, use a managed database service:
- AWS RDS
- Google Cloud SQL
- Azure Database for MySQL
- DigitalOcean Managed Databases

Update `DATABASE_URL` in production environment variables.

## File Structure

```
news-verifier/
├── docker-compose.yml       ← Docker configuration
├── mysql-init.sql          ← Database initialization
├── .env.docker             ← Docker environment template
├── .env.local              ← Your actual credentials (don't commit)
├── drizzle/
│   └── schema.ts          ← Database schema
├── server/
│   └── db.ts              ← Database queries
└── pnpm-lock.yaml         ← Dependencies lock file
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)
- [phpMyAdmin Docker Image](https://hub.docker.com/_/phpmyadmin)
