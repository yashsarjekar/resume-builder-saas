#!/usr/bin/env python3
"""
Comprehensive API Testing Script
Tests all endpoints before deployment
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{int(time.time())}@example.com"
TEST_PASSWORD = "TestPass123!"

# Test tracking
total_tests = 0
passed_tests = 0
failed_tests = 0

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
NC = '\033[0m'

def print_result(test_name, status, details=""):
    """Print test result with color"""
    global total_tests, passed_tests, failed_tests

    total_tests += 1

    if status == "PASS":
        print(f"{GREEN}✅ PASS{NC} - {test_name}")
        passed_tests += 1
    else:
        print(f"{RED}❌ FAIL{NC} - {test_name}")
        if details:
            print(f"   Details: {details}")
        failed_tests += 1

def main():
    global TOKEN, RESUME_ID
    TOKEN = ""
    RESUME_ID = None

    print("=" * 50)
    print("  COMPREHENSIVE API TESTING")
    print("=" * 50)
    print()
    print(f"Base URL: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    print()

    # ==========================================
    # 1. HEALTH & INFO ENDPOINTS
    # ==========================================
    print("### 1. Health & Info Endpoints ###")
    print()

    # Test root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200 and "Resume Builder API" in response.text:
            print_result("GET / (Root endpoint)", "PASS")
        else:
            print_result("GET / (Root endpoint)", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET / (Root endpoint)", "FAIL", str(e))

    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        if response.status_code == 200 and data.get("status") == "healthy":
            redis_status = data.get("redis", "unknown")
            if redis_status == "healthy":
                print_result("GET /health (Redis healthy)", "PASS")
            else:
                print_result("GET /health (Redis status)", "FAIL", f"Redis: {redis_status}")
        else:
            print_result("GET /health", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET /health", "FAIL", str(e))

    print()

    # ==========================================
    # 2. AUTHENTICATION ENDPOINTS
    # ==========================================
    print("### 2. Authentication Endpoints ###")
    print()

    # Test signup
    try:
        signup_data = {
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)
        data = response.json()

        # Signup returns user object (not token), so check for id and email
        if response.status_code in [200, 201] and "id" in data and data.get("email") == TEST_EMAIL:
            print_result("POST /api/auth/signup", "PASS")
        else:
            print_result("POST /api/auth/signup", "FAIL", f"HTTP {response.status_code} - {data}")
    except Exception as e:
        print_result("POST /api/auth/signup", "FAIL", str(e))

    # Test login
    try:
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        data = response.json()

        if response.status_code == 200 and "access_token" in data:
            TOKEN = data["access_token"]
            print_result("POST /api/auth/login", "PASS")
        else:
            print_result("POST /api/auth/login", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("POST /api/auth/login", "FAIL", str(e))

    # Test get current user
    try:
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        data = response.json()

        if response.status_code == 200 and data.get("email") == TEST_EMAIL:
            print_result("GET /api/auth/me", "PASS")
        else:
            print_result("GET /api/auth/me", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET /api/auth/me", "FAIL", str(e))

    # Test subscription info
    try:
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/auth/subscription", headers=headers)
        data = response.json()

        if response.status_code == 200 and "subscription_type" in data:
            print_result("GET /api/auth/subscription", "PASS")
        else:
            print_result("GET /api/auth/subscription", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET /api/auth/subscription", "FAIL", str(e))

    print()

    # ==========================================
    # 3. RESUME ENDPOINTS
    # ==========================================
    print("### 3. Resume Endpoints ###")
    print()

    # Test create resume
    try:
        resume_data = {
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
                "skills": []
            }
        }
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.post(f"{BASE_URL}/api/resume/", json=resume_data, headers=headers)
        data = response.json()

        if response.status_code in [200, 201] and "id" in data:
            RESUME_ID = data["id"]
            print_result("POST /api/resume/ (Create resume)", "PASS")
        else:
            print_result("POST /api/resume/ (Create resume)", "FAIL", f"HTTP {response.status_code} - {data}")
    except Exception as e:
        print_result("POST /api/resume/ (Create resume)", "FAIL", str(e))

    # Test list resumes
    try:
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/resume/", headers=headers)

        if response.status_code == 200:
            print_result("GET /api/resume/ (List resumes)", "PASS")
        else:
            print_result("GET /api/resume/ (List resumes)", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET /api/resume/ (List resumes)", "FAIL", str(e))

    # Test get specific resume
    if RESUME_ID:
        try:
            headers = {"Authorization": f"Bearer {TOKEN}"}
            response = requests.get(f"{BASE_URL}/api/resume/{RESUME_ID}", headers=headers)
            data = response.json()

            if response.status_code == 200 and data.get("title") == "Test Resume":
                print_result("GET /api/resume/{id} (Get resume)", "PASS")
            else:
                print_result("GET /api/resume/{id} (Get resume)", "FAIL", f"HTTP {response.status_code}")
        except Exception as e:
            print_result("GET /api/resume/{id} (Get resume)", "FAIL", str(e))

    # Test update resume
    if RESUME_ID:
        try:
            update_data = {
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
                    "skills": []
                }
            }
            headers = {"Authorization": f"Bearer {TOKEN}"}
            response = requests.put(f"{BASE_URL}/api/resume/{RESUME_ID}", json=update_data, headers=headers)

            if response.status_code == 200:
                print_result("PUT /api/resume/{id} (Update resume)", "PASS")
            else:
                print_result("PUT /api/resume/{id} (Update resume)", "FAIL", f"HTTP {response.status_code}")
        except Exception as e:
            print_result("PUT /api/resume/{id} (Update resume)", "FAIL", str(e))

    # Test resume stats
    try:
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/resume/stats/summary", headers=headers)

        if response.status_code == 200:
            print_result("GET /api/resume/stats/summary", "PASS")
        else:
            print_result("GET /api/resume/stats/summary", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("GET /api/resume/stats/summary", "FAIL", str(e))

    print()

    # ==========================================
    # 4. PAYMENT ENDPOINTS
    # ==========================================
    print("### 4. Payment Endpoints ###")
    print()

    # Test get pricing
    try:
        response = requests.get(f"{BASE_URL}/api/payment/pricing")
        data = response.json()

        if response.status_code == 200 and ("pricing_plans" in data or "plans" in data or "free" in data):
            print_result("GET /api/payment/pricing", "PASS")
        else:
            print_result("GET /api/payment/pricing", "FAIL", f"HTTP {response.status_code} - {list(data.keys())}")
    except Exception as e:
        print_result("GET /api/payment/pricing", "FAIL", str(e))

    print()

    # ==========================================
    # 5. AI ENDPOINTS (WITH QUOTA PROTECTION)
    # ==========================================
    print("### 5. AI Endpoints ###")
    print()

    # Test extract keywords (with quota protection)
    try:
        keywords_data = {
            "job_description": "Looking for a Python developer with FastAPI experience",
            "max_keywords": 10
        }
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.post(f"{BASE_URL}/api/ai/extract-keywords", json=keywords_data, headers=headers)
        data = response.json() if response.status_code != 500 else {}

        if response.status_code == 200 and "keywords" in data:
            print_result("POST /api/ai/extract-keywords (with quota)", "PASS")
        elif response.status_code == 429:
            print_result("POST /api/ai/extract-keywords (quota limit)", "PASS", "Rate limited as expected")
        else:
            print_result("POST /api/ai/extract-keywords", "FAIL", f"HTTP {response.status_code} - {str(data)[:100]}")
    except Exception as e:
        print_result("POST /api/ai/extract-keywords", "FAIL", str(e))

    # Test ATS analysis
    try:
        ats_data = {
            "resume_content": {
                "personalInfo": {"name": "Test User", "email": "test@example.com"},
                "summary": "Python developer",
                "experience": [],
                "education": [],
                "skills": ["Python", "FastAPI"]
            },
            "job_description": "Looking for a Python developer with FastAPI experience"
        }
        headers = {"Authorization": f"Bearer {TOKEN}"}
        response = requests.post(f"{BASE_URL}/api/ai/analyze-ats", json=ats_data, headers=headers)
        data = response.json() if response.status_code != 500 else {}

        if response.status_code == 200 and "ats_score" in data:
            print_result("POST /api/ai/analyze-ats", "PASS")
        elif response.status_code in [403, 429]:
            print_result("POST /api/ai/analyze-ats (limit reached)", "PASS", "Limit enforced")
        else:
            print_result("POST /api/ai/analyze-ats", "FAIL", f"HTTP {response.status_code} - {str(data)[:100]}")
    except Exception as e:
        print_result("POST /api/ai/analyze-ats", "FAIL", str(e))

    print()

    # ==========================================
    # 6. RATE LIMITING TESTS
    # ==========================================
    print("### 6. Rate Limiting Tests ###")
    print()

    # Test auth rate limit (5 req/min)
    print("Testing auth endpoint rate limiting (5 req/min)...")
    auth_limited = False
    for i in range(7):
        try:
            response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": "fake@test.com", "password": "wrong"}
            )
            if response.status_code == 429:
                auth_limited = True
                break
            time.sleep(0.2)
        except Exception:
            pass

    if auth_limited:
        print_result("Auth rate limiting (5 req/min)", "PASS")
    else:
        print_result("Auth rate limiting", "FAIL", "Did not get rate limited")

    # Test rate limit headers
    try:
        response = requests.get(f"{BASE_URL}/")
        if "x-ratelimit-limit" in response.headers:
            print_result("Rate limit headers present", "PASS")
        else:
            print_result("Rate limit headers present", "FAIL")
    except Exception as e:
        print_result("Rate limit headers present", "FAIL", str(e))

    print()

    # ==========================================
    # 7. ERROR HANDLING
    # ==========================================
    print("### 7. Error Handling ###")
    print()

    # Test 404 not found
    try:
        response = requests.get(f"{BASE_URL}/api/nonexistent")
        if response.status_code == 404:
            print_result("404 Not Found handling", "PASS")
        else:
            print_result("404 Not Found handling", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("404 Not Found handling", "FAIL", str(e))

    # Test unauthorized access
    try:
        response = requests.get(f"{BASE_URL}/api/auth/me")
        if response.status_code == 401:
            print_result("401 Unauthorized handling", "PASS")
        else:
            print_result("401 Unauthorized handling", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("401 Unauthorized handling", "FAIL", str(e))

    # Test invalid JSON
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        if response.status_code in [422, 400]:
            print_result("Invalid JSON handling", "PASS")
        else:
            print_result("Invalid JSON handling", "FAIL", f"HTTP {response.status_code}")
    except Exception as e:
        print_result("Invalid JSON handling", "FAIL", str(e))

    print()

    # ==========================================
    # CLEANUP
    # ==========================================
    print("### Cleanup ###")
    print()

    # Delete test resume
    if RESUME_ID:
        try:
            headers = {"Authorization": f"Bearer {TOKEN}"}
            response = requests.delete(f"{BASE_URL}/api/resume/{RESUME_ID}", headers=headers)

            if response.status_code in [200, 204]:
                print_result("DELETE /api/resume/{id} (Cleanup)", "PASS")
            else:
                print_result("DELETE /api/resume/{id} (Cleanup)", "FAIL", f"HTTP {response.status_code}")
        except Exception as e:
            print_result("DELETE /api/resume/{id} (Cleanup)", "FAIL", str(e))

    print()
    print("=" * 50)
    print("  TEST SUMMARY")
    print("=" * 50)
    print()
    print(f"Total Tests: {total_tests}")
    print(f"{GREEN}Passed: {passed_tests}{NC}")
    if failed_tests > 0:
        print(f"{RED}Failed: {failed_tests}{NC}")
    else:
        print(f"Failed: {failed_tests}")
    print()

    if failed_tests == 0:
        print(f"{GREEN}✅ ALL TESTS PASSED! Ready for deployment.{NC}")
        return 0
    else:
        print(f"{YELLOW}⚠️  Some tests failed. Review before deployment.{NC}")
        return 1

if __name__ == "__main__":
    exit(main())
