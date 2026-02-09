#!/bin/bash

# Test production signup and email service

API_URL="https://resume-builder-backend-production-f9db.up.railway.app"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"

echo "================================"
echo "Testing Production Email Service"
echo "================================"
echo ""

echo "1. API Health Check:"
curl -s "${API_URL}/health"
echo ""
echo ""

echo "2. Creating test user: ${TEST_EMAIL}"
echo ""

curl -X POST "${API_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPass123!\"
  }"

echo ""
echo ""
echo "================================"
echo "Verification Steps:"
echo "================================"
echo ""
echo "1. Check Railway logs for email:"
echo "   railway logs --tail 50 | grep -E '(email|Email|Resend)'"
echo ""
echo "2. Look for these messages:"
echo "   ✅ 'Resend email service initialized successfully'"
echo "   ✅ 'Email sent successfully to ${TEST_EMAIL}'"
echo ""
echo "3. Check Resend dashboard:"
echo "   https://resend.com/emails"
echo ""
echo "4. If email failed, check for errors:"
echo "   railway logs --tail 100 | grep -i error"
echo ""
