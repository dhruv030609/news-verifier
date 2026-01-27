# NewsVerifier - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm (`npm install -g pnpm`)
- MySQL 8+ ([Download](https://dev.mysql.com/downloads/mysql/))

### 2. Clone & Install
```bash
cd news-verifier
pnpm install
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p
# CREATE DATABASE news_verifier;
# EXIT;

# Create .env.local file with:
DATABASE_URL=mysql://root:your_password@localhost:3306/news_verifier
JWT_SECRET=dev-secret-key
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000/auth
OWNER_OPEN_ID=local-owner
OWNER_NAME=Local Developer
BUILT_IN_FORGE_API_URL=http://localhost:3000/api
BUILT_IN_FORGE_API_KEY=local-key
VITE_FRONTEND_FORGE_API_KEY=local-key
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000/api
VITE_ANALYTICS_ENDPOINT=http://localhost:3000/api/analytics
VITE_ANALYTICS_WEBSITE_ID=local

# Push schema
pnpm db:push
```

### 4. Start Development
```bash
pnpm dev
```

### 5. Open in Browser
```
http://localhost:3000
```

## 📝 Common Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm check        # Type check
pnpm format       # Format code
pnpm db:push      # Update database schema
```

## 🐳 Using Docker for MySQL (Optional)

```bash
docker run --name mysql-newsverifier \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=news_verifier \
  -p 3306:3306 \
  -d mysql:8.0

# Then use in .env.local:
# DATABASE_URL=mysql://root:root@localhost:3306/news_verifier
```

## 📁 Project Structure

```
client/          → React frontend (http://localhost:5173)
server/          → Express backend with tRPC (http://localhost:3000)
drizzle/         → Database schema
```

## ❓ Troubleshooting

**Port 3000 in use?**
```bash
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database connection error?**
- Check MySQL is running
- Verify DATABASE_URL in .env.local
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**Dependencies issue?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

For detailed setup, see **LOCAL_SETUP.md**
