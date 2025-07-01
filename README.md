# 💰 MoneyMosaic - Personal Finance Dashboard

A comprehensive personal finance dashboard that lets you connect multiple banks and track all your finances in one place using the Plaid API.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
- [🏗️ Architecture](#️-architecture)
- [🔧 API Endpoints](#-api-endpoints)
- [⚙️ Configuration](#️-configuration)
- [📈 Advanced Usage](#-advanced-usage)
- [🔒 Security Considerations](#-security-considerations)
- [🛠️ Development](#️-development)
- [🧪 Testing](#-testing)
- [❓ Troubleshooting](#-troubleshooting)
- [📋 Plaid API Answers](#-plaid-api-answers)
- [🎯 Next Steps](#-next-steps)

## 🧪 Test Coverage

- ✅ **Unit Tests**: Database, BankService, SchedulerService, PlaidClient
- ✅ **Integration Tests**: Complete API endpoint coverage
- ✅ **Comprehensive Coverage**: All core functionality tested
- ✅ **Clean Execution**: No memory leaks, proper resource cleanup
- ✅ **Fast Performance**: Quick test execution

### Testing Documentation

- 📖 **Complete Testing Guide**: [`tests/README.md`](tests/README.md) - Comprehensive testing setup, framework details, and best practices
- 🧪 **API Testing**: [`_postman_/`](_postman_/) - Postman collection for manual validation

## ⚡ Quick Start

```bash
# 1. Make script executable (first time only)
chmod +x quick-start.sh

# 2. Get your project running in 30 seconds
./quick-start.sh

# 3. Start the server
npm run dev

# 4. Open http://localhost:3000 (or your configured PORT)
```

**First time setup:** Get your free Plaid API keys at [dashboard.plaid.com](https://dashboard.plaid.com/)

## ✨ Features

### 🏦 Multi-Bank Support

- Connect unlimited bank accounts from different institutions
- Persistent connections that don't expire
- Real-time balance and transaction syncing
- Connection health monitoring

### 📊 Financial Insights

- Comprehensive spending and income analysis
- Category-wise transaction breakdown
- Institution-wise financial summary
- Historical transaction data with SQLite storage

### 🔄 Automated Data Sync

- Background jobs to sync transactions every 6-12 hours
- Manual sync option for immediate updates
- Automatic connection health checks
- Graceful error handling for failed connections

### 💾 Data Persistence

- SQLite database for reliable local storage
- Transaction deduplication
- Account and institution management
- Historical data retention

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Plaid API account (sandbox for development)
- TypeScript knowledge

### Installation

1. **Clone and setup:**

```bash
git clone <your-repo>
cd MoneyMosaic
npm install
```

2. **Environment Configuration:**

```bash
# Option A: Use the quick-start script (recommended)
chmod +x quick-start.sh  # First time only
./quick-start.sh

# Option B: Manual setup
cp .env.example .env
# Edit .env with your Plaid credentials
```

3. **Required Plaid API Keys:**

   - Get your credentials from [Plaid Dashboard](https://dashboard.plaid.com/)
   - Set `PLAID_CLIENT_ID` and `PLAID_SECRET` in `.env`
   - Use `sandbox` environment for development

4. **Start Development Server:**

```bash
npm run dev
```

Visit `http://localhost:3000` to access your dashboard (or check your `PORT` in `.env`).

## 🏗️ Architecture

### Backend Structure

```
src/
├── database.ts          # SQLite database layer
├── plaidClient.ts       # Plaid API configuration
├── server.ts            # Express server setup
├── services/
│   ├── bankService.ts   # Multi-bank connection management
│   └── schedulerService.ts # Background job scheduling
└── routes/
    ├── createLinkToken.ts   # Plaid Link token creation
    ├── exchangeToken.ts     # Token exchange & bank saving
    ├── transactions.ts      # Transaction endpoints
    └── sandbox.ts           # Sandbox utilities
```

### Database Schema

- **institutions**: Connected bank information
- **accounts**: Bank account details and balances
- **transactions**: All transaction data with categorization

## 🔧 API Endpoints

### Bank Management

- `POST /api/exchange_public_token` - Connect new bank
- `GET /api/connected_banks` - List all connected banks
- `DELETE /api/banks/:id` - Remove bank connection
- `GET /api/health_check` - Check connection health

### Transactions

- `POST /api/fetch_transactions` - Fetch all transactions
- `POST /api/sync` - Manual sync trigger
- `GET /api/scheduler_status` - Background job status

## ⚙️ Configuration

### Environment Variables

```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox              # sandbox, development, or production
SYNC_INTERVAL_HOURS=6          # Background sync frequency
PORT=3000                      # Server port
```

### Background Jobs

- **Transaction Sync**: Runs every 6 hours (configurable)
- **Health Check**: Daily connection verification
- **Auto-start**: Jobs start automatically with server

## 📈 Advanced Usage

### Multiple Bank Connections

1. Click "Connect New Bank" for each institution
2. Complete Plaid Link flow for each bank
3. All accounts automatically sync in background
4. View consolidated dashboard with all data

### Data Management

- Transactions automatically deduplicated
- Historical data preserved across syncs
- Failed connections marked but not removed
- Manual sync available for immediate updates

### Monitoring

- Real-time connection health status
- Transaction sync logs in console
- Error tracking and recovery
- Institution-wise performance metrics

## 🔒 Security Considerations

### Production Deployment

- Use `production` Plaid environment
- Secure access tokens in database
- Implement user authentication
- Add HTTPS and secure headers
- Regular security updates

### Data Privacy

- All data stored locally in SQLite
- No third-party data sharing
- User controls all connections
- Easy data export/deletion

## 🛠️ Development

### Building for Production

```bash
npm run build
npm start
```

### Database Location

- Development: `./data/moneymosaic.db`
- Automatic creation and migration
- Backup recommended for production

### Adding Features

- Extend `BankService` for new banking features
- Add routes in `/routes` directory
- Update frontend in `public/index.html`
- Database schema updates in `database.ts`

## 🧪 Testing

MoneyMosaic includes a comprehensive automated testing suite with complete test coverage.

### Quick Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- bankService.test.ts
```

### Test Coverage

- ✅ **Unit Tests**: Database, BankService, SchedulerService, PlaidClient
- ✅ **Integration Tests**: Complete API endpoint coverage
- ✅ **Comprehensive Coverage**: All core functionality tested
- ✅ **Clean Execution**: No memory leaks, proper resource cleanup
- ✅ **Fast Performance**: Quick test execution

The testing infrastructure provides confidence in code changes and enables safe refactoring and feature development.

## ❓ Troubleshooting

### Common Issues

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
- Review database logs

### Support

- Check Plaid API documentation
- Review console logs for errors
- Test with sandbox institutions first

## 📋 Plaid API Answers

### Can you connect multiple banks?

✅ **Yes!** You can connect unlimited banks. Each bank gets its own access token stored in the database.

### Do connections expire?

✅ **Generally No!** Plaid access tokens don't have expiration dates, but banks may revoke them if:

- User changes banking passwords
- Account is closed
- Extended periods of inactivity
- User manually revokes app access

### Can you run background jobs?

✅ **Yes!** The app includes:

- Automatic transaction sync every 6-12 hours
- Daily connection health checks
- Manual sync triggers
- Configurable intervals

### Is the data persistent?

✅ **Yes!** All data is stored in SQLite:

- Transaction history preserved
- Bank connections maintained
- Account information cached
- No data loss between restarts

## 🎯 Next Steps

Consider adding:

- User authentication system
- Budget tracking and alerts
- Investment account support
- Mobile-responsive design
- Data export functionality
- Advanced analytics and charts

---

Built with ❤️ using Plaid API, TypeScript, SQLite, and modern web technologies.
