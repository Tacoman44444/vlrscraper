from enum import Enum

class Region(Enum):
    International = 1
    EMEA = 2
    Americas = 3
    Pacific = 4

def get_region_from_title(title: str):
    regional_masters = [] #covid era masters, wont put these in international

    if title.startswith("Valorant Champions 20"):
        return "International"
    