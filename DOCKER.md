# MoneyMosaic Docker Guide

## When to Use Docker

**Use Docker (`npm run docker:up`) when:**

- You want isolated, consistent environment
- Sharing project with others
- Testing containerized setup
- Don't want to install Node.js locally

**Use Local Development (`npm run dev:both`) when:**

- You want fastest development experience
- You already have Node.js setup locally
- Daily development work

## Quick Start

```bash
npm run docker:up
```

Access at:

- **Backend API**: http://localhost:8080
- **Frontend Dev Server**: http://localhost:3000
- **API Documentation**: http://localhost:8080/api-docs

## Environment Variables

Create a `.env` file:

```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

## Commands

```bash
# Start app with hot reload
npm run docker:up

# Stop app
npm run docker:down

# View logs
npm run docker:logs
```

## Data Persistence

Your SQLite database persists in a Docker volume across container restarts.

## Troubleshooting

```bash
# Check what's using ports
lsof -i :8080
lsof -i :3000

# View logs for debugging
npm run docker:logs

# Enter container
docker-compose exec app sh

# Force remove everything (if needed)
docker-compose down --volumes --remove-orphans

# Fix frontend permission issues (affects both Docker & local)
sudo rm -rf frontend/node_modules/.vite
```

**Common issues:**

- `EACCES: permission denied` on frontend - Run `sudo rm -rf frontend/node_modules/.vite`
- `Network moneymosaic_default Resource is still in use` - Harmless, ignore

That's it! Simple Docker setup for development with hot reload.
