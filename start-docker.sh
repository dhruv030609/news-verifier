#!/bin/bash

# NewsVerifier Docker Quick Start Script
# This script sets up and starts the Docker environment

set -e

echo "🐳 NewsVerifier Docker Setup"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "Download: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Start containers
echo "🚀 Starting MySQL container..."
docker-compose up -d

echo ""
echo "⏳ Waiting for MySQL to be ready..."
sleep 5

# Check if MySQL is healthy
if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p root &> /dev/null; then
    echo "✅ MySQL is ready"
else
    echo "⚠️  MySQL is starting up, this may take a moment..."
    sleep 5
fi

echo ""
echo "✅ Docker containers are running!"
echo ""
echo "📊 Services:"
echo "  - MySQL: localhost:3306"
echo "  - phpMyAdmin: http://localhost:8080"
echo ""
echo "📝 Next steps:"
echo "  1. Configure .env.local with your OAuth credentials"
echo "  2. Run: pnpm install"
echo "  3. Run: pnpm db:push"
echo "  4. Run: pnpm dev"
echo ""
echo "💡 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Reset data: docker-compose down -v"
echo ""
