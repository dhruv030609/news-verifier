# NewsVerifier - Local Development Setup Guide

This guide will help you run the NewsVerifier platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v9 or higher) - Install with: `npm install -g pnpm`
- **MySQL** (v8 or higher) or **MariaDB** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Clone or Download the Project

```bash
# If you have git
git clone <repository-url>
cd news-verifier

# Or if you downloaded as ZIP, extract and navigate to the folder
cd news-verifier
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required npm packages for both frontend and backend.

## Step 3: Set Up the Database

### Option A: Using Local MySQL

1. **Start MySQL Server** (if not already running)
   ```bash
   # macOS (using Homebrew)
   brew services start mysql
   
   # Windows (using Command Prompt as Administrator)
   net start MySQL80
   
   # Linux (Ubuntu/Debian)
   sudo systemctl start mysql
   ```

2. **Create a Database**
   ```bash
   mysql -u root -p
   # Enter your MySQL root password
   
   # In MySQL prompt:
   CREATE DATABASE news_verifier;
   EXIT;
   ```

3. **Create a `.env.local` file** in the project root:
   ```bash
   # Create the file
   touch .env.local
   ```

4. **Add the following environment variables** to `.env.local`:
   ```
   DATABASE_URL=mysql://root:your_password@localhost:3306/news_verifier
   JWT_SECRET=your-secret-key-here-change-this
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

### Option B: Using Docker (Recommended)

If you have Docker installed, you can run MySQL in a container:

```bash
# Start MySQL container
docker run --name mysql-newsverifier \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=news_verifier \
  -p 3306:3306 \
  -d mysql:8.0

# Update DATABASE_URL in .env.local:
# DATABASE_URL=mysql://root:root@localhost:3306/news_verifier
```

## Step 4: Set Up the Database Schema

Run the database migrations:

```bash
pnpm db:push
```

This will create all necessary tables in your database.

## Step 5: Start the Development Server

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Express server with tRPC)

The dev server will automatically reload when you make changes.

## Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the NewsVerifier landing page.

## Available Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type check
pnpm check

# Format code
pnpm format

# Push database schema changes
pnpm db:push
```

## Project Structure

```
news-verifier/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities (tRPC client)
│   │   ├── App.tsx        # Main app with routes
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                # Backend (Express + tRPC)
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database helpers
│   ├── analysisEngine.ts  # AI analysis logic
│   └── _core/             # Framework code
├── drizzle/               # Database schema
│   └── schema.ts          # Table definitions
├── shared/                # Shared constants
└── package.json
```

## Key Features

- **Content Analysis**: Submit URLs or text for AI-powered credibility analysis
- **Credibility Scoring**: Get 0-100 scores with detailed breakdowns
- **Dashboard**: View analysis history and statistics
- **Image Verification**: Upload images to check for manipulation
- **Professional UI**: Elegant design with dark/light theme support

## Troubleshooting

### Port Already in Use
If port 3000 or 5173 is already in use:

```bash
# macOS/Linux - Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Error
- Ensure MySQL is running
- Verify DATABASE_URL in `.env.local`
- Check MySQL username and password
- Ensure the database exists

### Dependencies Installation Issues
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Type check the project
pnpm check

# Fix any issues and restart dev server
pnpm dev
```

## Environment Variables Explained

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secret for session signing |
| `VITE_APP_ID` | Application identifier |
| `OAUTH_SERVER_URL` | OAuth server URL |
| `OWNER_OPEN_ID` | Owner's unique identifier |
| `OWNER_NAME` | Owner's display name |

## Next Steps

1. **Explore the codebase** - Check out `client/src/pages/` for UI components
2. **Customize the analysis engine** - Edit `server/analysisEngine.ts` to adjust analysis logic
3. **Add new features** - Create new tRPC procedures in `server/routers.ts`
4. **Modify styling** - Update `client/src/index.css` for design changes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in key files
3. Check the browser console for errors (F12)
4. Check the terminal output for server errors

---

**Happy analyzing! 🔍**
