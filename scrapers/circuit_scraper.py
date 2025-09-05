import fetch
from parsers import circuit_parser

def get_data_for_year(year):
    url = f"https://www.vlr.gg/vct-{year}"
    print(f"fetching the vct events for the year {year}")
    year_html = fetch.get_html(url)

    event_links = circuit_parser.parse_year_data(year_html)

    event_matches_html = fetch.get_html(event_links[0])
    event_overview_html = fetch.get_html(event_links[0].replace("event/matches/", "event/", 1))
    match_links = circuit_parser.parse_event_data(event_overview_html, event_matches_html, event_links[0])

    for match_link in match_links:
        match_html = fetch.get_html(match_link)
        match_id, map_vlr_ids, map_links, map_performance_links = circuit_parser.parse_match_data(match_html, match_link)
        for i in range (len(map_links)):
            print(map_links[i])
            map_html = fetch.get_html(map_links[i])
            map_performance_html = fetch.get_html(map_performance_links[i])
            map_played_id = circuit_parser.parse_map_data(map_html, match_id, map_vlr_ids[i], i+1)
            circuit_parser.parse_duels_data(map_performance_html, map_vlr_ids[i], map_played_id)