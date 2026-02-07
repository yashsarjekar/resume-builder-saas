"""
Test email service in production via Railway.
This script will test a signup and check if the email is sent.
"""

import requests
import time
import sys

# Production API URL
API_URL = "https://resume-builder-backend-production-f9db.up.railway.app"

def test_production_email():
    """Test email sending in production by creating a user."""

    print("=== Testing Production Email Service ===\n")

    # Generate unique test email
    timestamp = int(time.time())
    test_email = f"emailtest_{timestamp}@example.com"
    test_password = "TestPassword123!"

    print(f"1. Creating test user: {test_email}")
    print(f"   API URL: {API_URL}")
    print()

    # Try to sign up
    try:
        response = requests.post(
            f"{API_URL}/api/auth/signup",
            json={
                "name": "Email Test User",
                "email": test_email,
                "password": test_password
            },
            timeout=10
        )

        print(f"2. Signup Response:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        print()

        if response.status_code in [200, 201]:
            print("✓ User created successfully!")
            print()
            print("3. Check Railway logs for email sending:")
            print("   Run: railway logs --tail 50")
            print()
            print("   Look for one of these messages:")
            print("   ✓ 'Email sent successfully to...'")
            print("   ✗ 'Failed to send email to...'")
            print("   ✗ 'SMTP credentials not configured'")
            print("   ✗ Authentication failed")
            print()
            print("4. Common issues if email fails:")
            print("   - Gmail App Password is invalid or expired")
            print("   - Gmail is blocking Railway's IP addresses")
            print("   - SMTP connection timeout/firewall")
            print("   - 2FA not enabled on Gmail account")
            print()
            print("Next steps:")
            print("1. Check Railway logs: railway logs --tail 50")
            print("2. If you see authentication errors, generate a new Gmail App Password")
            print("3. Update SMTP_PASSWORD in Railway variables")

            return True
        else:
            print(f"✗ Failed to create user: {response.status_code}")
            print(f"   Error: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("✗ Connection Error: Cannot reach the API")
        print("   Check if your Railway service is running")
        return False
    except requests.exceptions.Timeout:
        print("✗ Timeout: API took too long to respond")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_production_email()
    sys.exit(0 if success else 1)
