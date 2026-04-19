# 🪟 NewsVerifier - Windows Local Setup Guide (No Docker)

Complete step-by-step guide to run NewsVerifier on Windows with local MySQL installation.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Install MySQL](#step-1-install-mysql)
3. [Step 2: Install Node.js & pnpm](#step-2-install-nodejs--pnpm)
4. [Step 3: Download Project](#step-3-download-project)
5. [Step 4: Configure Environment](#step-4-configure-environment)
6. [Step 5: Set Up Database](#step-5-set-up-database)
7. [Step 6: Run the App](#step-6-run-the-app)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You need:
- Windows 10 or later
- Administrator access
- Internet connection
- ~2GB free disk space

---

## Step 1: Install MySQL

### Option A: MySQL Community Server (Recommended)

1. **Download MySQL Installer**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Click "Download" for "MySQL Community Server" (latest version)
   - Choose "Windows (x86, 64-bit), MSI Installer"
   - Click "Download" button

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Click "Next" on the welcome screen
   - Accept the license agreement
   - Choose "Setup Type": Select "Developer Default"
   - Click "Next"

3. **Configure MySQL Server**
   - Keep default settings
   - Click "Next" until you reach "MySQL Server Configuration"
   - Port: Keep as `3306`
   - Click "Next"

4. **Set Root Password**
   - Username: `root`
   - Password: `root` (or your preferred password)
   - Repeat password
   - Click "Next"

5. **Complete Installation**
   - Click "Execute" to apply configuration
   - Click "Finish" when complete

### Option B: MySQL via Chocolatey (If you have it installed)

```powershell
choco install mysql -y
```

---

## Step 2: Install Node.js & pnpm

### Install Node.js

1. Go to: https://nodejs.org/
2. Download **LTS version** (18.x or higher)
3. Run the installer and follow the steps
4. Keep all default settings
5. Click "Install"

### Verify Installation

Open PowerShell and type:
```powershell
node --version
npm --version
```

### Install pnpm

```powershell
npm install -g pnpm
```

Verify:
```powershell
pnpm --version
```

---

## Step 3: Download Project

### Option A: Clone from Git

```powershell
git clone <your-repo-url> news-verifier
cd news-verifier
```

### Option B: Download as ZIP

1. Go to your project repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open PowerShell in the extracted folder

---

## Step 4: Configure Environment

### Step 4.1: Create .env.local file

1. In the project folder, create a new file named `.env.local`
2. Copy this content:

```env
# Database Connection (Local MySQL)
DATABASE_URL=mysql://root:root@localhost:3306/news_verifier

# OAuth Configuration (from your Manus project)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=your_jwt_secret_here
OWNER_OPEN_ID=your_owner_open_id_here

# Manus APIs
BUILT_IN_FORGE_API_KEY=your_forge_api_key_here
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_analytics_id_here

# App Configuration
VITE_APP_TITLE=NewsVerifier
VITE_APP_LOGO=https://your-logo-url.com/logo.png
OWNER_NAME=Your Name
```

### Step 4.2: Get Your Manus Credentials

1. Open your Manus project dashboard
2. Go to **Settings → Secrets**
3. Copy each value and replace the `your_*_here` placeholders in `.env.local`

**Important values to copy:**
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`
- `JWT_SECRET`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_KEY`
- `BUILT_IN_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`

---

## Step 5: Set Up Database

### Step 5.1: Create Database

1. Open PowerShell
2. Connect to MySQL:
```powershell
mysql -u root -p
```
3. Enter password: `root` (or your password)
4. Run these commands:
```sql
CREATE DATABASE news_verifier;
CREATE USER 'news_user'@'localhost' IDENTIFIED BY 'news_password';
GRANT ALL PRIVILEGES ON news_verifier.* TO 'news_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5.2: Install Dependencies

```powershell
cd path\to\news-verifier
pnpm install
```

### Step 5.3: Create Database Tables

```powershell
pnpm db:push
```

This creates all necessary tables in your database.

---

## Step 6: Run the App

### Terminal 1: Start Development Server

```powershell
cd path\to\news-verifier
pnpm dev
```

Wait for output like:
```
Server running on http://localhost:3000/
```

### Terminal 2: Open Browser

1. Open your browser
2. Go to: http://localhost:3000
3. You should see the NewsVerifier homepage

### First Time Login

1. Click "Dev Login" button (for development)
   - OR click "Sign In" for real Manus OAuth login
2. You should now be logged in
3. Try the "Analyze Content" button

---

## Troubleshooting

### Problem 1: "MySQL connection refused"

**Solution:**
```powershell
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"
# Enter password: root

# If not running, start MySQL:
# Windows Services → Find "MySQL80" → Right-click → Start
```

### Problem 2: "Port 3306 already in use"

**Solution:**
```powershell
# Find what's using port 3306
netstat -ano | findstr :3306

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or use a different port in .env.local:
DATABASE_URL=mysql://root:root@localhost:3307/news_verifier
```

### Problem 3: "pnpm: command not found"

**Solution:**
```powershell
# Reinstall pnpm
npm install -g pnpm

# Restart PowerShell and try again
```

### Problem 4: "Cannot find module" errors

**Solution:**
```powershell
# Clear node_modules and reinstall
rmdir node_modules -r -force
pnpm install
```

### Problem 5: "404 errors when clicking buttons"

**Solution:**
1. Make sure you're logged in (click "Dev Login")
2. Check that database is running: `mysql -u root -p -e "SELECT 1"`
3. Restart the dev server:
   - Press Ctrl+C in terminal
   - Run `pnpm dev` again

### Problem 6: "Database tables don't exist"

**Solution:**
```powershell
pnpm db:push
```

### Problem 7: "Port 3000 already in use"

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number shown)
taskkill /PID <PID> /F

# Or use a different port by editing package.json
```

---

## Useful Commands

### Start Development
```powershell
pnpm dev
```

### Run Tests
```powershell
pnpm test
```

### Build for Production
```powershell
pnpm build
```

### Check Database
```powershell
mysql -u root -p news_verifier
# Enter password: root
# Then type SQL commands
```

### View Database Tables
```powershell
mysql -u root -p news_verifier -e "SHOW TABLES;"
# Enter password: root
```

### Backup Database
```powershell
mysqldump -u root -p news_verifier > backup.sql
# Enter password: root
```

### Restore Database
```powershell
mysql -u root -p news_verifier < backup.sql
# Enter password: root
```

---

## File Structure

```
news-verifier/
├── .env.local              ← Your configuration (don't share!)
├── package.json            ← Dependencies
├── pnpm-lock.yaml          ← Lock file
│
├── client/                 ← Frontend React app
│   ├── src/
│   │   ├── pages/         ← Page components
│   │   ├── components/    ← UI components
│   │   └── lib/           ← Utilities
│   └── public/            ← Static files
│
├── server/                 ← Backend Express app
│   ├── routers.ts         ← API endpoints
│   ├── db.ts              ← Database queries
│   └── analysisEngine.ts  ← LLM analysis
│
└── drizzle/                ← Database schema
    └── schema.ts          ← Table definitions
```

---

## Development Workflow

### Normal Development
```powershell
# Terminal 1
pnpm dev

# Terminal 2 (optional - for tests)
pnpm test --watch
```

### After Changing Database Schema
```powershell
# 1. Edit drizzle/schema.ts
# 2. Run:
pnpm db:push

# 3. Restart dev server if needed
```

### Before Committing Code
```powershell
pnpm test
pnpm check
```

---

## Getting Help

### Check Logs
- Look at the terminal output when running `pnpm dev`
- Check browser console (F12 → Console tab)

### Common Issues
1. Database not running → Start MySQL via Windows Services
2. Port in use → Kill the process using `taskkill`
3. Dependencies missing → Run `pnpm install`
4. Environment variables wrong → Check `.env.local` matches Manus settings

### Restart Everything
```powershell
# Kill dev server (Ctrl+C)
# Kill MySQL (Windows Services or taskkill)
# Kill any node processes:
taskkill /IM node.exe /F

# Start fresh:
# 1. Start MySQL via Windows Services
# 2. Run: pnpm dev
```

---

## Next Steps

Once everything is running:

1. **Test the app** - Click "Dev Login" and try analyzing content
2. **Read the docs** - Check DOCKER_README.md for more info
3. **Explore features** - Try Dashboard, My Articles, etc.
4. **Customize** - Edit colors, text, and features as needed

---

## Summary

✅ MySQL installed locally  
✅ Node.js and pnpm installed  
✅ Project configured with .env.local  
✅ Database created and tables set up  
✅ App running on http://localhost:3000  

**You're ready to develop! 🚀**
