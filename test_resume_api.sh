#!/bin/bash
# Test script to verify resume API on deployed backend

API_URL="https://resume-builder-backend-production-f9db.up.railway.app"

echo "========================================="
echo "Testing Resume API on Production Backend"
echo "========================================="
echo ""

# First, you need to login and get a token
echo "Step 1: Login (you'll need to create a test account first)"
echo "Run this command with your credentials:"
echo ""
echo "curl -X POST \"$API_URL/api/auth/login\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"your-email@example.com\",\"password\":\"your-password\"}'"
echo ""
echo "Copy the access_token from the response and use it below:"
echo ""

# Example: Test with token
read -p "Enter your access token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "No token provided. Exiting."
    exit 1
fi

echo ""
echo "========================================="
echo "Testing: GET /api/resume/ (List Resumes)"
echo "========================================="
curl -X GET "$API_URL/api/resume/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo ""
echo "========================================="
echo "Testing: GET /api/auth/me (Current User)"
echo "========================================="
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo ""
echo "Done! Check the responses above."
echo "If 'resumes' is an empty array [], the backend is working but you have no resumes yet."
echo "If you get an error, there's an authentication or API issue."
