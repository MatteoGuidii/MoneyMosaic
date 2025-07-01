#!/bin/bash

# MoneyMosaic Quick Start Script

echo "🚀 MoneyMosaic Quick Start"
echo "========================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found."
    
    if [ -f .env.example ]; then
        echo "📋 Creating .env from .env.example template..."
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your Plaid credentials:"
    else
        echo "📋 Creating .env file with template..."
        cat > .env << 'EOF'
# Plaid API Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENV=sandbox
PLAID_REDIRECT_URI=http://localhost:3000/oauth-return

# Server Configuration
PORT=3000

# Background Job Configuration
SYNC_INTERVAL_HOURS=6
EOF
        echo "✅ Created .env file. Please edit it with your Plaid credentials:"
    fi
    
    echo "   - PLAID_CLIENT_ID=your_client_id_here"
    echo "   - PLAID_SECRET=your_secret_here"
    echo ""
    echo "   Get your credentials from: https://dashboard.plaid.com/"
    echo ""
    echo "⏸️  Please edit .env file and run this script again."
    exit 1
fi

# Check if required environment variables are set
source .env
if [ -z "$PLAID_CLIENT_ID" ] || [ -z "$PLAID_SECRET" ]; then
    echo "❌ Please set PLAID_CLIENT_ID and PLAID_SECRET in your .env file"
    echo "   Get your credentials from: https://dashboard.plaid.com/"
    exit 1
fi

# Get PORT from .env or default to 3000
PORT=${PORT:-3000}

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
    echo "🗄️  Creating data directory..."
    mkdir -p data
    echo ""
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Open http://localhost:$PORT in your browser"
echo "   3. Click 'Connect New Bank' to add your first bank"
echo ""
echo "💡 Tips:"
echo "   - Use sandbox environment for testing"
echo "   - Connect multiple banks for a complete view"
echo "   - Background sync runs automatically every 6 hours"
echo "   - Check README.md for more details"
echo ""
