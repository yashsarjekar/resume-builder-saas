#!/bin/bash

# Script to set up email environment variables in Railway
# Run this with: railway run bash setup_railway_env.sh

echo "Setting up email environment variables in Railway..."

railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=yashsarjekar35@gmail.com
railway variables set SMTP_PASSWORD=qdmepvjkblmksdgt
railway variables set SMTP_FROM_EMAIL=noreply@resumebuilder.com
railway variables set SMTP_FROM_NAME="Resume Builder"
railway variables set EMAIL_ENABLED=true

echo "✓ Environment variables set successfully!"
echo ""
echo "Your service will automatically redeploy with the new variables."
echo "Check your Railway dashboard to verify the variables are set."
