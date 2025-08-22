from enum import Enum

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
