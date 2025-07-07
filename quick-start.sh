#!/bin/bash

# MoneyMosaic Quick Start Script
echo "🚀 MoneyMosaic Quick Start Setup"
echo "================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from template"
    else
        # Create basic .env template
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
        echo "✅ Created .env file"
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your Plaid credentials"
    echo "   Get free credentials at: https://dashboard.plaid.com/"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if npm install --silent; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if cd frontend && npm install --silent; then
    echo "✅ Frontend dependencies installed"
    cd ..
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Plaid credentials"
echo "2. Run: npm run dev:both"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation: README.md"
echo "🏗️  Architecture: docs/ARCHITECTURE.md"
