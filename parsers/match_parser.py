import logging
from bs4 import BeautifulSoup
from utils import *
from models import *
from queries.scraper_queries import *
from datetime import datetime

logger = logging.getLogger(__name__)

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

    match_vlr_id = match_link.split("/")[3]
    soup = BeautifulSoup(match_html, "html.parser")

    event_block = soup.find("a", class_="match-header-event")
    event_vlr_id = event_block["href"].split("/")[2]
    event_id = Event.get_by_vlr_id(event_vlr_id)
    tournament_name = event_block.find("div", style="font-weight: 700;").text.strip()
    series = event_block.find("div", class_="match-header-event-series").text.strip()
    full_stage = f"{tournament_name} - {series}"

    if "Showmatch" in series:
        logger.info("Skipping showmatch ...")
        return None, None, None, None

    #get all 10 player IDs
    team1_player_ids = []
    team2_player_ids = []
    table_container = soup.find("div", class_="vm-stats-game mod-active")

    if (not table_container):
        return None, None, None, None
    
    map_check = table_container.find("div", class_="map")
    if map_check:
        map_name_check = map_check.find("span").text.strip()
        if (map_name_check == "TBD"):
            return None, None, None, None
    
    team_subtables = table_container.find_all("table", class_="wf-table-inset mod-overview")

    team1_player_ids = get_player_ids(team_subtables[0])
    team2_player_ids = get_player_ids(team_subtables[1])

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
        
        #new_core = None
        #for core, players in core_players_list:
        #    if check_majority_same(team1_player_ids, players):
        #        new_core = core
        #        break
        #if not new_core:
        new_core = Core.add_core()  

        coreteam1 = CoreTeam.add_coreteam(new_core, team1_id, start_date)

    if not check_majority_same(coreteam2_players, team2_player_ids):
        #for team1, the coreteam must change
        #check if a core with the given players exists
        #new_core = None
        #for core, players in core_players_list:
        #    if check_majority_same(team2_player_ids, players):
        #        new_core = core
        #        break
        #if not new_core:
        new_core = Core.add_core()

        coreteam2 = CoreTeam.add_coreteam(new_core, team2_id, start_date)

    score_box = soup.find("div", "match-header-vs-score")
    scorecard_list = score_box.find_all("span")
    scorecard_list_text = [scorecard.text.strip() for scorecard in scorecard_list]
    winner_id = coreteam1 if scorecard_list_text[0] > scorecard_list_text[2] else coreteam2
    score = scorecard_list_text[0] + scorecard_list_text[1] + scorecard_list_text[2]

    #DATABASE DEBUG
    logger.debug("Debug info for match: ")
    logger.debug(f'match vlr id: {match_vlr_id}')
    logger.debug(f'coreteam1 id: {coreteam1}')
    logger.debug(f'coreteam2 id: {coreteam2}')
    logger.debug(f'winner id: {winner_id}')
    logger.debug(f'event id: {event_id}')
    logger.debug(f'score: {score}')
    logger.debug(f'match_stage: {full_stage}')
    logger.debug(f'match_date: {start_date}')
    #DONE

    match_id = Match.add_match(match_vlr_id, coreteam1, coreteam2, winner_id, event_id, score, full_stage, start_date)
    for player_id in team1_player_ids:
        MatchPlayer.add_matchplayer(match_id, player_id, coreteam1)
    for player_id in team2_player_ids:
        MatchPlayer.add_matchplayer(match_id, player_id, coreteam2)

    num_maps = int(scorecard_list_text[0]) + int(scorecard_list_text[2])
    logging.debug(f'number of maps: {num_maps}')

    maps = soup.select("div.vm-stats-gamesnav-item.js-map-switch")
    logging.debug(f'this should be 4 or 6 --> {len(maps)}')
    print("\n\n\n")

    if num_maps == 1:
        map = soup.select_one("div.vm-stats-game.mod-active")
        map_vlr_ids = []
        map_id = map["data-game-id"]
        map_vlr_ids.append(map_id)
        map_links = []
        map_performance_links = []
        map_link = "https://vlr.gg/" + match_vlr_id + "/?game=" + map_id + "&tab=overview"
        map_links.append(map_link)
        map_performance_link = "https://vlr.gg/" + match_vlr_id + "/?game=" + map_id + "&tab=performance"
        map_performance_links.append(map_performance_link)
        return match_id, map_vlr_ids, map_links, map_performance_links
    else:
        map_links = []
        map_performance_links = []
        map_vlr_ids = []
        for i in range(1, num_maps+1):
            map_id = maps[i]["data-game-id"]
            map_link = "https://vlr.gg/" + match_vlr_id + "/?game=" + map_id + "&tab=overview"
            map_performance_link = "https://vlr.gg/" + match_vlr_id + "/?game=" + map_id + "&tab=performance"
            map_links.append(map_link)
            map_performance_links.append(map_performance_link)
            map_vlr_ids.append(map_id)

        return match_id, map_vlr_ids,  map_links, map_performance_links