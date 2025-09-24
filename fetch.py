import time
import requests
from requests.adapters import HTTPAdapter

# Reuse TCP/TLS across requests and enable a connection pool
_session = requests.Session()
_adapter = HTTPAdapter(pool_connections=50, pool_maxsize=50, max_retries=0)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

def get_html(url, timeout=(3.05, 15)):
    while True:
        try:
            time.sleep(1)
            # timeout=(connect_timeout, read_timeout)
            resp = _session.get(url, headers=HEADERS, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            print(f"Network error: {e}")
            input("Press SPACEBAR then Enter to continue...")
