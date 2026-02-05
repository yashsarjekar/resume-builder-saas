#!/bin/bash

# Automated Railway Deployment Script
# Reads credentials from .env file
# Usage: ./deploy-auto.sh

set -e

echo "========================================="
echo "  Railway Deployment (Auto Mode)"
echo "  Reading credentials from .env file"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please ensure .env file exists in the backend directory"
    exit 1
fi

echo "✅ Found .env file"
echo ""

# Load .env file
export $(cat .env | grep -v '^#' | xargs)

echo "Step 1: Check Railway CLI"
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

echo ""
echo "Step 2: Login to Railway"
echo "Opening browser for authentication..."
railway login

echo ""
echo "Step 3: Initialize Railway project"
if [ ! -f "railway.json" ]; then
    echo "Creating new Railway project..."
    railway init
    echo "✅ Railway project initialized"
else
    echo "✅ Railway project already initialized"
fi

echo ""
echo "Step 4: Add Redis service"
echo "Adding Redis to your project..."
railway add redis || echo "ℹ️  Redis may already exist"

echo ""
echo "========================================="
echo "  Setting Environment Variables"
echo "========================================="
echo ""

# Function to set variable from .env
set_from_env() {
    local var_name=$1
    local var_value="${!var_name}"

    if [ -n "$var_value" ]; then
        echo "✅ Setting $var_name from .env"
        railway variables set "$var_name=$var_value"
    else
        echo "⚠️  Warning: $var_name not found in .env"
    fi
}

# Set all required variables from .env
echo "Setting variables from .env file..."
echo ""

set_from_env "DATABASE_URL"
set_from_env "ANTHROPIC_API_KEY"
set_from_env "RAZORPAY_KEY_ID"
set_from_env "RAZORPAY_KEY_SECRET"
set_from_env "RAZORPAY_WEBHOOK_SECRET"

# Generate JWT_SECRET if not in .env
if [ -n "$JWT_SECRET" ]; then
    echo "✅ Setting JWT_SECRET from .env"
    railway variables set "JWT_SECRET=$JWT_SECRET"
else
    echo "🔐 Generating new JWT_SECRET..."
    JWT_SECRET=$(openssl rand -hex 32)
    railway variables set "JWT_SECRET=$JWT_SECRET"
    echo "✅ JWT_SECRET generated and set"
fi

# Set production environment
echo "✅ Setting ENVIRONMENT=production"
railway variables set "ENVIRONMENT=production"

# Set FRONTEND_URL (allow all for now)
if [ -n "$FRONTEND_URL" ]; then
    echo "✅ Setting FRONTEND_URL from .env: $FRONTEND_URL"
    railway variables set "FRONTEND_URL=$FRONTEND_URL"
else
    echo "✅ Setting FRONTEND_URL=* (update later)"
    railway variables set "FRONTEND_URL=*"
fi

# Optional: Email settings
if [ -n "$SMTP_USER" ]; then
    echo "📧 Setting email configuration..."
    set_from_env "SMTP_HOST"
    set_from_env "SMTP_PORT"
    set_from_env "SMTP_USER"
    set_from_env "SMTP_PASSWORD"
    set_from_env "SMTP_FROM_EMAIL"
fi

echo ""
echo "========================================="
echo "  Deploying to Railway"
echo "========================================="
echo ""

echo "🚀 Deploying your backend..."
railway up

echo ""
echo "========================================="
echo "  Getting Deployment URL"
echo "========================================="
echo ""

# Generate domain if not exists
railway domain 2>/dev/null || railway domain

echo ""
echo "========================================="
echo "  Deployment Complete! 🎉"
echo "========================================="
echo ""

# Get the URL
DEPLOYMENT_URL=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "Your API is live at:"
    echo "🌐 $DEPLOYMENT_URL"
    echo ""
    echo "Test it now:"
    echo "  curl $DEPLOYMENT_URL/health"
    echo ""
    echo "View API docs:"
    echo "  $DEPLOYMENT_URL/docs"
else
    echo "Run 'railway domain' to get your deployment URL"
fi

echo ""
echo "Useful commands:"
echo "  railway logs          - View live logs"
echo "  railway open          - Open Railway dashboard"
echo "  railway variables     - View all variables"
echo "  railway up            - Deploy updates"
echo ""
echo "Next steps:"
echo "1. Test your API: curl \$(railway domain)/health"
echo "2. Update Razorpay webhook to: \$(railway domain)/api/payment/webhook"
echo "3. Build your frontend using this API URL"
echo ""
echo "🚀 Your backend is now live!"
