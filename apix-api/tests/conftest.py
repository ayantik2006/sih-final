import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db


@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Ensure database schema is created and seeded before any tests run."""
    asyncio.run(init_db())


@pytest.fixture(scope="session")
def client():
    """TestClient instance with app lifespan executed."""
    with TestClient(app, base_url="http://testserver") as test_client:
        yield test_client


@pytest.fixture
def nso_headers():
    return {"X-API-Key": "mospi-nso-key-2026"}


@pytest.fixture
def rbi_headers():
    return {"Authorization": "Bearer rbi-mpd-key-2026"}
