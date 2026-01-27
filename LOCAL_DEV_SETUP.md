# NewsVerifier - Local Development Setup (Simplified)

This guide helps you run NewsVerifier locally **without needing OAuth setup**.

## ⚡ Quick Setup (3 steps)

### Step 1: Install Dependencies
```bash
cd news-verifier
pnpm install
```

### Step 2: Create `.env.local`
Create a file named `.env.local` in the project root with:

```
DATABASE_URL=mysql://root:root@localhost:3306/news_verifier
JWT_SECRET=dev-secret-key-change-this
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
```

### Step 3: Set Up Database & Run

```bash
# Create MySQL database
mysql -u root -p
# Type: CREATE DATABASE news_verifier;
# Type: EXIT;

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

## 🌐 Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You'll see a **"Dev Login"** button on the home page. Click it to log in without OAuth setup!

## 🐳 Using Docker for MySQL (Easier)

If you don't want to install MySQL locally, use Docker:

```bash
# Start MySQL in Docker
docker run --name mysql-newsverifier \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=news_verifier \
  -p 3306:3306 \
  -d mysql:8.0

# Then follow steps 2-3 above
```

## 🔑 What's Different in Development

- **Dev Login Button**: Appears on home page when running on `localhost`
- **Mock Authentication**: No OAuth required, instant login
- **Hot Reload**: Changes automatically refresh in browser
- **Full Features**: All features work the same as production

## 📝 Available Commands

```bash
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm test             # Run tests
pnpm check            # TypeScript type checking
pnpm format           # Format code
pnpm db:push          # Update database schema
```

## ❌ Troubleshooting

### "Port 3000 already in use"
```bash
# macOS/Linux - Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Can't connect to MySQL"
```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# If using Docker, check container is running
docker ps | grep mysql-newsverifier
```

### "pnpm install fails"
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Database schema error"
```bash
# Recreate database
mysql -u root -p
# DROP DATABASE news_verifier;
# CREATE DATABASE news_verifier;
# EXIT;

# Push schema again
pnpm db:push
```

## 📂 Project Structure

```
client/src/
  ├── pages/           # Page components
  ├── components/      # UI components
  ├── lib/trpc.ts      # tRPC client
  └── App.tsx          # Routes

server/
  ├── routers.ts       # API endpoints
  ├── db.ts            # Database queries
  ├── analysisEngine.ts # AI analysis logic
  └── _core/           # Framework code

drizzle/
  └── schema.ts        # Database schema
```

## 🚀 Next Steps

1. **Explore Pages**: Check `client/src/pages/` for UI code
2. **Add Features**: Create new tRPC procedures in `server/routers.ts`
3. **Modify Analysis**: Edit `server/analysisEngine.ts`
4. **Change Styles**: Update `client/src/index.css`

## 💡 Tips

- **Hot Reload**: Changes to frontend/backend automatically refresh
- **Database**: All data persists in MySQL
- **Tests**: Run `pnpm test` to verify changes
- **Type Safety**: Run `pnpm check` to catch TypeScript errors

## 🆘 Still Having Issues?

1. Ensure Node.js 18+ is installed: `node --version`
2. Ensure pnpm is installed: `pnpm --version`
3. Ensure MySQL is running
4. Check all environment variables in `.env.local`
5. Try clearing cache: `rm -rf node_modules && pnpm install`

---

**Happy coding! 🎉**
