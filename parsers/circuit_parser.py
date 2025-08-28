from datetime import datetime
from bs4 import BeautifulSoup
from utils import *
from models import *
from queries.scraper_queries import *
import re
BASE_URL = "https://www.vlr.gg"

def parse_year_data(year_html):
    # return the links to all events in the year.

    soup = BeautifulSoup(year_html, "html.parser")
    event_links = []

    events = soup.select("a.event-item")

    for event in events:
        event_link = event["href"]
        if event_link.startswith("/event/"):
            event_link = event_link.replace("event/", "event/matches/", 1)
            event_links.append(BASE_URL + event_link)
        else:
            print("ERROR::CIRCUIT_PARSER.PY::PARSE_YEAR_DATA():: event link extracted from year data was faulty")

    return event_links


def parse_event_data(event_overview_html, event_matches_html, event_link):
    # Data Needed:
    # Table: -Events-
    # name
    # year
    # region
    # winner_id -> team id
    # return the links to all matches in the event

    #vlr id for the event
    event_vlr_id = event_link.split("/")[5]

    soup_matches = BeautifulSoup(event_matches_html, "html.parser")
    soup_overview = BeautifulSoup(event_overview_html, "html.parser")

    #get event data and insert into the table
    #1. get the event name:
    title = soup_matches.find("h1", class_="wf-title").text.strip()
    #2. get the year
    year = soup_matches.find("div", class_="event-desc-item-value").text.strip()[-4:]
    #3. get the region. Find International event by checking for the word "Masters" for masters events 
    # and "Valorant Champions 20XX" for champs events and "LOCK//IN" for the 2023 lock in event.
    region = get_region_from_title(title)
    #4. get the winner id:
    team_url = soup_overview.find("a", class_="standing-item-team")["href"]
    match = re.search(r'/team/(\d+)/', team_url)
    if match:
        winner_vlr_id = int(match.group(1))
    else:
        winner_vlr_id = None
        print("ERROR::could not extract vlr_id from team_url::parse_event_data()")
        return

    winner_id = Team.get_by_vlr_id(winner_vlr_id)
    if winner_id == None:
        #create the team
        winner_team_name = team_url.split('/')[-1]
        winner_team_data = soup_overview.find("div", class_="text-of standing-item-team-name")
        winner_team_region = winner_team_data.find("div", "ge-text-light").text.strip()
        #DEBUG
        print(f'team vlr id: {winner_vlr_id}')
        print(f'team name: {winner_team_name}')
        print(f'team region: {winner_team_region}')
        #DEBUG
        winner_id = Team.add_team(winner_vlr_id, winner_team_name)

    #DEBUG
    print(f'event vlr id: {event_vlr_id}')
    print(f'event name: {title}')
    print(f'year: {year}')
    print(f'region: {region.name}')
    print(f'winner team id: {winner_id}')
    #DEBUG
    #create the event
    Event.add_event(event_vlr_id, title, year, region.name, winner_id)

    #get match links
    match_links = []

    matches = soup_matches.select("a.match-item")

    for match in matches:
        match_link = match["href"]
        match_links.append(BASE_URL + match_link)

    return match_links


def parse_match_data(match_html, match_link):
    # Data Needed:
    # Table: -Matches-
    # coreteam1_id
    # coreteam2_id
    # winner_id
    # event_id
    # score
    # match_stage
    # match date

    # first check if both teams are present in the database, if not, add them. Also, check if the CORE of the two teams match
    # if not, create a new core. A core changes if 3 or more players are different from one match to another.

    match_vlr_id = match_link.split("/")[-1]
    soup = BeautifulSoup(match_html, "html.parser")

    #get all 10 player IDs
    team1_player_ids = []
    team2_player_ids = []
    table_container = soup.find("div", class_="vm-stats-game mod-active")
    team_subtables = table_container.find_all("table", class_="wf-table-inset mod-overview")

    team1_player_ids = get_player_ids(team_subtables[0])
    team1_player_ids = get_player_ids(team_subtables[1])

    #DONE

    teams = soup.find_all("a", class_ = "match-header-link")
    team_vlr_ids = []
    team_names = []
    for team in teams:
        team_names.append(team["href"].split("/")[-1])
        team_vlr_ids.append(team["href"].split("/")[-2])


    #match date
    match_header = soup.find("div", class_="match-header-super")
    date_str = match_header.find("div", "moment-tz-convert")["data-utc-ts"].split(" ")[0]
    start_date = datetime.strptime(date_str, "%Y-%m-%d").date()

    #check (for both teams) if the current coreteam has atleast 3 players in common with the 5 players of this match, then keep the same coreteam.
    #get the coreteams
    team1_id = Team.get_by_vlr_id(team_vlr_ids[0])
    if not team1_id:
        team1_id = Team.add_team(team_vlr_ids[0], team_names[0])
    team2_id = Team.get_by_vlr_id(team_vlr_ids[1])
    if not team2_id:
        team2_id = Team.add_team(team_vlr_ids[1], team_names[1])
    coreteam1 = CoreTeam.get_by_team_id(team1_id)
    coreteam2 = CoreTeam.get_by_team_id(team2_id)
    coreteam1_players = get_current_players_by_coreteam(coreteam1)
    coreteam2_players = get_current_players_by_coreteam(coreteam2)
    core_players_list = latest_five_rosters_with_players()
    if not check_majority_same(coreteam1_players, team1_player_ids):
        #for team1, the coreteam must change
        #check if a core with the given players exists
        new_core = None
        for core, players in core_players_list:
            if check_majority_same(team1_player_ids, players):
                new_core = core
                break
        if not new_core:
            new_core = Core.add_core()
        

        coreteam1 = CoreTeam.add_coreteam(new_core, team1_id, start_date)

    if not check_majority_same(coreteam2_players, team2_player_ids):
        #for team1, the coreteam must change
        #check if a core with the given players exists
        new_core = None
        for core, players in core_players_list:
            if check_majority_same(team2_player_ids, players):
                new_core = core
                break
        if not new_core:
            new_core = Core.add_core()
        

        coreteam2 = CoreTeam.add_coreteam(new_core, team2_id, start_date)

    score_box = soup.find("div", "match-header-vs-score")
    scorecard_list = score_box.find_all("span")
    scorecard_list_text = [scorecard.text.strip() for scorecard in scorecard_list]
    winner_id = team1_id if scorecard_list_text[0] > scorecard_list_text[2] else team2_id
    score = scorecard_list_text[0] + scorecard_list_text[1] + scorecard_list_text[2]

    event_block = soup.find("a", class_="match-header-event")
    event_vlr_id = event_block["href"].split("/")[2]
    event_id = Event.get_by_vlr_id(event_vlr_id)
    tournament_name = event_block.find("div", style="font-weight: 700;").text.strip()
    series = event_block.find("div", class_="match-header-event-series").text.strip()
    full_stage = f"{tournament_name} - {series}"

    #DATABASE DEBUG
    print(f'match vlr id: {match_vlr_id}')
    print(f'coreteam1 id: {coreteam1}')
    print(f'coreteam2 id: {coreteam2}')
    print(f'winner id: {winner_id}')
    print(f'event id: {event_id}')
    print(f'score: {score}')
    print(f'match_stage: {full_stage}')
    print(f'match_date: {start_date}')
    #DONE
