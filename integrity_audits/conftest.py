import pytest
from db.session import SessionLocal  # Import your existing sessionmaker

@pytest.fixture(scope="function")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        # Always rollback in an audit to ensure NO accidental writes occur
        session.rollback() 
        session.close()