# 💰 MoneyMosaic - Personal Finance Dashboard

A comprehensive personal finance dashboard that connects multiple banks and tracks all your finances in one place using the Plaid API.

![MoneyMosaic Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Test Coverage](https://img.shields.io/badge/Test%20Coverage-70%25+-brightgreen)

## ✨ Features

- **Multi-Bank Support**: Connect unlimited bank accounts from different institutions
- **Real-time Sync**: Automatic transaction syncing every 6 hours with manual sync option
- **Financial Insights**: Comprehensive spending analysis with interactive charts
- **Modern Interface**: Responsive React frontend with dark/light mode
- **Secure Storage**: Local SQLite database with transaction deduplication
- **Connection Health**: Automatic monitoring and error handling

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

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
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
PORT=3000

# Background Job Configuration
SYNC_INTERVAL_HOURS=6
```

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
    ├── dashboard.ts         # Dashboard data endpoints
    └── transactions.ts      # Transaction endpoints
```

### Frontend Structure

```
frontend/src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── BankManagement.tsx # Bank connection management
│   ├── TransactionsTable.tsx # Transaction display
│   └── ChartsSection.tsx # Financial charts
├── services/
│   └── apiService.ts    # API communication
└── contexts/
    └── ThemeContext.tsx # Theme management
```

## 🔧 API Endpoints

### Bank Management

- `POST /api/create_link_token` - Create Plaid Link token
- `POST /api/exchange_public_token` - Connect new bank
- `GET /api/management/connected_banks` - List all connected banks
- `DELETE /api/management/banks/:id` - Remove bank connection
- `GET /api/management/health_check` - Check connection health

### Transactions & Data

- `GET /api/management/dashboard` - Get dashboard data
- `POST /api/management/sync` - Manual sync trigger
- `GET /api/management/transactions` - Get transactions with filters

## 🧪 Testing

MoneyMosaic includes comprehensive testing with 70%+ coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- bankService.test.ts
```

**Test Coverage:**

- ✅ Unit Tests: Database, BankService, SchedulerService, PlaidClient
- ✅ Integration Tests: Complete API endpoint coverage
- ✅ Postman Collection: Manual API testing

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

## ❓ FAQ

**Can you connect multiple banks?**
✅ Yes! Connect unlimited banks with persistent connections.

**Do connections expire?**
✅ Generally no, but banks may revoke access if passwords change or accounts are closed.

**Is data persistent?**
✅ Yes! All data stored in SQLite with transaction history preserved.

**Background sync available?**
✅ Yes! Automatic sync every 6 hours with manual triggers available.

## 📋 Common Issues

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

## 🎯 Next Steps

Consider adding:

- User authentication system
- Budget tracking and alerts
- Investment account support
- Data export functionality
- Advanced analytics

---

Built with ❤️ using Plaid API, TypeScript, SQLite, React, and modern web technologies.
