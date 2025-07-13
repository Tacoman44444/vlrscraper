import time
import requests

HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_html(url):
    time.sleep(3)
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.text
