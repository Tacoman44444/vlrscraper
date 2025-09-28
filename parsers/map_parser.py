import logging
from bs4 import BeautifulSoup
from utils import *
from models import *
from queries.scraper_queries import *

logger = logging.getLogger(__name__)

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
    map_name= map_name.split()[0]

    team1_score = current_map.select_one("div.team div.score").text.strip()
    team2_score = current_map.select_one("div.team.mod-right div.score").text.strip()

    coreteams = Match.get_coreteams_of_match(match_id)

    winner_id = coreteams[0] if team1_score > team2_score else coreteams[1]
    loser_id = coreteams[0] if team1_score < team2_score else coreteams[1]

    tables = current_map.select("table tbody")

    team1_rows = tables[0].select("tr")
    team2_rows = tables[1].select("tr")

    # DEBUG (MAP STATS)
    logger.debug("Debug Info for Map Statistics:")
    logger.debug(f'match id: {match_id}')
    logger.debug(f'map number: {map_number}')
    logger.debug(f'map name: {map_name[0: 10]}')
    logger.debug(f'team 1 score: {team1_score}')
    logger.debug(f'team 2 score: {team2_score}')
    logger.debug(f'winner id: {winner_id}')
    logger.debug(f'loser id: {loser_id}')
    print("\n\n\n")
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