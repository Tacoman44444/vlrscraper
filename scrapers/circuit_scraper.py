import fetch
from parsers import circuit_parser

def get_data_for_year(year):
    url = f"https://www.vlr.gg/vct-{year}"
    print(f"fetching the vct events for the year {year}")
    year_html = fetch.get_html(url)

    event_links = circuit_parser.parse_year_data(year_html)

    event_html = fetch.get_html(event_links[0])
    match_links = circuit_parser.parse_event_data(event_html)

    for match_link in match_links:
        match_html = fetch.get_html(match_link)
        circuit_parser.parse_match_data(match_html)
