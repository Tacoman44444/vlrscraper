import logging
from bs4 import BeautifulSoup
from utils import *
from models import *
from queries.scraper_queries import *
import re

BASE_URL = "https://www.vlr.gg"

logger = logging.getLogger(__name__)

def parse_event_data(event_overview_html, event_matches_html, event_link):
    # Data Needed:
    # Table: -Events-
    # name
    # year
    # region
    # winner_id -> team id
    # return the links to all matches in the event

    event_vlr_id = event_link.split("/")[5]

    soup_matches = BeautifulSoup(event_matches_html, "html.parser")
    soup_overview = BeautifulSoup(event_overview_html, "html.parser")

    title = soup_matches.find("h1", class_="wf-title").text.strip()
    year = soup_matches.find("div", class_="event-desc-item-value").text.strip()[-4:]
    region = get_region_from_title(title)
    team_url = soup_overview.find("a", class_="standing-item-team")["href"]
    match = re.search(r'/team/(\d+)/', team_url)
    if match:
        winner_vlr_id = int(match.group(1))
    else:
        winner_vlr_id = None
        logger.error("could not extract vlr_id from team_url")
        return

    winner_id = Team.get_by_vlr_id(winner_vlr_id)
    if winner_id == None:
        winner_team_name = team_url.split('/')[-1]
        winner_team_data = soup_overview.find("div", class_="text-of standing-item-team-name")
        winner_team_region = winner_team_data.find("div", "ge-text-light").text.strip()
        #DEBUG
        logger.debug("Debug info for winner team if new team is created:")
        logger.debug(f'team vlr id: {winner_vlr_id}')
        logger.debug(f'team name: {winner_team_name}')
        logger.debug(f'team region: {winner_team_region}')
        print("\n\n\n")
        #DEBUG
        winner_id = Team.add_team(winner_vlr_id, winner_team_name)

    #DEBUG
    logger.debug("Debug info for event:")
    print(f'event vlr id: {event_vlr_id}')
    print(f'event name: {title}')
    print(f'year: {year}')
    print(f'region: {region.name}')
    print(f'winner team id: {winner_id}')
    print("\n\n\n")
    #DEBUG
    Event.add_event(event_vlr_id, title, year, region.name, winner_id)

    match_links = []

    matches = soup_matches.select("a.match-item")

    for match in matches:
        match_link = match["href"]
        match_links.append(BASE_URL + match_link)

    return match_links