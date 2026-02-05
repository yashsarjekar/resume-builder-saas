"""
Test cases for authentication endpoints.

This module contains comprehensive tests for all authentication-related
API endpoints including signup, login, and profile management.
"""

import pytest
from fastapi import status


class TestSignup:
    """Test cases for POST /api/auth/signup endpoint."""

    def test_signup_success(self, client):
        """Test successful user registration."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "newuser@example.com",
                "name": "New User",
                "password": "secure123"
            }
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert data["subscription_type"] == "free"
        assert data["resume_count"] == 0
        assert data["ats_analysis_count"] == 0
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data

    def test_signup_duplicate_email(self, client, test_user):
        """Test signup with already registered email."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "name": "Another User",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"].lower()

    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "not-an-email",
                "name": "Test User",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_signup_weak_password(self, client):
        """Test signup with password that doesn't meet requirements."""
        # Password without digits
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "user@example.com",
                "name": "Test User",
                "password": "onlyletters"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_signup_short_password(self, client):
        """Test signup with password shorter than minimum length."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "user@example.com",
                "name": "Test User",
                "password": "short1"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_signup_empty_name(self, client):
        """Test signup with empty name."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "user@example.com",
                "name": "   ",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_signup_short_name(self, client):
        """Test signup with name shorter than minimum length."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "user@example.com",
                "name": "A",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogin:
    """Test cases for POST /api/auth/login endpoint."""

    def test_login_success(self, client, test_user):
        """Test successful login with valid credentials."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpass123"
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_login_wrong_password(self, client, test_user):
        """Test login with incorrect password."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "not-an-email",
                "password": "password123"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_missing_fields(self, client):
        """Test login with missing required fields."""
        response = client.post(
            "/api/auth/login",
            json={"email": "test@example.com"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetCurrentUser:
    """Test cases for GET /api/auth/me endpoint."""

    def test_get_me_success(self, client, auth_headers, test_user):
        """Test getting current user profile with valid token."""
        response = client.get("/api/auth/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert data["subscription_type"] == "free"
        assert "password" not in data
        assert "password_hash" not in data

    def test_get_me_no_token(self, client):
        """Test accessing /me without authentication token."""
        response = client.get("/api/auth/me")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_me_invalid_token(self, client):
        """Test accessing /me with invalid token."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_me_malformed_token(self, client):
        """Test accessing /me with malformed authorization header."""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "InvalidFormat"}
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetSubscription:
    """Test cases for GET /api/auth/subscription endpoint."""

    def test_get_subscription_free_user(self, client, auth_headers):
        """Test getting subscription info for free user."""
        response = client.get("/api/auth/subscription", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["subscription_type"] == "free"
        assert data["is_active"] is True
        assert data["resume_limit"] == 1
        assert data["ats_analysis_limit"] == 2
        assert data["resume_count"] == 0
        assert data["ats_analysis_count"] == 0

    def test_get_subscription_starter_user(self, client, starter_user):
        """Test getting subscription info for starter user."""
        # Login as starter user
        login_response = client.post(
            "/api/auth/login",
            json={"email": "starter@example.com", "password": "starter123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = client.get("/api/auth/subscription", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["subscription_type"] == "starter"
        assert data["is_active"] is True
        assert data["resume_limit"] == 5
        assert data["ats_analysis_limit"] == 10

    def test_get_subscription_unauthenticated(self, client):
        """Test getting subscription without authentication."""
        response = client.get("/api/auth/subscription")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestUpdateProfile:
    """Test cases for PUT /api/auth/profile endpoint."""

    def test_update_profile_name(self, client, auth_headers, test_user):
        """Test updating user name."""
        response = client.put(
            "/api/auth/profile",
            headers=auth_headers,
            json={"name": "Updated Name"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["email"] == "test@example.com"

    def test_update_profile_email(self, client, auth_headers):
        """Test updating user email."""
        response = client.put(
            "/api/auth/profile",
            headers=auth_headers,
            json={"email": "newemail@example.com"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "newemail@example.com"

    def test_update_profile_duplicate_email(self, client, auth_headers, db_session):
        """Test updating email to one that's already in use."""
        # Create another user
        from app.models.user import User, SubscriptionType
        from app.utils.auth import hash_password

        other_user = User(
            email="other@example.com",
            name="Other User",
            password_hash=hash_password("pass123"),
            subscription_type=SubscriptionType.FREE
        )
        db_session.add(other_user)
        db_session.commit()

        response = client.put(
            "/api/auth/profile",
            headers=auth_headers,
            json={"email": "other@example.com"}
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_profile_both_fields(self, client, auth_headers):
        """Test updating both name and email."""
        response = client.put(
            "/api/auth/profile",
            headers=auth_headers,
            json={
                "name": "New Name",
                "email": "new@example.com"
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "New Name"
        assert data["email"] == "new@example.com"

    def test_update_profile_unauthenticated(self, client):
        """Test updating profile without authentication."""
        response = client.put(
            "/api/auth/profile",
            json={"name": "New Name"}
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestChangePassword:
    """Test cases for POST /api/auth/change-password endpoint."""

    def test_change_password_success(self, client, auth_headers):
        """Test successfully changing password."""
        response = client.post(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "testpass123",
                "new_password": "newpass456"
            }
        )

        assert response.status_code == status.HTTP_200_OK
        assert "success" in response.json()["message"].lower()

        # Verify can login with new password
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "newpass456"
            }
        )
        assert login_response.status_code == status.HTTP_200_OK

    def test_change_password_wrong_current(self, client, auth_headers):
        """Test changing password with wrong current password."""
        response = client.post(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "wrongpassword",
                "new_password": "newpass456"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_change_password_weak_new(self, client, auth_headers):
        """Test changing to a weak password."""
        response = client.post(
            "/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "testpass123",
                "new_password": "weak"
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_change_password_unauthenticated(self, client):
        """Test changing password without authentication."""
        response = client.post(
            "/api/auth/change-password",
            json={
                "current_password": "testpass123",
                "new_password": "newpass456"
            }
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestDeleteAccount:
    """Test cases for DELETE /api/auth/account endpoint."""

    def test_delete_account_success(self, client, auth_headers, db_session):
        """Test successfully deleting account."""
        response = client.delete("/api/auth/account", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert "success" in response.json()["message"].lower()

        # Verify user can't login anymore
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "testpass123"
            }
        )
        assert login_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_account_unauthenticated(self, client):
        """Test deleting account without authentication."""
        response = client.delete("/api/auth/account")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestHealthEndpoints:
    """Test cases for health check endpoints."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["version"] == "1.0.0"

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["environment"] == "development"
