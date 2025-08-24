import requests
from src.tools.rag.build_database import (
    generate_data_store_text
)

def github_to_uithub(github_url):
    """
    Convert a GitHub repo URL to a uithub.com API URL.
    """
    # Remove trailing slash if exists
    github_url = github_url.rstrip('/')
    
    # Split the URL to get owner and repo
    parts = github_url.split('/')
    
    if len(parts) < 5:
        raise ValueError("Invalid GitHub repo URL. Format should be https://github.com/owner/repo")
    
    owner = parts[3]
    repo = parts[4]
    
    # Build the uithub URL
    uithub_url = f"https://uithub.com/{owner}/{repo}?accept=text%2Fplain&maxTokens=50000"
    return uithub_url

def fetch_uithub_content(uithub_url):
    """
    Fetch the content from the uithub URL.
    """
    response = requests.get(uithub_url)
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Failed to fetch content. Status code: {response.status_code}")


def scrap_repo(github_repo_url):
  uiurl = github_to_uithub(github_repo_url)
  repo_data = fetch_uithub_content(uiurl)
  data_rag_path = generate_data_store_text(repo_data)
  return data_rag_path

# test 
if __name__ == "__main__":
    github_repo = input("Enter GitHub repo URL: ").strip()
    try:
        uithub_url = github_to_uithub(github_repo)
        print(f"Converted URL: {uithub_url}")
        
        content = fetch_uithub_content(uithub_url)
        print("Fetched Content:\n")
        print(content[:1000])  # Print first 1000 characters for brevity
    except Exception as e:
        print("Error:", e)
