# 💰 MoneyMosaic - Personal Finance Dashboard

A comprehensive personal finance dashboard that connects multiple banks and tracks all your finances in one place using the Plaid API.

![MoneyMosaic Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Test Coverage](https://img.shields.io/badge/Test%20Coverage-85%25-green)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🔧 API Endpoints](#-api-endpoints)
- [🧪 Testing](#-testing)
- [�️ Database](#️-database)
- [�🛠️ Development](#️-development)
- [🔒 Security & Production](#-security--production)
- [📋 Common Issues & FAQ](#-common-issues--faq)

### Project Structure

For detailed information, see our comprehensive documentation:

📁 **[docs/](./docs/)** - Complete technical documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Project structure
- **[API.md](./docs/API.md)** - API documentation
- **[TESTING.md](./docs/TESTING.md)** - Testing guide & best practices
- **[openapi.json](./docs/openapi.json)** - OpenAPI specification

**Key directories:**

- `src/` - Backend source code
- `frontend/` - React frontend
- `tests/` - Test suites
- `docs/` - Documentation

## ✨ Features

- **Multi-Bank Support**: Connect unlimited bank accounts from different institutions
- **Real-time Sync**: Automatic transaction syncing every 6 hours with manual sync option
- **Financial Insights**: Comprehensive spending analysis with interactive charts and category filtering
- **Dynamic Filters**: Time-based filtering and category-specific analysis for spending patterns
- **Modern Interface**: Responsive React frontend with dark/light mode support
- **Secure Storage**: Local SQLite database with transaction deduplication
- **Connection Health**: Automatic monitoring and error handling with visual status indicators
- **Privacy-Focused**: Single-user design with no external data sharing

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/moneymosaic.git
cd moneymosaic

# 2. Run the quick setup script
chmod +x quick-start.sh
./quick-start.sh

# 3. Add your Plaid credentials to .env file
# Get free credentials at: https://dashboard.plaid.com/

# 4. Start both servers
npm run dev:both

# 5. Open http://localhost:3000 (frontend)
# Backend API runs on http://localhost:8080
```

### Alternative: Manual Startup

If you prefer to run servers separately:

```bash
# Terminal 1 - Backend (API server)
npm run dev

# Terminal 2 - Frontend (React app)
npm run dev:frontend
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Plaid Account** (free at [dashboard.plaid.com](https://dashboard.plaid.com/))

## ⚙️ Environment Configuration

Create a `.env` file with your Plaid credentials:

```env
# Plaid API Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox
PLAID_REDIRECT_URI=http://localhost:3000/oauth-return

# Server Configuration
PORT=8080

# Background Job Configuration
SYNC_INTERVAL_HOURS=6
```

## 🔧 API Endpoints

### Interactive API Documentation

MoneyMosaic provides comprehensive OpenAPI/Swagger documentation:

- **Swagger UI**: `http://localhost:8080/api-docs` (when server is running)
- **OpenAPI Spec**: [docs/openapi.json](./docs/openapi.json)

```bash
# Generate/update OpenAPI specification
npm run docs:generate
```

For a quick endpoint reference, see [docs/API.md](./docs/API.md).

## 🧪 Testing

MoneyMosaic includes comprehensive testing with 85%+ coverage. For detailed testing information, see [docs/TESTING.md](./docs/TESTING.md).

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🗄️ Database

MoneyMosaic uses SQLite for local data storage. Database location: `./data/moneymosaic.db`

For detailed database architecture, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

**Security Notes:**

- Database files are gitignored and contain sensitive financial data
- No external data sharing
- Automatic backups recommended for production use

## 🛠️ Development

### Quick Start Commands

```bash
npm run dev:both        # Start both backend + frontend
npm run dev            # Backend only (port 8080)
npm run dev:frontend   # Frontend only (port 3000)
npm run build          # Build both backend + frontend
npm start              # Start production server
```

For detailed development information, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🔒 Security & Production

### Production Deployment

- Use `production` Plaid environment
- Implement user authentication
- Add HTTPS and secure headers
- Regular security updates

### Data Privacy

- All data stored locally in SQLite
- No third-party data sharing
- User controls all connections
- Easy data export/deletion

## 📋 Common Issues & FAQ

**Connection Failures:**

- Check Plaid credentials in `.env`
- Verify institution supports Plaid
- Review error logs for API limits

**Sync Problems:**

- Manual sync to test connectivity
- Check background job status
- Review institution health status

**Database Issues:**

- Ensure write permissions in `data/` directory
- Check SQLite installation

**Can you connect multiple banks?**
✅ Yes! Connect unlimited banks with persistent connections.

**Is data persistent?**
✅ Yes! All data stored in SQLite with transaction history preserved.

**Background sync available?**
✅ Yes! Automatic sync every 6 hours with manual triggers available.

---

Built with ❤️ using Plaid API, TypeScript, SQLite, React, and modern web technologies.
