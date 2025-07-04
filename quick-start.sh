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
PORT=8080

# Background Job Configuration
SYNC_INTERVAL_HOURS=6
EOF
        echo "✅ Created .env file. Please edit it with your Plaid credentials:"
    fi
    
    echo "   - PLAID_CLIENT_ID=your_client_id_here"
    echo "   - PLAID_SECRET=your_secret_here"
    echo ""
    echo "   💡 Get your credentials from: https://dashboard.plaid.com/"
    echo ""
    echo "⏸️  Please edit .env file and run this script again."
    exit 1
fi

# Check if required environment variables are set
source .env
if [ -z "$PLAID_CLIENT_ID" ] || [ -z "$PLAID_SECRET" ] || [ "$PLAID_CLIENT_ID" = "your_plaid_client_id" ] || [ "$PLAID_SECRET" = "your_plaid_secret_key" ]; then
    echo "❌ Please set PLAID_CLIENT_ID and PLAID_SECRET in your .env file"
    echo "   💡 Get your credentials from: https://dashboard.plaid.com/"
    exit 1
fi

# Get PORT from .env or default to 3000
PORT=${PORT:-3000}

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
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
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start both servers: npm run dev:both"
echo "   2. Open http://localhost:3000 in your browser (frontend)"
echo "   3. Backend API runs on http://localhost:$PORT"
echo "   4. Click 'Connect New Bank' to add your first bank"
echo ""
echo "💡 Alternative startup:"
echo "   - Backend only: npm run dev"
echo "   - Frontend only: npm run dev:frontend"
echo ""
echo "💡 Tips:"
echo "   - Use sandbox environment for testing"
echo "   - Connect multiple banks for a complete view"
echo "   - Background sync runs automatically every 6 hours"
echo "   - Run 'npm test' to verify everything is working"
echo ""
echo "📚 Documentation:"
echo "   - Main README.md for project overview"
echo "   - tests/README.md for testing guide"
echo "   - data/README.md for database info"
echo ""
