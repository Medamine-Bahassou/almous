from ddgs import DDGS

def search_duckduckgo(query, max_results=5):
    links = []
    with DDGS() as ddgs:
        results = ddgs.text(query, max_results=max_results, backend="html")
        for i, result in enumerate(results, start=1):
            print(f"   URL: {result['href']}\n")
            links.append(result['href'])
    return links


# print(search_duckduckgo("python programming", max_results=5))
