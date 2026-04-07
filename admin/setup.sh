#!/bin/bash
# Women Safety Admin Dashboard - Setup Script

echo "🚀 Women Safety Admin Dashboard Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. npm run dev    - Start development server"
    echo "2. npm run build  - Build for production"
    echo ""
    echo "Backend URL: http://192.168.0.122:3000"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
