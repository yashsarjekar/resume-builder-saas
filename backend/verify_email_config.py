"""
Verify email configuration script.
This script checks if all required email environment variables are set.
Use this in production to verify email service configuration.
"""

import os
import sys

def verify_email_config():
    """Verify email service configuration."""
    print("=== Email Service Configuration Check ===\n")

    required_vars = {
        "SMTP_HOST": os.getenv("SMTP_HOST"),
        "SMTP_PORT": os.getenv("SMTP_PORT"),
        "SMTP_USER": os.getenv("SMTP_USER"),
        "SMTP_PASSWORD": os.getenv("SMTP_PASSWORD"),
        "SMTP_FROM_EMAIL": os.getenv("SMTP_FROM_EMAIL"),
        "SMTP_FROM_NAME": os.getenv("SMTP_FROM_NAME"),
        "EMAIL_ENABLED": os.getenv("EMAIL_ENABLED"),
    }

    all_set = True
    for var_name, var_value in required_vars.items():
        if var_value is None:
            print(f"✗ {var_name}: NOT SET")
            all_set = False
        else:
            # Mask password
            if "PASSWORD" in var_name:
                display_value = "*" * len(var_value)
            else:
                display_value = var_value
            print(f"✓ {var_name}: {display_value}")

    print()

    if all_set:
        print("✓ All email environment variables are configured!")

        # Try to import and check service
        try:
            from app.services.email_service import email_service
            print(f"✓ Email service initialized")
            print(f"  - Enabled: {email_service.enabled}")
            print(f"  - SMTP Host: {email_service.smtp_host}:{email_service.smtp_port}")
            print(f"  - From: {email_service.from_name} <{email_service.from_email}>")

            if email_service.smtp_user and email_service.smtp_password:
                print("✓ SMTP credentials are configured")
            else:
                print("✗ SMTP credentials are missing!")
                all_set = False

        except Exception as e:
            print(f"✗ Error initializing email service: {e}")
            all_set = False
    else:
        print("✗ Some email environment variables are missing!")
        print("\nTo fix this in Railway:")
        print("1. Go to your Railway project")
        print("2. Select your backend service")
        print("3. Go to Variables tab")
        print("4. Add the missing environment variables")
        print("\nOr use the Railway CLI:")
        print("  railway variables set VARIABLE_NAME=value")

    return all_set

if __name__ == "__main__":
    success = verify_email_config()
    sys.exit(0 if success else 1)
