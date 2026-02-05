#!/bin/bash

# Quick Railway Deployment Script
# Usage: ./deploy.sh

set -e

echo "========================================="
echo "  Railway Deployment Script"
echo "========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

echo ""
echo "Step 1: Login to Railway"
echo "This will open your browser..."
railway login

echo ""
echo "Step 2: Initialize Railway project"
if [ ! -f "railway.json" ]; then
    railway init
else
    echo "✅ Railway project already initialized"
fi

echo ""
echo "Step 3: Add Redis"
echo "Adding Redis service to your project..."
railway add redis || echo "⚠️  Redis may already exist"

echo ""
echo "========================================="
echo "  Environment Variables Setup"
echo "========================================="
echo ""
echo "Please set the following environment variables:"
echo ""

# Function to set variable with user input
set_variable() {
    local var_name=$1
    local var_description=$2
    local var_example=$3

    echo "Setting $var_name ($var_description)"
    if [ -n "$var_example" ]; then
        echo "Example: $var_example"
    fi

    # Check if variable already exists
    existing_value=$(railway variables | grep "^$var_name" || echo "")

    if [ -n "$existing_value" ]; then
        echo "✅ $var_name already set"
        read -p "Do you want to update it? (y/N): " update
        if [[ ! $update =~ ^[Yy]$ ]]; then
            return
        fi
    fi

    read -p "Enter $var_name: " var_value

    if [ -n "$var_value" ]; then
        railway variables set "$var_name=$var_value"
        echo "✅ $var_name set"
    else
        echo "⚠️  Skipped $var_name"
    fi
    echo ""
}

# Set required variables
set_variable "DATABASE_URL" "Supabase PostgreSQL URL" "postgresql://postgres:pass@db.supabase.co:5432/postgres"
set_variable "ANTHROPIC_API_KEY" "Anthropic API key for Claude AI" "sk-ant-..."
set_variable "RAZORPAY_KEY_ID" "Razorpay Key ID" "rzp_test_..."
set_variable "RAZORPAY_KEY_SECRET" "Razorpay Secret" ""
set_variable "RAZORPAY_WEBHOOK_SECRET" "Razorpay Webhook Secret" ""

# Set auto-generated variables
echo "Setting JWT_SECRET (auto-generated)..."
JWT_SECRET=$(openssl rand -hex 32)
railway variables set "JWT_SECRET=$JWT_SECRET"
echo "✅ JWT_SECRET set (auto-generated)"
echo ""

echo "Setting ENVIRONMENT=production..."
railway variables set "ENVIRONMENT=production"
echo "✅ ENVIRONMENT set"
echo ""

echo "Setting FRONTEND_URL=*..."
railway variables set "FRONTEND_URL=*"
echo "✅ FRONTEND_URL set (update later with actual frontend URL)"
echo ""

echo "========================================="
echo "  Deploying to Railway"
echo "========================================="
echo ""
echo "Deploying your backend..."
railway up

echo ""
echo "========================================="
echo "  Deployment Complete! 🎉"
echo "========================================="
echo ""

# Get the deployment URL
echo "Getting your deployment URL..."
railway domain

echo ""
echo "Next steps:"
echo "1. Test your API: curl \$(railway domain)/health"
echo "2. View logs: railway logs"
echo "3. Open dashboard: railway open"
echo ""
echo "Your backend is now live! 🚀"
