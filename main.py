
from db.session import engine, SessionLocal
from sqlalchemy.orm import Session
from scrapers import circuit_scraper

circuit_scraper.get_data_for_year(2021)

def main():
    
    db: Session = SessionLocal()
    try:
        pass

    finally:

        db.close()


if __name__ == "__main__":
    main()