from bs4 import BeautifulSoup

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


def parse_event_data(event_html):
    # Data Needed:
    # Table: -Events-
    # name
    # year
    # region
    # winner_id -> team id
    # return the links to all matches in the event

    soup = BeautifulSoup(event_html, "html.parser")

    #get event data and insert into the table
    #1. get the event name:
    title = soup.find("h1", class_="wf-title").text.strip()
    #2. get the year
    year = soup.find("a", style="white-space: nowrap;").text.strip()
    #3. get the region. Find International event by checking for the word "Masters" for masters events 
    # and "Valorant Champions 20XX" for champs events and "LOCK//IN" for the 2023 lock in event.
    

    #get match links
    match_links = []

    matches = soup.select("a.match-item")

    for match in matches:
        match_link = match["href"]
        match_links.append(BASE_URL + match_link)

    return match_links


def parse_match_data(match_html):
    # Data Needed:
    # Table: -Matches-
    # team1_id
    # team2_id
    # winner_id
    # event_id
    # score
    # match_stage
    # match date

    # first check if both teams are present in the database, if not, add them. Also, check if the CORE of the two teams match
    # if not, create a new core. A core changes if 3 or more players are different from one match to another.

    soup = BeautifulSoup(match_html, "html.parser")

    event_block = soup.find("a", class_="match-header-event")
    tournament_name = event_block.find("div", style="font-weight: 700;").text.strip()
    series = event_block.find("div", class_="match-header-event-series").text.strip()
    full_stage = f"{tournament_name} - {series}"

    teams = soup.find_all("a", class_ = "match-header-link")
    team_names = []
    for team in teams:
        team_names.append(team.find("div", class_ = "wf-title-med").text.strip())

    score_div = soup.find("div", class_ = "js-spoiler")
    if score_div:
        score = score_div.find_all("span")

    winning_team = team_names[0] if (int(score[0].text.strip()) > int(score[2].text.strip())) else team_names[1]

    print("MATCH RESULTS")
    print(f"{full_stage}")
    print(f"{team_names[0]} vs {team_names[1]}")
    print(f"WINNER:  {winning_team}")
    print(f"{score[0].text.strip()} - {score[2].text.strip()}")
    print("----------------------------")
