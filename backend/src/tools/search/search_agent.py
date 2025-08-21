from src.tools.search.search import search_duckduckgo
from src.tools.search.crawl import *
import re 

# search(query)
def get_queries(text):
    # Find all matches between search( and )
    matches = re.findall(r"search\((.*?)\)", text)
    return matches


def search(query):
  links = search_duckduckgo(query,2)
  result = ""
  for i in range(len(links)) :
    result += f"""
Link {i} : {links[i]}  \n
{asyncio.run(crawl(links[i]))} \n
=====
"""  
  return result 

# print(search("https://kick.com/"))