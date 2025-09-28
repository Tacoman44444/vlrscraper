import logging
from bs4 import BeautifulSoup
from models import *

logger = logging.getLogger(__name__)

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
            logger.debug(f'the name and ign are {name} and {ign}')
            if name == ign:
                team1_ids[i] = pid


    for pid in t2:
        ign = Player.get_ign(pid)
        for i, name in enumerate(team2_names):
            logger.debug(f'the name and ign are {name} and {ign}')
            if name == ign:
                team2_ids[i] = pid

    for i in range(rows):
        for j in range(cols):
            player1_data = team1_matrix[i][j]
            player2_data = team2_matrix[i][j]

            if not player1_data.isdigit() or not player2_data.isdigit():
                logger.error("non digit data found in duel matrix, skipping entry")
                continue

            player2_id = team2_ids[j]
            player1_id = team1_ids[i]

            player1_ign = Player.get_ign(player1_id)
            player2_ign = Player.get_ign(player2_id)

            #DEBUG
            logger.debug("Debug info for duel statistics:")
            logger.debug(f'player 1 ign: {player1_ign}')
            logger.debug(f'player 2 ign: {player2_ign}')
            logger.debug(f'map played id: {map_played_id}')
            logger.debug(f'player2 id: {player2_id}')
            logger.debug(f'player1 id: {player1_id}')
            logger.debug(f'times player 1 killed player 2: {player1_data}')
            logger.debug(f'times player 2 killed player 1: {player2_data}')
            print("\n\n\n")
            #DONE

            if not player1_id or not player2_id :
                logger.error("one or both player ids were None in parse_duels_data()")
            else:
                PlayerDuels.addplayerduels(map_played_id, player1_id, player2_id, player1_data)
                PlayerDuels.addplayerduels(map_played_id, player2_id, player1_id, player2_data)