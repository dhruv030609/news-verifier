# 🐳 NewsVerifier with Docker - Complete Setup Guide

This guide provides step-by-step instructions to run NewsVerifier with Docker for database management on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
4. [Database Access](#database-access)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Development Workflow](#development-workflow)

---

## Prerequisites

Before starting, ensure you have:

- **Docker Desktop** - [Download for Windows/Mac](https://www.docker.com/products/docker-desktop) or [Linux instructions](https://docs.docker.com/engine/install/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
# Check Docker
docker --version
# Output: Docker version 24.x.x

# Check Node.js
node --version
# Output: v18.x.x or higher

# Check pnpm
pnpm --version
# Output: 8.x.x or higher
```

---

## Quick Start (5 minutes)

### Step 1: Start Docker Containers

**On macOS/Linux:**
```bash
cd /path/to/news-verifier
chmod +x start-docker.sh
./start-docker.sh
```

**On Windows (PowerShell):**
```bash
cd C:\path\to\news-verifier
docker compose up -d
```

**On Windows (Command Prompt):**
```bash
cd C:\path\to\news-verifier
start-docker.bat
```

### Step 2: Configure Environment

```bash
# Copy the Docker environment template
cp .env.docker .env.local

# Edit .env.local with your Manus OAuth credentials
# (See section below for where to get these)
```

### Step 3: Set Up Database

```bash
# Install dependencies
pnpm install

# Create database tables
pnpm db:push
```

### Step 4: Start Development Server

```bash
# Start the app
pnpm dev

# Open browser to http://localhost:3000
```

---

## Detailed Setup

### 1. Install Docker

#### macOS
- Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- Run the installer
- Start Docker Desktop from Applications

#### Windows
- Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- Run the installer
- Restart your computer
- Start Docker Desktop

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

### 2. Clone or Download Project

```bash
# Clone the repository
git clone <your-repo-url> news-verifier
cd news-verifier

# Or if you already have the project
cd /path/to/news-verifier
```

### 3. Start MySQL Container

```bash
# Start containers in background
docker compose up -d

# Verify containers are running
docker compose ps
```

Expected output:
```
NAME                      STATUS
news-verifier-db          Up 2 minutes (healthy)
news-verifier-phpmyadmin  Up 2 minutes
```

### 4. Get Manus OAuth Credentials

1. Open your Manus project dashboard
2. Go to **Settings → Secrets**
3. Copy these values:
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL`
   - `VITE_OAUTH_PORTAL_URL`
   - `JWT_SECRET`
   - `OWNER_OPEN_ID`
   - `BUILT_IN_FORGE_API_KEY`
   - `BUILT_IN_FORGE_API_URL`
   - `VITE_FRONTEND_FORGE_API_KEY`
   - `VITE_FRONTEND_FORGE_API_URL`
   - `VITE_ANALYTICS_ENDPOINT`
   - `VITE_ANALYTICS_WEBSITE_ID`

### 5. Configure Environment

```bash
# Copy template
cp .env.docker .env.local

# Edit .env.local
# On macOS/Linux: nano .env.local
# On Windows: notepad .env.local

# Replace all "your_*_here" values with actual credentials from Manus
```

Example `.env.local`:
```env
DATABASE_URL=mysql://news_user:news_password@localhost:3306/news_verifier
VITE_APP_ID=abc123xyz
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=your-secret-key-here
OWNER_OPEN_ID=user-id-here
# ... other variables
```

### 6. Install Dependencies

```bash
pnpm install
```

### 7. Create Database Tables

```bash
pnpm db:push
```

This command:
- Generates migration files from your schema
- Applies migrations to the Docker MySQL database
- Creates all necessary tables

### 8. Start Development Server

```bash
pnpm dev
```

Output:
```
Server running on http://localhost:3000/
```

Open http://localhost:3000 in your browser!

---

## Database Access

### Via phpMyAdmin (Easiest)

1. Open http://localhost:8080
2. Login with:
   - **Username**: `root`
   - **Password**: `root`
3. Select database: `news_verifier`

### Via MySQL Command Line

```bash
# From your machine
mysql -h localhost -u news_user -p news_verifier
# Password: news_password

# Or via Docker
docker compose exec mysql mysql -u news_user -p news_verifier
# Password: news_password
```

### Via Application

The app automatically connects using:
```
DATABASE_URL=mysql://news_user:news_password@localhost:3306/news_verifier
```

---

## Docker Commands Reference

### Container Management

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View running containers
docker compose ps

# View logs
docker compose logs

# Follow logs in real-time
docker compose logs -f mysql

# Stop and remove all data
docker compose down -v
```

### Database Operations

```bash
# Access MySQL CLI
docker compose exec mysql mysql -u root -p
# Password: root

# Run a query
docker compose exec mysql mysql -u root -proot news_verifier -e "SHOW TABLES;"

# Backup database
docker compose exec mysql mysqldump -u root -proot news_verifier > backup.sql

# Restore database
docker compose exec mysql mysql -u root -proot news_verifier < backup.sql
```

### Troubleshooting

```bash
# Check container health
docker compose exec mysql mysqladmin ping -h localhost -u root -p
# Password: root

# View MySQL error log
docker compose logs mysql

# Rebuild containers
docker compose down -v
docker compose up -d --build
```

---

## Common Issues & Solutions

### Issue 1: "Port 3306 already in use"

**Solution**: Change the port in `docker-compose.yml`

```yaml
ports:
  - "3307:3306"  # Change first number
```

Then update `.env.local`:
```env
DATABASE_URL=mysql://news_user:news_password@localhost:3307/news_verifier
```

### Issue 2: "Cannot connect to Docker daemon"

**Solution**: Start Docker Desktop or Docker daemon

- macOS/Windows: Open Docker Desktop application
- Linux: `sudo systemctl start docker`

### Issue 3: "MySQL connection refused"

**Solution**: Wait for MySQL to be ready

```bash
# Check if MySQL is healthy
docker compose ps

# Wait for status to show "(healthy)"
# This may take 30-60 seconds on first start
```

### Issue 4: "Database tables don't exist"

**Solution**: Run database migrations

```bash
pnpm db:push
```

### Issue 5: "Permission denied" on Linux

**Solution**: Add user to docker group

```bash
sudo usermod -aG docker $USER
# Log out and log back in, or:
newgrp docker
```

### Issue 6: "Out of disk space"

**Solution**: Clean up Docker

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a
```

---

## Development Workflow

### Normal Development

```bash
# Terminal 1: Start Docker
docker compose up -d

# Terminal 2: Start dev server
pnpm dev

# Make changes to code
# Hot reload works automatically
```

### After Changing Database Schema

```bash
# 1. Edit drizzle/schema.ts
# 2. Push changes
pnpm db:push

# 3. Restart dev server if needed
# Ctrl+C to stop, then pnpm dev
```

### Running Tests

```bash
# Tests use the same Docker database
pnpm test

# Run specific test file
pnpm test server/analysisEngine.test.ts

# Watch mode
pnpm test --watch
```

### Building for Production

```bash
# Build the app
pnpm build

# Start production build
pnpm start

# Note: For production, use a managed database service
# Update DATABASE_URL in production environment
```

---

## File Structure

```
news-verifier/
├── docker-compose.yml      ← Docker configuration
├── mysql-init.sql         ← Database initialization script
├── .env.docker            ← Environment template (copy to .env.local)
├── .env.local             ← Your credentials (don't commit!)
├── start-docker.sh        ← macOS/Linux startup script
├── start-docker.bat       ← Windows startup script
├── DOCKER_SETUP.md        ← Detailed Docker guide
├── DOCKER_README.md       ← This file
│
├── client/                ← Frontend React app
│   ├── src/
│   │   ├── pages/        ← Page components
│   │   ├── components/   ← Reusable components
│   │   └── lib/          ← Utilities
│   └── public/           ← Static assets
│
├── server/                ← Backend Express app
│   ├── routers.ts        ← tRPC procedures
│   ├── db.ts             ← Database queries
│   └── analysisEngine.ts ← LLM analysis logic
│
├── drizzle/               ← Database schema
│   ├── schema.ts         ← Table definitions
│   └── migrations/       ← Migration files
│
└── package.json          ← Dependencies
```

---

## Production Deployment

For production, use a managed database service instead of Docker:

### Options

1. **AWS RDS** - https://aws.amazon.com/rds/
2. **Google Cloud SQL** - https://cloud.google.com/sql
3. **Azure Database** - https://azure.microsoft.com/services/mysql/
4. **DigitalOcean** - https://www.digitalocean.com/products/managed-databases/
5. **Heroku Postgres** - https://www.heroku.com/postgres

### Update Production DATABASE_URL

```env
# Example AWS RDS
DATABASE_URL=mysql://user:password@your-db.rds.amazonaws.com:3306/news_verifier

# Example Google Cloud SQL
DATABASE_URL=mysql://user:password@your-instance.cloudsql.net:3306/news_verifier
```

---

## Getting Help

### Check Logs

```bash
# View all logs
docker compose logs

# View MySQL logs only
docker compose logs mysql

# Follow logs in real-time
docker compose logs -f
```

### Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)
- [phpMyAdmin Docker Image](https://hub.docker.com/_/phpmyadmin)

### Contact Support

If you encounter issues:
1. Check the [Common Issues](#common-issues--solutions) section
2. Review Docker logs: `docker compose logs`
3. Check MySQL health: `docker compose ps`
4. Consult Docker documentation

---

## Summary

You now have:
- ✅ MySQL running in Docker
- ✅ phpMyAdmin for database management
- ✅ Development environment configured
- ✅ Database schema created
- ✅ App running on http://localhost:3000

**Happy coding! 🚀**
