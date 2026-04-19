# ⚡ NewsVerifier - Windows Quick Setup (5 Minutes)

## Prerequisites
- Windows 10+
- Administrator access

## 1️⃣ Install MySQL

```powershell
# Download from: https://dev.mysql.com/downloads/mysql/
# Run installer, set password to: root
# Port: 3306
```

## 2️⃣ Install Node.js & pnpm

```powershell
# Download Node.js from: https://nodejs.org/
# Run installer (keep defaults)

# Then install pnpm:
npm install -g pnpm
```

## 3️⃣ Create Database

```powershell
mysql -u root -p
# Password: root
```

Then paste this:
```sql
CREATE DATABASE news_verifier;
CREATE USER 'news_user'@'localhost' IDENTIFIED BY 'news_password';
GRANT ALL PRIVILEGES ON news_verifier.* TO 'news_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4️⃣ Configure Project

```powershell
cd path\to\news-verifier

# Create .env.local file with:
DATABASE_URL=mysql://root:root@localhost:3306/news_verifier
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=your_jwt_secret_here
OWNER_OPEN_ID=your_owner_open_id_here
BUILT_IN_FORGE_API_KEY=your_forge_api_key_here
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_analytics_id_here
VITE_APP_TITLE=NewsVerifier
VITE_APP_LOGO=https://your-logo-url.com/logo.png
OWNER_NAME=Your Name
```

## 5️⃣ Set Up Database

```powershell
pnpm install
pnpm db:push
```

## 6️⃣ Run App

```powershell
pnpm dev
```

Open: http://localhost:3000

Click "Dev Login" to test!

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL not running | Start from Windows Services (search "Services") |
| Port 3306 in use | `netstat -ano \| findstr :3306` then `taskkill /PID <PID> /F` |
| pnpm not found | `npm install -g pnpm` then restart PowerShell |
| 404 errors | Make sure you clicked "Dev Login" |
| Database error | Run `pnpm db:push` again |

---

## Useful Commands

```powershell
pnpm dev              # Start app
pnpm test             # Run tests
pnpm build            # Build for production
pnpm check            # Check TypeScript
mysql -u root -p      # Connect to MySQL (password: root)
```

---

**See WINDOWS_LOCAL_SETUP.md for detailed guide!**
