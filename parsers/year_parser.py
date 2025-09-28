import logging
from bs4 import BeautifulSoup

BASE_URL = "https://www.vlr.gg"

logger = logging.getLogger(__name__)

def parse_year_data(year_html):
    soup = BeautifulSoup(year_html, "html.parser")
    event_links = []

    events = soup.select("a.event-item")

    for event in events:
        event_link = event["href"]
        if event_link.startswith("/event/"):
            event_link = event_link.replace("event/", "event/matches/", 1)
            event_links.append(BASE_URL + event_link)
        else:
            logger.error("event link extracted from year data was faulty: %s", event_link)

    return event_links