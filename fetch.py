import random
import time
import requests
from requests.adapters import HTTPAdapter

# Reuse TCP/TLS across requests and enable a connection pool
_session = requests.Session()
_adapter = HTTPAdapter(pool_connections=50, pool_maxsize=50, max_retries=0)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def get_html(url, timeout=(3.05, 15)):
    while True:
        try:
            time.sleep(random.uniform(1.2, 2.5))
            # timeout=(connect_timeout, read_timeout)
            resp = _session.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            print(f"Network error: {e}")
            input("Press SPACEBAR then Enter to continue...")
