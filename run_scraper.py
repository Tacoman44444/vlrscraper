from db.session import engine, SessionLocal
from sqlalchemy.orm import Session
from scrapers import circuit_scraper
import logging

import logging
from db.session import SessionLocal
from sqlalchemy.orm import Session
from scrapers import circuit_scraper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def main():
    db: Session = SessionLocal()
    try:
        years = (2023, 2024)
        for year in years:
            circuit_scraper.get_data_for_year(year)
    finally:
        db.close()


if __name__ == "__main__":
    main()