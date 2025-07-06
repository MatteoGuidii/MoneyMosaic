# 💰 MoneyMosaic - Personal Finance Dashboard

A comprehensive personal finance dashboard that connects multiple banks and tracks all your finances in one place using the Plaid API.

![MoneyMosaic Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Test Coverage](https://img.shields.io/badge/Test%20Coverage-100%25-brightgreen)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🏗️ Architecture](#️-architecture)
- [🔧 API Endpoints](#-api-endpoints)
- [🧪 Testing](#-testing)
- [🛠️ Development](#️-development)
- [🔒 Security & Production](#-security--production)
- [❓ FAQ](#-faq)
- [📋 Common Issues](#-common-issues)
- [🎯 Next Steps](#-next-steps)

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

## 🏗️ Architecture

### System Overview

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Dashboard] --> B[Bank Management]
        A --> C[Transactions]
        A --> D[Accounts]
        A --> E[Investments]

        B --> F[Plaid Link Integration]
        C --> G[Transaction Filtering]
        D --> H[Account Overview]
        E --> I[Investment Charts]
    end

    subgraph "Backend (Node.js + Express)"
        J[Express Server] --> K[Route Handlers]
        K --> L[Services Layer]
        L --> M[Database Layer]
        L --> N[Plaid Client]

        K --> O[API Endpoints]
        O --> P["create_link_token"]
        O --> Q["exchange_public_token"]
        O --> R["management endpoints"]
        O --> S["transactions endpoint"]
    end

    subgraph "External Services"
        T[Plaid API]
        U[Bank APIs]
    end

    subgraph "Database"
        V[SQLite Database]
        V --> W[Banks Table]
        V --> X[Transactions Table]
        V --> Y[Accounts Table]
    end

    subgraph "Background Jobs"
        Z[Scheduler Service]
        Z --> AA[Transaction Sync]
        Z --> BB[Health Check]
    end

    A -.->|HTTP Requests| J
    F -.->|Link Token| P
    N -.->|API Calls| T
    T -.->|Bank Data| U
    L -.->|Store Data| V
    Z -.->|Auto Sync| AA

    style A fill:#e1f5fe
    style J fill:#f3e5f5
    style V fill:#e8f5e8
    style T fill:#fff3e0
```

### Backend Structure

```mermaid
graph TD
    subgraph "src/"
        A["server.ts<br/>Express Server Setup"]
        B["database.ts<br/>SQLite Database Layer"]
        C["plaidClient.ts<br/>Plaid API Configuration"]
        D["db.ts<br/>Database Utils"]

        subgraph "routes/"
            E["createLinkToken.ts<br/>Plaid Link Token Creation"]
            F["exchangeToken.ts<br/>Token Exchange & Bank Saving"]
            G["dashboard.ts<br/>Dashboard Data Endpoints"]
            H["transactions.ts<br/>Transaction Endpoints"]
            I["sandbox.ts<br/>Sandbox Testing"]
        end

        subgraph "services/"
            J["bankService.ts<br/>Multi-bank Connection Management"]
            K["schedulerService.ts<br/>Background Job Scheduling"]
        end
    end

    A --> E
    A --> F
    A --> G
    A --> H
    A --> I

    E --> C
    F --> C
    F --> J
    G --> J
    H --> J

    J --> B
    K --> J

    style A fill:#ff9999
    style B fill:#99ff99
    style C fill:#9999ff
    style J fill:#ffff99
    style K fill:#ff99ff
```

### Frontend Structure

```mermaid
graph TD
    subgraph "frontend/src/"
        A["main.tsx<br/>App Entry Point"]
        B["App.tsx<br/>Main App Component"]

        subgraph "pages/"
            C["Dashboard.tsx<br/>Main Dashboard View"]
            D["Transactions.tsx<br/>Transaction Management"]
            E["Accounts.tsx<br/>Account Management"]
            F["Investments.tsx<br/>Investment Overview"]
        end

        subgraph "components/"
            G["BankManagement.tsx<br/>Bank Connection Management"]
            H["TransactionsTable.tsx<br/>Transaction Display"]
            I["OverviewCards.tsx<br/>Financial Summary Cards"]
            J["FilterBar.tsx<br/>Transaction Filtering"]
            K["CashFlowInsights.tsx<br/>Cash Flow Analysis"]
            L["EarningsSummary.tsx<br/>Earnings Overview"]
            M["InvestmentsPanel.tsx<br/>Investment Details"]

            subgraph "charts/"
                N["SimplifiedChartsSection.tsx<br/>Financial Charts"]
            end

            subgraph "widgets/"
                O["BudgetSummaryWidget.tsx<br/>Budget Overview"]
                P["InvestmentSummaryWidget.tsx<br/>Investment Summary"]
                Q["RecentTransactionsWidget.tsx<br/>Recent Transactions"]
            end

            subgraph "ui/"
                R["Header.tsx<br/>App Header"]
                S["Layout.tsx<br/>Main Layout"]
                T["LoadingSpinner.tsx<br/>Loading Indicator"]
            end
        end

        subgraph "services/"
            U["apiService.ts<br/>API Communication"]
        end

        subgraph "contexts/"
            V["ThemeContext.tsx<br/>Theme Management"]
        end

        subgraph "types/"
            W["index.ts<br/>Type Definitions"]
        end
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F

    C --> G
    C --> H
    C --> I
    C --> N
    C --> O
    C --> P
    C --> Q

    D --> H
    D --> J
    E --> G
    F --> M

    B --> R
    B --> S
    B --> V

    G --> U
    H --> U
    I --> U
    N --> U

    style C fill:#e1f5fe
    style G fill:#f3e5f5
    style N fill:#e8f5e8
    style U fill:#fff3e0
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant PlaidAPI
    participant Database
    participant Scheduler

    Note over User,Scheduler: Bank Connection Flow
    User->>Frontend: Click "Connect Bank"
    Frontend->>Backend: POST /api/create_link_token
    Backend->>PlaidAPI: Create Link Token
    PlaidAPI-->>Backend: Link Token
    Backend-->>Frontend: Link Token
    Frontend->>User: Open Plaid Link
    User->>Frontend: Complete Bank Auth
    Frontend->>Backend: POST /api/exchange_public_token
    Backend->>PlaidAPI: Exchange Token
    PlaidAPI-->>Backend: Access Token
    Backend->>Database: Store Bank Connection
    Database-->>Backend: Success
    Backend-->>Frontend: Connection Success

    Note over User,Scheduler: Transaction Sync Flow
    Scheduler->>Backend: Auto Sync Trigger
    Backend->>PlaidAPI: Fetch Transactions
    PlaidAPI-->>Backend: Transaction Data
    Backend->>Database: Store/Update Transactions
    Database-->>Backend: Success

    Note over User,Scheduler: Dashboard Data Flow
    User->>Frontend: Load Dashboard
    Frontend->>Backend: GET /api/management/dashboard
    Backend->>Database: Query Financial Data
    Database-->>Backend: Financial Data
    Backend-->>Frontend: Dashboard Data
    Frontend->>User: Render Dashboard
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

### Development Commands

#### Quick Start

```bash
npm run dev:both        # Start both backend + frontend
```

#### Individual Servers

```bash
npm run dev            # Backend only (port 8080)
npm run dev:frontend   # Frontend only (port 3000)
```

#### Build & Production

```bash
npm run build          # Build both backend + frontend
npm start              # Start production server
```

#### Testing

```bash
npm test               # Run all tests
npm run test:coverage  # Run with coverage report
npm run test:watch     # Run in watch mode
```

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
