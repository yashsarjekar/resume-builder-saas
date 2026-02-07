"""Test email service connection."""

import os
import sys
from app.services.email_service import email_service

def test_email_connection():
    """Test if email service can send a test email."""
    print("Testing Resend HTTP API email service...")
    print(f"Resend API Key: {'*' * 20 if email_service.resend_api_key else 'NOT SET'}")
    print(f"From Email: {email_service.from_email}")
    print(f"From Name: {email_service.from_name}")
    print(f"Email Enabled: {email_service.enabled}")
    print()

    # Try to send a test email
    print("Attempting to send test email via Resend HTTP API...")

    # Use a real email address for testing
    test_recipient = "yashsarjekar35@gmail.com"  # Change this to your email
    print(f"Sending test email to: {test_recipient}")
    print()

    try:
        result = email_service.send_email(
            to_email=test_recipient,
            subject="Test Email - Resume Builder",
            html_content="<h1>Test Email</h1><p>This is a test email from the Resume Builder email service.</p>",
            text_content="This is a test email from the Resume Builder email service."
        )

        if result:
            print("✓ Email sent successfully!")
            return True
        else:
            print("✗ Email sending failed - check logs above for errors")
            return False

    except Exception as e:
        print(f"✗ Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_email_connection()
    sys.exit(0 if success else 1)
