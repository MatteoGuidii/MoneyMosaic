# MoneyMosaic Docker Guide

## Overview

Simple Docker setup for MoneyMosaic - a personal finance management application. This setup is designed for local development and testing, not production deployment.

## What You Get

- `Dockerfile` - Simple single-stage build
- `Dockerfile.dev` - Development with hot reload
- `docker-compose.yml` - Main app runner
- `docker-compose.dev.yml` - Development with hot reload

## Quick Start

### Run the App (Built Version)

```bash
npm run docker:up
```

Access at: http://localhost:8080

### Run with Hot Reload (Development)

```bash
npm run docker:up:dev
```

- Backend API: http://localhost:8080
- Frontend Dev: http://localhost:3000

## Environment Variables

Create a `.env` file:

```env
# Required Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

## Why Docker for MoneyMosaic?

Since you're not deploying to production, here's why Docker is still useful:

### 1. **Easy Setup**

- Anyone can run `docker-compose up` and have your app working
- No need to install Node.js, npm, or manage versions
- Perfect for sharing with others or running on different machines

### 2. **Clean Environment**

- App runs in isolation - no conflicts with other projects
- SQLite database persists in Docker volumes
- Easy to reset or clean up

### 3. **Portfolio Value**

- Shows you understand containerization
- Demonstrates modern development practices
- Makes your project more professional

### 4. **Development Benefits**

- Hot reload available in dev mode
- Consistent environment across different machines
- Easy switching between built and development versions

## Common Commands

```bash
# Start app
npm run docker:up

# Start with hot reload
npm run docker:up:dev

# Stop app
npm run docker:down

# View logs
npm run docker:logs

# Stop dev
npm run docker:down:dev
```

## Data Persistence

Your SQLite database is stored in a Docker volume, so data persists across container restarts. No need to worry about losing data when you stop/start containers.

## That's It!

Simple, clean, and focused on what you actually need. No complex production optimizations, security hardening, or multi-stage builds - just a straightforward Docker setup for local development and portfolio demonstration.

- Health checks for monitoring
- Proper signal handling with dumb-init

## Accessing the Application

### Production Mode

- **Main Application**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

### Development Mode

- **Backend API**: http://localhost:8080
- **Frontend Dev Server**: http://localhost:3000
- **API Documentation**: http://localhost:8080/api-docs

## Data Management

### Database Persistence

The SQLite database is stored in a Docker volume named `moneymosaic_data`. This ensures your data persists across container restarts.

### Backup Database

```bash
# Create backup
docker run --rm -v moneymosaic_data:/data -v $(pwd):/backup alpine tar czf /backup/database-backup.tar.gz /data

# Restore backup
docker run --rm -v moneymosaic_data:/data -v $(pwd):/backup alpine tar xzf /backup/database-backup.tar.gz -C /
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :8080

   # Use different ports
   docker-compose up -d --env PORT=8081
   ```

2. **Permission Issues**

   ```bash
   # Fix ownership of data directory
   docker-compose exec app chown -R nodejs:nodejs /app/data
   ```

3. **Database Connection Issues**

   ```bash
   # Check if database file exists
   docker-compose exec app ls -la /app/data/

   # Check database permissions
   docker-compose exec app ls -la /app/data/moneymosaic.db
   ```

### Viewing Logs

```bash
# Production logs
docker-compose logs -f app

# Development logs
docker-compose -f docker-compose.dev.yml logs -f app-dev
```

### Entering Container

```bash
# Production container
docker-compose exec app sh

# Development container
docker-compose -f docker-compose.dev.yml exec app-dev sh
```

## Why Docker is Useful for MoneyMosaic

Even though you're not deploying to production, Docker provides several benefits:

1. **Learning and Portfolio**: Demonstrates containerization skills
2. **Easy Sharing**: Others can run your app with just `docker-compose up`
3. **Testing**: Test in clean environments without affecting your system
4. **Future Flexibility**: Easy to deploy later if you change your mind
5. **Development**: Consistent development environment for team members
6. **Experimentation**: Test different configurations safely

## Security Considerations

### Docker Image Vulnerabilities

The project includes multiple Dockerfile variants for different security needs:

- **`Dockerfile`** - Standard Alpine-based image (Node.js 22)
- **`Dockerfile.slim`** - Debian slim-based image with security updates
- **`Dockerfile.secure`** - Distroless image for maximum security

**Note**: VS Code's Docker extension may show vulnerability warnings for Node.js base images. This is common and can be addressed by:

1. **Using the latest LTS Node.js version** (we use Node.js 22)
2. **Regular security updates** with `apk upgrade` or `apt-get upgrade`
3. **Using distroless images** for production (`Dockerfile.secure`)
4. **Scanning images** with `docker scan` or security tools

### Building with Different Security Levels

```bash
# Standard build (recommended for development)
docker build -t moneymosaic .

# Slim build (better security, larger size)
docker build -f Dockerfile.slim -t moneymosaic:slim .

# Secure build (maximum security, distroless)
docker build -f Dockerfile.secure -t moneymosaic:secure .
```

### Security Best Practices Applied

- **Non-root user**: Application runs as `nodejs` user
- **Minimal attack surface**: Alpine Linux or distroless base images
- **Regular security updates**: `apk upgrade` or `apt-get upgrade`
- **Multi-stage builds**: Reduced final image size
- **Proper signal handling**: dumb-init for graceful shutdowns
- **Health checks**: Built-in monitoring
- **Dependency auditing**: `npm audit fix` in build process
