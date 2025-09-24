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
        print("-----------------")
        print(f'team vlr id: {winner_vlr_id}')
        print(f'team name: {winner_team_name}')
        print(f'team region: {winner_team_region}')
        print("-----------------")
        #DEBUG
        winner_id = Team.add_team(winner_vlr_id, winner_team_name)

    #DEBUG
    print("-----------------")
    print(f'event vlr id: {event_vlr_id}')
    print(f'event name: {title}')
    print(f'year: {year}')
    print(f'region: {region.name}')
    print(f'winner team id: {winner_id}')
    print("-----------------")
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

    match_vlr_id = match_link.split("/")[3]
    soup = BeautifulSoup(match_html, "html.parser")

    event_block = soup.find("a", class_="match-header-event")
    event_vlr_id = event_block["href"].split("/")[2]
    event_id = Event.get_by_vlr_id(event_vlr_id)
    tournament_name = event_block.find("div", style="font-weight: 700;").text.strip()
    series = event_block.find("div", class_="match-header-event-series").text.strip()
    full_stage = f"{tournament_name} - {series}"

    if "Showmatch" in series:
        print("Skipping showmatch")
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
    print(f'match vlr id: {match_vlr_id}')
    print(f'coreteam1 id: {coreteam1}')
    print(f'coreteam2 id: {coreteam2}')
    print(f'winner id: {winner_id}')
    print(f'event id: {event_id}')
    print(f'score: {score}')
    print(f'match_stage: {full_stage}')
    print(f'match_date: {start_date}')
    #DONE

    match_id = Match.add_match(match_vlr_id, coreteam1, coreteam2, winner_id, event_id, score, full_stage, start_date)
    for player_id in team1_player_ids:
        MatchPlayer.add_matchplayer(match_id, player_id, coreteam1)
    for player_id in team2_player_ids:
        MatchPlayer.add_matchplayer(match_id, player_id, coreteam2)

    num_maps = int(scorecard_list_text[0]) + int(scorecard_list_text[2])
    print(f'number of maps: {num_maps}')

    maps = soup.select("div.vm-stats-gamesnav-item.js-map-switch")
    print(f'this should be 4 or 6 --> {len(maps)}')

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

def parse_map_data(map_html, match_id, map_vlr_id, map_number):
    #match id
    #map number
    #map name
    #team1 score
    #team2 score
    #winner id -> FK: coreteam id 
    #loser id -> FK: coreteam id

    soup = BeautifulSoup(map_html, "html.parser")
    map_list = soup.select("div.vm-stats-game")
    current_map = None
    for map in map_list:
        if map["data-game-id"] == map_vlr_id:
            current_map = map
            break
    map_name = current_map.find("span", style="position: relative;").text.strip()

    team1_score = current_map.select_one("div.team div.score").text.strip()
    team2_score = current_map.select_one("div.team.mod-right div.score").text.strip()

    coreteams = Match.get_coreteams_of_match(match_id)

    winner_id = coreteams[0] if team1_score > team2_score else coreteams[1]
    loser_id = coreteams[0] if team1_score < team2_score else coreteams[1]

    tables = current_map.select("table tbody")

    team1_rows = tables[0].select("tr")
    team2_rows = tables[1].select("tr")

    # DEBUG (MAP STATS)
    print("-----------------")
    print(f'match id: {match_id}')
    print(f'map number: {map_number}')
    print(f'map name: {map_name[0: 10]}')
    print(f'team 1 score: {team1_score}')
    print(f'team 2 score: {team2_score}')
    print(f'winner id: {winner_id}')
    print(f'loser id: {loser_id}')
    print("-----------------")
    #DONE

    team1_ids = []
    team2_ids = []

    map_played_id = MapPlayed.add_mapplayed(match_id, map_number, map_name, team1_score, team2_score, winner_id, loser_id)

    for player in team1_rows:
        name_box = player.find("td", class_="mod-player")
        vlr_id = name_box.find("a")["href"].split("/")[-2]
        name = name_box.find("div", class_="text-of").text.strip()
        country = name_box.find("i")["title"]

        agent_box = player.find("td", class_="mod-agents")
        agent_tag = agent_box.find("img")
        agent_name = agent_tag["title"]

        stat_boxes = player.find_all("td", class_="mod-stat")

        rating_box = stat_boxes[0]
        raw_rating = rating_box.find("span", class_="side mod-side mod-both").text
        rating = raw_rating.replace("\xa0", "").strip()
        if rating == "":
            rating = None

        acs_box = stat_boxes[1]
        acs = acs_box.find("span", class_="side mod-side mod-both").text.strip()
        if acs == "":
            acs = None

        kills_box = stat_boxes[2]
        kills = kills_box.find("span", class_="side mod-side mod-both").text.strip()

        death_box = stat_boxes[3]
        deaths = death_box.find("span", class_="side mod-both").text.strip()

        assist_box = stat_boxes[4]
        assists = assist_box.find("span", class_="side mod-both").text.strip()

        kast_box = stat_boxes[6]
        kast = kast_box.find("span", class_="side mod-both").text.strip()
        if "%" not in kast:
            kast = None
        else:
            kast = kast.rstrip("%")

        adr_box = stat_boxes[7]
        adr = adr_box.find("span", class_="side mod-both").text.strip()
        if adr == "":
            adr = None

        hs_box = stat_boxes[8]
        hs = hs_box.find("span", class_="side mod-both").text.strip()
        if "%" not in hs:
            hs = None
        else:
            hs = hs.rstrip("%")

        fk_box = stat_boxes[9]
        fk = fk_box.find("span", class_="side mod-both").text.strip()
        if fk == "":
            fk = None

        fd_box = stat_boxes[10]
        fd = fd_box.find("span", class_="side mod-both").text.strip()
        if fd == "":
            fd = None

        player_id = Player.get_by_vlr_id(vlr_id)

        if not player_id:
            player_id = Player.add_player(vlr_id, name, country)
        
        PlayerMapStatistics.add_playermapstatistic(map_played_id, player_id, agent_name, kills, deaths, assists, rating, acs, kast, adr, hs, fk, fd)
        team1_ids.append(player_id)

    for player in team2_rows:

        name_box = player.find("td", class_="mod-player")
        vlr_id = name_box.find("a")["href"].split("/")[-2]
        name = name_box.find("div", class_="text-of").text.strip()
        country = name_box.find("i")["title"]

        agent_box = player.find("td", class_="mod-agents")
        agent_tag = agent_box.find("img")
        agent_name = agent_tag["title"]

        stat_boxes = player.find_all("td", class_="mod-stat")

        rating_box = stat_boxes[0]
        raw_rating = rating_box.find("span", class_="side mod-side mod-both").text
        rating = raw_rating.replace("\xa0", "").strip()
        if rating == "":
            rating = None

        acs_box = stat_boxes[1]
        acs = acs_box.find("span", class_="side mod-side mod-both").text.strip()
        if acs == "":
            acs = None

        kills_box = stat_boxes[2]
        kills = kills_box.find("span", class_="side mod-side mod-both").text.strip()

        death_box = stat_boxes[3]
        deaths = death_box.find("span", class_="side mod-both").text.strip()

        assist_box = stat_boxes[4]
        assists = assist_box.find("span", class_="side mod-both").text.strip()

        kast_box = stat_boxes[6]
        kast = kast_box.find("span", class_="side mod-both").text.strip()
        if "%" not in kast:
            kast = None
        else:
            kast = kast.rstrip("%")

        adr_box = stat_boxes[7]
        adr = adr_box.find("span", class_="side mod-both").text.strip()
        if adr == "":
            adr = None

        hs_box = stat_boxes[8]
        hs = hs_box.find("span", class_="side mod-both").text.strip()
        if "%" not in hs:
            hs = None
        else:
            hs = hs.rstrip("%")

        fk_box = stat_boxes[9]
        fk = fk_box.find("span", class_="side mod-both").text.strip()
        if fk == "":
            fk = None

        fd_box = stat_boxes[10]
        fd = fd_box.find("span", class_="side mod-both").text.strip()
        if fd == "":
            fd = None

        player_id = Player.get_by_vlr_id(vlr_id)

        if not player_id:
            player_id = Player.add_player(vlr_id, name, country)
        
        PlayerMapStatistics.add_playermapstatistic(map_played_id, player_id, agent_name, kills, deaths, assists, rating, acs, kast, adr, hs, fk, fd)
        team2_ids.append(player_id)

    return map_played_id, team1_ids, team2_ids

def parse_duels_data(map_performance_html, map_played_vlr_id, map_played_id, t1, t2):
    soup = BeautifulSoup(map_performance_html, "html.parser")
    map_box = soup.select_one(f'div.vm-stats-game[data-game-id="{map_played_vlr_id}"]')
    duels_box = map_box.find("div")
    table = duels_box.select_one("table.wf-table-inset.mod-matrix.mod-normal")
    if not table:
        return 
    table_entries = table.find_all("tr")
    first_entry = table_entries[0].find_all("div", class_="team")
    team1_names = []
    team2_names = []
    team1_ids = [None] * len(t1)
    team2_ids = [None] * len(t2)

    rows = len(table_entries) - 1
    cols = len(first_entry)

    team1_matrix = [[0 for _ in range(cols)] for _ in range(rows)]
    team2_matrix = [[0 for _ in range(cols)] for _ in range(rows)]


    for i in range(len(first_entry)):
        team2_names.append(first_entry[i].find("div").text.strip().split()[0])
    
    for i in range(1, len(table_entries)):
        entry = table_entries[i].find_all("td")
        name_block = entry[0].find("div", class_="team")
        team1_names.append(name_block.find("div").text.strip().split()[0])
        for j in range(1, len(entry)):
            curr_row = i - 1
            curr_column = j - 1
            values = entry[j].find_all("div", class_="stats-sq")
            team1_val = values[0].text.strip()
            team2_val = values[1].text.strip()

            team1_matrix[curr_row][curr_column] = team1_val
            team2_matrix[curr_row][curr_column] = team2_val

    # sort the ids
    for pid in t1:
        ign = Player.get_ign(pid)
        for i, name in enumerate(team1_names):
            print(f'the name and ign are {name} and {ign}')
            if name == ign:
                team1_ids[i] = pid


    for pid in t2:
        ign = Player.get_ign(pid)
        for i, name in enumerate(team2_names):
            print(f'the name and ign are {name} and {ign}')
            if name == ign:
                team2_ids[i] = pid

    for i in range(rows):
        for j in range(cols):
            player1_data = team1_matrix[i][j]
            player2_data = team2_matrix[i][j]

            if not player1_data.isdigit() or not player2_data.isdigit():
                print("ERROR::non digit data found in duel matrix, skipping entry")
                continue

            player2_id = team2_ids[j]
            player1_id = team1_ids[i]

            player1_ign = Player.get_ign(player1_id)
            player2_ign = Player.get_ign(player2_id)

            #DEBUG
            print("-----------------")
            print(f'player 1 ign: {player1_ign}')
            print(f'player 2 ign: {player2_ign}')
            print(f'map played id: {map_played_id}')
            print(f'player2 id: {player2_id}')
            print(f'player1 id: {player1_id}')
            print(f'times player 1 killed player 2: {player1_data}')
            print(f'times player 2 killed player 1: {player2_data}')
            print("-----------------")
            #DONE

            if not player1_id or not player2_id :
                print("ERROR::one or both player ids were None in parse_duels_data()")
            else:
                PlayerDuels.addplayerduels(map_played_id, player1_id, player2_id, player1_data)
                PlayerDuels.addplayerduels(map_played_id, player2_id, player1_id, player2_data)
            