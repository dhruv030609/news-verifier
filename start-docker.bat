@echo off
REM NewsVerifier Docker Quick Start Script for Windows

echo.
echo 🐳 NewsVerifier Docker Setup
echo ==============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is installed
echo.

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)

echo ✅ Docker Compose is available
echo.

REM Start containers
echo 🚀 Starting MySQL container...
docker-compose up -d

echo.
echo ⏳ Waiting for MySQL to be ready...
timeout /t 5 /nobreak

echo.
echo ✅ Docker containers are running!
echo.
echo 📊 Services:
echo   - MySQL: localhost:3306
echo   - phpMyAdmin: http://localhost:8080
echo.
echo 📝 Next steps:
echo   1. Configure .env.local with your OAuth credentials
echo   2. Run: pnpm install
echo   3. Run: pnpm db:push
echo   4. Run: pnpm dev
echo.
echo 💡 Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Stop: docker-compose down
echo   - Reset data: docker-compose down -v
echo.
pause
