import logging
import time
from tqdm import tqdm
from tqdm.contrib.logging import logging_redirect_tqdm
from sqlalchemy.orm import Session
from db.session import engine, SessionLocal
from scrapers import circuit_scraper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def main():
    db: Session = SessionLocal()
    years = [2023, 2024, 2025]
    
    try:
        with logging_redirect_tqdm():
            pbar = tqdm(years, desc="Total Scraping Progress", unit="year")
            
            for year in pbar:
                pbar.set_description(f"Scraping Year: {year}")
                
                circuit_scraper.get_data_for_year(year)
                
                pbar.write(f"✅ Completed scraping for year {year}")
                
    except Exception as e:
        logger.error(f"An error occurred during scraping: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()