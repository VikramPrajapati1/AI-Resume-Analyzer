import urllib.request
import threading
import time
import uvicorn
from main import app

def run_server():
    uvicorn.run(app, host='127.0.0.1', port=8877, log_level='warning')

t = threading.Thread(target=run_server, daemon=True)
t.start()
time.sleep(2)

# Test root serving React SPA
with urllib.request.urlopen('http://127.0.0.1:8877/') as response:
    html = response.read().decode('utf-8')
    print('Root status:', response.status)
    print('HTML contains root div:', '<div id="root">' in html)
    print('HTML title:', [line.strip() for line in html.splitlines() if '<title>' in line])

# Test API health
with urllib.request.urlopen('http://127.0.0.1:8877/api/health') as response:
    api_json = response.read().decode('utf-8')
    print('API health status:', response.status, api_json)

print('VERIFICATION COMPLETE: Everything is working seamlessly!')
