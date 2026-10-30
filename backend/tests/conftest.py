import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Ensure all tables exist and synthetic baseline data is seeded
    before running the test suite.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
