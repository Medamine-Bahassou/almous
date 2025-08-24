from poml import poml 

from src.tools.rag.query_data import (
  query_rag
)
from src.tools.github.scrap_github import ( 
  scrap_repo
)

from src.providers.pollination import PollinationsProvider
from src.providers.groq import GroqProvider
from src.providers.a4f import A4FProvider





def chat_github_repo_service(repo_url, provider, model, stream=False):

  prompt = """
  You are a Github README Generator Agent.\n\n
  Generate a Github Readme file for this all data
  """

  data_rag_path = scrap_repo(repo_url)

  if(provider == "pollination"):
    provider1 = PollinationsProvider()
  elif (provider == "groq"):
    provider1 = GroqProvider()
  elif (provider == "a4f"):
    provider1 = A4FProvider()

  return query_rag(
    provider=provider1,
    model=model,
    message=prompt,
    memory="",
    stream=True,
    chroma_path=data_rag_path
  )