from enum import Enum
from bs4 import BeautifulSoup
from models import *
class Region(Enum):
    International = 1
    EMEA = 2
    Americas = 3
    Pacific = 4
    China = 5

def get_region_from_title(title: str):
    regional_masters = [] #covid era masters, wont put these in international
    regional_masters.append("Champions Tour LATAM Stage 1: Masters")
    regional_masters.append("Champions Tour Brazil Stage 1: Masters")
    regional_masters.append("Champions Tour North America Stage 1: Masters")
    regional_masters.append("Champions Tour Turkey Stage 1: Masters")
    regional_masters.append("Champions Tour Europe Stage 1: Masters")
    regional_masters.append("Champions Tour CIS Stage 1: Masters")
    regional_masters.append("Champions Tour Korea Stage 1: Masters")
    regional_masters.append("Champions Tour Japan Stage 1: Masters")
    regional_masters.append("Champions Tour SEA Stage 1: Masters")


    if title.startswith("Valorant Champions 20"):
        return Region.International
    
    if "Masters" in title:
        if title not in regional_masters:
            return Region.International
    
    americas_regions = []
    americas_regions.append("LATAM")
    americas_regions.append("Brazil")
    americas_regions.append("North America")
    americas_regions.append("South America")
    americas_regions.append("Latin America")
    americas_regions.append("Americas")

    EMEA_regions = []
    EMEA_regions.append("Europe")
    EMEA_regions.append("CIS")
    EMEA_regions.append("Turkey")
    EMEA_regions.append("EMEA")

    pacific_regions = []
    pacific_regions.append("Pacific")
    pacific_regions.append("Thailand")
    pacific_regions.append("Malaysia")
    pacific_regions.append("Singapore")
    pacific_regions.append("Indonesia")
    pacific_regions.append("Korea")
    pacific_regions.append("Hong Kong")
    pacific_regions.append("Taiwan")
    pacific_regions.append("Philippines")
    pacific_regions.append("Japan")
    pacific_regions.append("Vietnam")
    pacific_regions.append("Arabia")
    pacific_regions.append("Oceania")
    pacific_regions.append("Asia")

    china_regions = []
    china_regions.append("China")

    if any(country in title for country in americas_regions):
        return Region.Americas
    
    if any(country in title for country in EMEA_regions):
        return Region.EMEA
    
    if any(country in title for country in pacific_regions):
        return Region.Pacific
    
    if any(country in title for country in china_regions):
        return Region.China
    
    
    return Region.Pacific

def check_majority_same(arr1: list[int], arr2: list[int]):
    if (len(arr1) != len(arr2)):
        print("ERROR::lists are not of the same length::checkmajority_same()")
        return False
    arr1.sort()
    arr2.sort()

    ptr1 = 0
    ptr2 = 0
    res = 0
    while ptr1 < len(arr1) and ptr2 < len(arr2):
        if arr1[ptr1] == arr2[ptr2]:
            res += 1
            ptr1 += 1
            ptr2 += 1
        elif arr1[ptr1] > arr2[ptr2]:
            ptr2 += 1
        else:
            ptr1 += 1

    return res >= 3
    
def get_player_ids(team_table):
    player_boxes = team_table.find_all("td", class_="mod-player")
    player_ids = []
    for box in player_boxes:
        player_vlr_id = box.find("a")["href"].split("/")[-2]
        player_id = Player.get_by_vlr_id(player_vlr_id)
        if player_id:
            player_ids.append(player_id)
        else:
            country = box.find("i")["title"]
            ign = box.find("a")["href"].split("/")[-1]
            player_ids.append(Player.add_player(player_vlr_id, ign, country)) #adding the player

    return player_ids
    