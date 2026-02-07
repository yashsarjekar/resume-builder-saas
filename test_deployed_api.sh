#!/bin/bash

API_URL="https://resume-builder-backend-production-f9db.up.railway.app"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TOKEN=""
RESUME_ID=""

echo "========================================"
echo "Testing Deployed API"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

test_endpoint() {
    local name=$1
    local response=$2
    local expected_code=$3
    
    if echo "$response" | grep -q "$expected_code"; then
        echo -e "${GREEN}✓ PASS${NC} - $name"
        ((pass_count++))
    else
        echo -e "${RED}✗ FAIL${NC} - $name"
        echo "  Response: $response"
        ((fail_count++))
    fi
}

# 1. Health Check
echo "=== 1. Health Check ==="
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
test_endpoint "GET /health" "$response" "200"
echo ""

# 2. Signup
echo "=== 2. Authentication ==="
echo "Testing with email: $TEST_EMAIL"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
test_endpoint "POST /api/auth/signup" "$response" "20"
echo ""

# 3. Login
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
  
if echo "$response" | grep -q "access_token"; then
    TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ PASS${NC} - POST /api/auth/login (Token obtained)"
    ((pass_count++))
else
    echo -e "${RED}✗ FAIL${NC} - POST /api/auth/login"
    echo "  Response: $response"
    ((fail_count++))
fi
echo ""

if [ -z "$TOKEN" ]; then
    echo "Cannot continue without token. Exiting."
    exit 1
fi

# 4. Get Current User
echo "=== 3. User Profile ==="
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /api/auth/me" "$response" "200"
echo ""

# 5. Get Subscription
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/subscription" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /api/auth/subscription" "$response" "200"
echo ""

# 6. Get Pricing
echo "=== 4. Payment Endpoints ==="
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/payment/pricing")
test_endpoint "GET /api/payment/pricing" "$response" "200"
echo ""

# 7. Create Resume
echo "=== 5. Resume CRUD ==="
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/resume/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Resume",
    "content": {
      "personalInfo": {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890"
      },
      "summary": "Experienced developer",
      "experience": [],
      "education": [],
      "skills": ["Python", "FastAPI"]
    }
  }')

if echo "$response" | grep -q '"id"'; then
    RESUME_ID=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ PASS${NC} - POST /api/resume/ (Resume created: $RESUME_ID)"
    ((pass_count++))
else
    echo -e "${RED}✗ FAIL${NC} - POST /api/resume/"
    echo "  Response: $response"
    ((fail_count++))
fi
echo ""

# 8. List Resumes
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/resume/" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /api/resume/ (List resumes)" "$response" "200"
echo ""

# 9. Get Resume by ID
if [ -n "$RESUME_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL/api/resume/$RESUME_ID" \
      -H "Authorization: Bearer $TOKEN")
    test_endpoint "GET /api/resume/{id}" "$response" "200"
    echo ""
fi

# 10. Update Resume
if [ -n "$RESUME_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/api/resume/$RESUME_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Updated Test Resume",
        "content": {
          "personalInfo": {
            "name": "Test User Updated",
            "email": "test@example.com",
            "phone": "1234567890"
          },
          "summary": "Experienced developer with updates",
          "experience": [],
          "education": [],
          "skills": ["Python", "FastAPI", "Redis"]
        }
      }')
    test_endpoint "PUT /api/resume/{id}" "$response" "200"
    echo ""
fi

# 11. Get Resume Stats
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/resume/stats/summary" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /api/resume/stats/summary" "$response" "200"
echo ""

# 12. AI Endpoints
echo "=== 6. AI Endpoints ==="

# Extract Keywords
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ai/extract-keywords" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_description": "Looking for a Python developer with FastAPI experience and Redis knowledge"}')
test_endpoint "POST /api/ai/extract-keywords" "$response" "200"
echo ""

# ATS Analysis
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ai/analyze-ats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_content": {
      "personalInfo": {"name": "Test User", "email": "test@example.com"},
      "summary": "Python developer with FastAPI and Redis experience",
      "experience": [{"title": "Software Engineer", "company": "Tech Corp", "description": "Built APIs with FastAPI"}],
      "education": [],
      "skills": ["Python", "FastAPI", "Redis"]
    },
    "job_description": "Looking for a Python developer with FastAPI experience"
  }')
test_endpoint "POST /api/ai/analyze-ats" "$response" "200"
echo ""

# Optimize Resume
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ai/optimize-resume" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_content": {
      "personalInfo": {"name": "Test User", "email": "test@example.com"},
      "summary": "Developer",
      "experience": [{"title": "Engineer", "company": "Company", "description": "Did stuff"}],
      "education": [],
      "skills": ["Python"]
    },
    "job_description": "Looking for experienced Python developer"
  }')
test_endpoint "POST /api/ai/optimize-resume" "$response" "200"
echo ""

# Generate Cover Letter
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ai/generate-cover-letter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_content": {
      "personalInfo": {"name": "Test User", "email": "test@example.com"},
      "summary": "Python developer",
      "experience": [],
      "education": [],
      "skills": ["Python", "FastAPI"]
    },
    "job_description": "Python Developer position",
    "company_name": "Tech Corp"
  }')
test_endpoint "POST /api/ai/generate-cover-letter" "$response" "200"
echo ""

# Optimize LinkedIn
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/ai/optimize-linkedin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_content": {
      "personalInfo": {"name": "Test User", "email": "test@example.com"},
      "summary": "Python developer",
      "experience": [],
      "education": [],
      "skills": ["Python"]
    }
  }')
test_endpoint "POST /api/ai/optimize-linkedin" "$response" "200"
echo ""

# 13. Delete Resume (last test)
if [ -n "$RESUME_ID" ]; then
    echo "=== 7. Delete Resume ==="
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/resume/$RESUME_ID" \
      -H "Authorization: Bearer $TOKEN")
    test_endpoint "DELETE /api/resume/{id}" "$response" "200"
    echo ""
fi

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
total=$((pass_count + fail_count))
echo "Total: $total"
percentage=$((pass_count * 100 / total))
echo "Success Rate: ${percentage}%"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
fi
