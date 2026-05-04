import requests

# Your Render URL
url = "https://taste-trail-rl3f.onrender.com"

try:
    response = requests.get(url)
    if response.status_code == 200:
        print(f"Successfully pinged {url}")
    else:
        print(f"Pinged {url} but got status code: {response.status_code}")
except Exception as e:
    print(f"Error pinging {url}: {e}")
