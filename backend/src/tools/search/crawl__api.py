# curl 'https://md.dhr.wtf/?url=https://example.com'
import requests

def convert_url_to_markdown(url):
    api_url = 'https://md.dhr.wtf/'
    response = requests.get(api_url, params={'url': url})
    if response.status_code == 200:
        return response.text
    else:
        return None

# Example usage
url = 'https://example.com'
markdown_content = convert_url_to_markdown(url)
if markdown_content:
    print(markdown_content)
else:
    print('Failed to convert URL to Markdown.')
