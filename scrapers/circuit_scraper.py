import fetch
from parsers.year_parser import parse_year_data
from parsers.event_parser import parse_event_data
from parsers.match_parser import parse_match_data
from parsers.map_parser import parse_map_data
from parsers.duels_parser import parse_duels_data

def get_data_for_year(year, skip_matches=0):
    url = f"https://www.vlr.gg/vct-{year}"
    print(f"fetching the vct events for the year {year}")
    year_html = fetch.get_html(url)

    event_links = parse_year_data(year_html)
    event_links.reverse()
    for i in range(0, len(event_links)):
        event_matches_html = fetch.get_html(event_links[i])
        event_overview_html = fetch.get_html(event_links[i].replace("event/matches/", "event/", 1))
        match_links = parse_event_data(event_overview_html, event_matches_html, event_links[i])
        for j, match_link in enumerate(match_links):
            if j < skip_matches:
                continue
            match_html = fetch.get_html(match_link)
            match_id, map_vlr_ids, map_links, map_performance_links = parse_match_data(match_html, match_link)
            if map_links:
                for k in range(len(map_links)):
                    print(map_links[k])
                    map_html = fetch.get_html(map_links[k])
                    map_performance_html = fetch.get_html(map_performance_links[k])
                    map_played_id, team1_ids, team2_ids = parse_map_data(map_html, match_id, map_vlr_ids[k], k+1)
                    parse_duels_data(map_performance_html, map_vlr_ids[k], map_played_id, team1_ids, team2_ids)
