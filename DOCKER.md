# Docker Setup for GuepardStore Demo App

> **⚠️ Important Note**: Docker setup may have limitations with Guepard's git-like features and database branching. For the **best demo experience** showcasing Guepard's full capabilities, we recommend running the application natively (see main README.md for setup instructions).

This project includes Docker support for easy deployment and development with **two different approaches**.

## 🎯 Choose Your Approach

### **Option A: Separate Containers (Modular)**
- ✅ Clean separation of concerns
- ✅ Easy to scale individual services
- ✅ Industry standard architecture
- ❌ Feature patches won't work (scripts can't modify files across containers)
- 🔄 **Use Git branches to switch between versions**

### **Option B: Single Container (Feature Patches Work)**
- ✅ Feature patches work perfectly
- ✅ All Guepard demo features available
- ✅ Simpler for development
- ❌ Less modular architecture
- ❌ Harder to scale individual services

## 🐳 Quick Start

### **Option A: Separate Containers**

#### Development Mode (with Guepard Database)
```bash
# Start both frontend and backend services
docker-compose -f docker-compose.dev.yml up --build

# Switch between versions using Git branches
git checkout discout-feature  # Enable discount feature
git checkout main             # Back to main version
```

#### Production Mode (with local PostgreSQL)
```bash
# Start all services including PostgreSQL
docker-compose up --build
```

### **Option B: Single Container (Feature Patches Work)**

```bash
# Start single container with both frontend and backend
docker-compose -f docker-compose.single.yml up --build

# Now feature patches work! Use the Demo Control Panel
# or run patch scripts directly in the container
```

#### Running Feature Patches in Single Container
```bash
# Apply discount feature patch
docker-compose -f docker-compose.single.yml exec guepard-app /bin/bash -c "cd /app && ./demo/discount-feature/apply-discount-feature.sh"

# Rollback discount feature patch
docker-compose -f docker-compose.single.yml exec guepard-app /bin/bash -c "cd /app && ./demo/discount-feature/rollback-discount-feature.sh"

# Or use the Demo Control Panel UI at http://localhost:8080
```

## 🔧 Individual Service Commands

### Backend Only
```bash
# Build and run backend
cd components/api
docker build -t guepard-api .
docker run -p 3001:3001 --env-file .env guepard-api
```

### Frontend Only
```bash
# Build and run frontend
cd components/frontend
docker build -t guepard-frontend .
docker run -p 8080:8080 guepard-frontend
```

## 📋 Prerequisites

1. **Docker** and **Docker Compose** installed
2. **Guepard Database** connection string in `components/api/.env`
3. **Environment Variables** configured

## 🌐 Access Points

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **PostgreSQL** (if using local): localhost:5432

## 🛠️ Development Workflow

### Hot Reload Development
```bash
# Start with volume mounts for hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Database Operations
```bash
# Run Prisma commands inside the container
docker-compose exec api bunx prisma db push
docker-compose exec api bunx prisma generate
docker-compose exec api bunx prisma db seed
```

### View Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f frontend
```

## 🔍 Troubleshooting

### Port Conflicts
If ports 3001 or 8080 are already in use:
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :8080

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if Guepard database is accessible
docker-compose exec api bunx prisma db push

# Verify environment variables
docker-compose exec api env | grep DATABASE
```

### Rebuild After Changes
```bash
# Force rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up --build --force-recreate
```

## 📦 Production Deployment

### Environment Setup
1. Copy `.env.example` to `.env` in both `components/api/` and `components/frontend/`
2. Configure your Guepard database URLs
3. Set production environment variables

### Deploy
```bash
# Production deployment
docker-compose up -d --build

# Check service health
docker-compose ps
```

## 🧹 Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker system prune -a
```
