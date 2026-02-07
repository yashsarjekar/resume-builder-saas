#!/bin/bash

# Script to test production email service on Railway

API_URL="https://resume-builder-backend-production-f9db.up.railway.app"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_email_${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"

echo "========================================"
echo "Testing Production Email Service"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check API Health
echo "1. Checking API Health..."
health_response=$(curl -s --max-time 5 "$API_URL/health")
if echo "$health_response" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} API is healthy"
    echo "   Response: $health_response"
else
    echo -e "${RED}✗${NC} API is not responding properly"
    echo "   Response: $health_response"
    exit 1
fi
echo ""

# 2. Create test user (should trigger welcome email)
echo "2. Creating test user (will trigger welcome email)..."
echo "   Email: $TEST_EMAIL"
echo ""

signup_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" --max-time 15 -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Email Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

http_status=$(echo "$signup_response" | grep "HTTP_STATUS:" | cut -d: -f2)
response_body=$(echo "$signup_response" | sed '/HTTP_STATUS:/d')

echo "   HTTP Status: $http_status"
echo "   Response: $response_body"
echo ""

if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
    echo -e "${GREEN}✓${NC} User created successfully!"
    echo ""
    echo -e "${YELLOW}⚠ Important: Check Railway logs for email status${NC}"
    echo ""
    echo "Run this command to check logs:"
    echo "  railway logs --tail 50 | grep -i email"
    echo ""
    echo "Look for one of these messages:"
    echo "  ${GREEN}✓${NC} 'Email sent successfully to $TEST_EMAIL'"
    echo "  ${RED}✗${NC} 'Failed to send email to $TEST_EMAIL'"
    echo ""
    echo "Also check these:"
    echo "  1. Your email inbox: test_email_${TIMESTAMP}@example.com (if you own this domain)"
    echo "  2. Resend dashboard: https://resend.com/emails"
    echo "  3. Railway logs for any SMTP errors"
    echo ""
    exit 0
else
    echo -e "${RED}✗${NC} Failed to create user"
    echo ""
    echo "Possible issues:"
    echo "  - Database connection problem"
    echo "  - Validation error"
    echo "  - User already exists"
    echo ""
    exit 1
fi
