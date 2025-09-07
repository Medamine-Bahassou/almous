import requests
import json

# MCP server endpoint
MCP_URL = "https://api.scrapi.tech/mcp"

# The tool you want to use: either scrape_url_html or scrape_url_markdown
tool = "scrape_url_markdown"

# Website you want to scrape
website_url = "https://microsoft.github.io/poml/latest/language/template/#type-autocasting-in-attributes"

# Prepare payload
payload = {
    "tool": tool,
    "input": {
        "url": website_url
    }
}

# Optional: If you have an API key
headers = {
    # "Authorization": "Bearer YOUR_API_KEY",  # uncomment if you have a key
    "Content-Type": "application/json"
}

# Send request
response = requests.post(MCP_URL, headers=headers, data=json.dumps(payload))

# Parse response
if response.status_code == 200:
    result = response.json()
    print("Scraped content:\n", result.get("output"))
else:
    print("Error:", response.status_code, response.text)
