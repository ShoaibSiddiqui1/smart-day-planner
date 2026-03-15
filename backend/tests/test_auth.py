"""
Authentication endpoint tests.

Run with:  pytest backend/tests/test_auth.py -v

Uses an in-memory SQLite database so no Postgres instance is required.
Set a dummy SECRET_KEY env var before running:
    SECRET_KEY=testsecret pytest backend/tests/ -v
"""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-at-least-32-characters-long")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# ---------------------------------------------------------------------------
# Test database setup
# ---------------------------------------------------------------------------

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

VALID_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123",
}


@pytest.fixture(autouse=True)
def reset_db():
    """Drop and recreate all tables before each test for isolation."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def registered_user():
    """Register a user and return the response JSON."""
    response = client.post("/users/", json=VALID_USER)
    assert response.status_code == 201
    return response.json()


# ---------------------------------------------------------------------------
# Registration tests
# ---------------------------------------------------------------------------

def test_register_success():
    response = client.post("/users/", json=VALID_USER)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == VALID_USER["email"]
    assert data["username"] == VALID_USER["username"]
    assert "hashed_password" not in data  # never exposed


def test_register_duplicate_email(registered_user):
    response = client.post(
        "/users/",
        json={**VALID_USER, "username": "differentname"},
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_register_duplicate_username(registered_user):
    response = client.post(
        "/users/",
        json={**VALID_USER, "email": "other@example.com"},
    )
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_register_short_password():
    response = client.post(
        "/users/",
        json={**VALID_USER, "password": "short"},
    )
    assert response.status_code == 422  # Pydantic validation error


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------

def test_login_success(registered_user):
    response = client.post(
        "/auth/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 20  # sanity: non-empty JWT


def test_login_wrong_password(registered_user):
    response = client.post(
        "/auth/login",
        json={"email": VALID_USER["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_unknown_email():
    response = client.post(
        "/auth/login",
        json={"email": "ghost@example.com", "password": "anypassword"},
    )
    assert response.status_code == 401
    # Same message – no user enumeration
    assert "Invalid email or password" in response.json()["detail"]


def test_login_missing_fields():
    response = client.post("/auth/login", json={"email": "test@example.com"})
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Protected route tests
# ---------------------------------------------------------------------------

def test_get_me_success(registered_user):
    # Log in to get a token
    token_response = client.post(
        "/auth/login",
        json={"email": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    token = token_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == VALID_USER["email"]


def test_get_me_no_token():
    response = client.get("/auth/me")
    assert response.status_code == 403  # HTTPBearer returns 403 when header absent


def test_get_me_invalid_token():
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer this.is.not.valid"},
    )
    assert response.status_code == 401
