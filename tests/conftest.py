import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base
from main import app
from fastapi.testclient import TestClient
import db.session as db_session

# Use a shared in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///file::memory:?cache=shared"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "uri": True},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the engine and SessionLocal in your db.session module
db_session.engine = engine
db_session.SessionLocal = TestingSessionLocal


@pytest.fixture(autouse=True, scope="function")
def create_test_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[db_session.get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
