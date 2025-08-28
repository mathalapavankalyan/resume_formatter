import os, requests, json
from dotenv import load_dotenv
from datetime import date

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not set")

# Get today's date in YYYY-MM-DD
today = date.today().isoformat()

# Call usage API
r = requests.get(
    f"https://api.openai.com/v1/usage?date={today}",
    headers={"Authorization": f"Bearer {api_key}"}
)

try:
    r.raise_for_status()
    data = r.json()
    print(f"✅ Usage for {today}:")
    print(json.dumps(data, indent=2))
except requests.exceptions.HTTPError as e:
    print(f"❌ HTTP error: {e}")
    print(f"Response: {r.text}")
except ValueError:
    print("❌ Response is not valid JSON")
    print(r.text)
