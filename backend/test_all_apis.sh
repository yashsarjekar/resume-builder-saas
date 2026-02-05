#!/bin/bash

# Comprehensive API Testing Script
# Tests all endpoints before deployment

BASE_URL="http://localhost:8000"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"
TOKEN=""
RESUME_ID=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        if [ -n "$details" ]; then
            echo "   Details: $details"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make API call
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local auth="$4"

    if [ "$method" = "GET" ]; then
        if [ -n "$auth" ]; then
            curl -s -w "\n%{http_code}" -H "Authorization: Bearer $auth" "$BASE_URL$endpoint"
        else
            curl -s -w "\n%{http_code}" "$BASE_URL$endpoint"
        fi
    else
        if [ -n "$auth" ]; then
            curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data" \
                "$BASE_URL$endpoint"
        else
            curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint"
        fi
    fi
}

echo "========================================="
echo "  COMPREHENSIVE API TESTING"
echo "========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# ==========================================
# 1. HEALTH & INFO ENDPOINTS
# ==========================================
echo "### 1. Health & Info Endpoints ###"
echo ""

# Test root endpoint
response=$(api_call GET "/")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "Resume Builder API"; then
    print_result "GET / (Root endpoint)" "PASS"
else
    print_result "GET / (Root endpoint)" "FAIL" "HTTP $http_code"
fi

# Test health endpoint
response=$(api_call GET "/health")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "healthy"; then
    redis_status=$(echo "$body" | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)
    if [ "$redis_status" = "healthy" ]; then
        print_result "GET /health (Redis healthy)" "PASS"
    else
        print_result "GET /health (Redis status)" "FAIL" "Redis: $redis_status"
    fi
else
    print_result "GET /health" "FAIL" "HTTP $http_code"
fi

echo ""

# ==========================================
# 2. AUTHENTICATION ENDPOINTS
# ==========================================
echo "### 2. Authentication Endpoints ###"
echo ""

# Test signup
signup_data="{\"full_name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
response=$(api_call POST "/api/auth/signup" "$signup_data")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        print_result "POST /api/auth/signup" "PASS"
    else
        print_result "POST /api/auth/signup" "FAIL" "No token received"
    fi
else
    print_result "POST /api/auth/signup" "FAIL" "HTTP $http_code - $(echo $body | head -c 100)"
fi

# Test login
login_data="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"
response=$(api_call POST "/api/auth/login" "$login_data")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        print_result "POST /api/auth/login" "PASS"
    else
        print_result "POST /api/auth/login" "FAIL" "No token received"
    fi
else
    print_result "POST /api/auth/login" "FAIL" "HTTP $http_code"
fi

# Test get current user
response=$(api_call GET "/api/auth/me" "" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "$TEST_EMAIL"; then
    print_result "GET /api/auth/me" "PASS"
else
    print_result "GET /api/auth/me" "FAIL" "HTTP $http_code"
fi

# Test subscription info
response=$(api_call GET "/api/auth/subscription" "" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "subscription_type"; then
    print_result "GET /api/auth/subscription" "PASS"
else
    print_result "GET /api/auth/subscription" "FAIL" "HTTP $http_code"
fi

echo ""

# ==========================================
# 3. RESUME ENDPOINTS
# ==========================================
echo "### 3. Resume Endpoints ###"
echo ""

# Test create resume
resume_data='{
  "title": "Test Resume",
  "content": {
    "personal_info": {
      "full_name": "Test User",
      "email": "test@example.com",
      "phone": "1234567890"
    },
    "summary": "Experienced developer",
    "experience": [],
    "education": [],
    "skills": []
  }
}'
response=$(api_call POST "/api/resume/" "$resume_data" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    RESUME_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    if [ -n "$RESUME_ID" ]; then
        print_result "POST /api/resume/ (Create resume)" "PASS"
    else
        print_result "POST /api/resume/ (Create resume)" "FAIL" "No ID received"
    fi
else
    print_result "POST /api/resume/ (Create resume)" "FAIL" "HTTP $http_code"
fi

# Test list resumes
response=$(api_call GET "/api/resume/" "" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_result "GET /api/resume/ (List resumes)" "PASS"
else
    print_result "GET /api/resume/ (List resumes)" "FAIL" "HTTP $http_code"
fi

# Test get specific resume
if [ -n "$RESUME_ID" ]; then
    response=$(api_call GET "/api/resume/$RESUME_ID" "" "$TOKEN")
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ] && echo "$body" | grep -q "Test Resume"; then
        print_result "GET /api/resume/{id} (Get resume)" "PASS"
    else
        print_result "GET /api/resume/{id} (Get resume)" "FAIL" "HTTP $http_code"
    fi
fi

# Test update resume
if [ -n "$RESUME_ID" ]; then
    update_data='{
      "title": "Updated Test Resume",
      "content": {
        "personal_info": {
          "full_name": "Test User Updated",
          "email": "test@example.com",
          "phone": "1234567890"
        },
        "summary": "Experienced developer with updates",
        "experience": [],
        "education": [],
        "skills": []
      }
    }'
    response=$(api_call PUT "/api/resume/$RESUME_ID" "$update_data" "$TOKEN")
    http_code=$(echo "$response" | tail -1)

    if [ "$http_code" = "200" ]; then
        print_result "PUT /api/resume/{id} (Update resume)" "PASS"
    else
        print_result "PUT /api/resume/{id} (Update resume)" "FAIL" "HTTP $http_code"
    fi
fi

# Test resume stats
response=$(api_call GET "/api/resume/stats/summary" "" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_result "GET /api/resume/stats/summary" "PASS"
else
    print_result "GET /api/resume/stats/summary" "FAIL" "HTTP $http_code"
fi

echo ""

# ==========================================
# 4. PAYMENT ENDPOINTS
# ==========================================
echo "### 4. Payment Endpoints ###"
echo ""

# Test get pricing
response=$(api_call GET "/api/payment/pricing")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "pricing_plans"; then
    print_result "GET /api/payment/pricing" "PASS"
else
    print_result "GET /api/payment/pricing" "FAIL" "HTTP $http_code"
fi

echo ""

# ==========================================
# 5. AI ENDPOINTS (WITH QUOTA PROTECTION)
# ==========================================
echo "### 5. AI Endpoints ###"
echo ""

# Test extract keywords (with quota protection)
keywords_data='{
  "job_description": "Looking for a Python developer with FastAPI experience",
  "max_keywords": 10
}'
response=$(api_call POST "/api/ai/extract-keywords" "$keywords_data" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "keywords"; then
    print_result "POST /api/ai/extract-keywords (with quota)" "PASS"
elif [ "$http_code" = "429" ]; then
    print_result "POST /api/ai/extract-keywords (quota limit)" "PASS" "Rate limited as expected"
else
    print_result "POST /api/ai/extract-keywords" "FAIL" "HTTP $http_code - $(echo $body | head -c 100)"
fi

# Test ATS analysis
ats_data='{
  "resume_content": {
    "personal_info": {"full_name": "Test User", "email": "test@example.com"},
    "summary": "Python developer",
    "experience": [],
    "education": [],
    "skills": ["Python", "FastAPI"]
  },
  "job_description": "Looking for a Python developer with FastAPI experience"
}'
response=$(api_call POST "/api/ai/analyze-ats" "$ats_data" "$TOKEN")
http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] && echo "$body" | grep -q "ats_score"; then
    print_result "POST /api/ai/analyze-ats" "PASS"
elif [ "$http_code" = "403" ] || [ "$http_code" = "429" ]; then
    print_result "POST /api/ai/analyze-ats (limit reached)" "PASS" "Limit enforced"
else
    print_result "POST /api/ai/analyze-ats" "FAIL" "HTTP $http_code - $(echo $body | head -c 100)"
fi

echo ""

# ==========================================
# 6. RATE LIMITING TESTS
# ==========================================
echo "### 6. Rate Limiting Tests ###"
echo ""

# Test auth rate limit (5 req/min)
echo "Testing auth endpoint rate limiting (5 req/min)..."
auth_limited=false
for i in {1..7}; do
    response=$(api_call POST "/api/auth/login" '{"email":"fake@test.com","password":"wrong"}')
    http_code=$(echo "$response" | tail -1)

    if [ "$http_code" = "429" ]; then
        auth_limited=true
        break
    fi
    sleep 0.2
done

if [ "$auth_limited" = true ]; then
    print_result "Auth rate limiting (5 req/min)" "PASS"
else
    print_result "Auth rate limiting" "FAIL" "Did not get rate limited"
fi

# Test rate limit headers
response=$(curl -s -i "$BASE_URL/" 2>&1)
if echo "$response" | grep -q "x-ratelimit-limit"; then
    print_result "Rate limit headers present" "PASS"
else
    print_result "Rate limit headers present" "FAIL"
fi

echo ""

# ==========================================
# 7. ERROR HANDLING
# ==========================================
echo "### 7. Error Handling ###"
echo ""

# Test 404 not found
response=$(api_call GET "/api/nonexistent")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "404" ]; then
    print_result "404 Not Found handling" "PASS"
else
    print_result "404 Not Found handling" "FAIL" "HTTP $http_code"
fi

# Test unauthorized access
response=$(api_call GET "/api/auth/me")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "401" ]; then
    print_result "401 Unauthorized handling" "PASS"
else
    print_result "401 Unauthorized handling" "FAIL" "HTTP $http_code"
fi

# Test invalid JSON
response=$(api_call POST "/api/auth/signup" "invalid json")
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "422" ] || [ "$http_code" = "400" ]; then
    print_result "Invalid JSON handling" "PASS"
else
    print_result "Invalid JSON handling" "FAIL" "HTTP $http_code"
fi

echo ""

# ==========================================
# CLEANUP
# ==========================================
echo "### Cleanup ###"
echo ""

# Delete test resume
if [ -n "$RESUME_ID" ]; then
    response=$(api_call DELETE "/api/resume/$RESUME_ID" "" "$TOKEN")
    http_code=$(echo "$response" | tail -1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        print_result "DELETE /api/resume/{id} (Cleanup)" "PASS"
    else
        print_result "DELETE /api/resume/{id} (Cleanup)" "FAIL" "HTTP $http_code"
    fi
fi

echo ""
echo "========================================="
echo "  TEST SUMMARY"
echo "========================================="
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
else
    echo "Failed: $FAILED_TESTS"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review before deployment.${NC}"
    exit 1
fi
