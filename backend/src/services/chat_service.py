import uuid
from werkzeug.utils import secure_filename
import json

from src.providers.global_completion import ( 
  chat_completion,
  chat_completion_temp,
  get_memory
)
from src.providers.pollination import PollinationsProvider
from src.providers.groq import GroqProvider
from src.providers.a4f import A4FProvider


##
## generate_data_store
from src.tools.rag.query_data import query_rag
from src.tools.rag.build_database import (
  generate_data_store, # for document parsing
  generate_data_store_text, # for non document (just text)
)


##
## search agent
from src.tools.search.search_agent import (
   get_queries,
   search
)


def chat_service_models(provider):
    if provider == "groq":
        return GroqProvider().models()
    elif provider == "a4f":
        return A4FProvider().models()
    elif provider == "pollination":
        return PollinationsProvider().models()
    else:
        return []


def chat_service_completion(provider, system, model, message, stream=False):
  if provider == "pollination":
    provider1 = PollinationsProvider()
  elif provider == "groq":
    provider1= GroqProvider() 
  elif provider == "pollination":
    provider1 = A4FProvider()

  else:
    return

  return chat_completion(
     provider=provider1, 
     system=system, 
     model=model, 
     user_message=message, 
     stream=stream
  )


def chat_rag_service_completion(provider, system, model, message, attachment, stream=False):
  if isinstance(attachment, list):
    attachment = attachment[0]   

  filename_secure = secure_filename(attachment)
  filename = f"/home/med/Desktop/Git/AIONOS/backend_new/src/uploads/{filename_secure}"


  ## chrome db data store
  print("processing document (generating data store) ...")

  chroma_path= generate_data_store()

  print("finish processing document !")

  ## rag query (groq)  

  if provider == "pollination":
    provider1 = PollinationsProvider()
  elif provider == "groq":
    provider1= GroqProvider() 
  elif provider == "a4f":
    provider1 = A4FProvider()
  else:
    return 
  
  # TODO: args must be like (provider1, system, model, message, filename_secure, stream)
  return query_rag(
     provider=provider1, 
     query_text=message, 
     model=model, 
     system=system, 
     stream=stream, 
     chroma_path=chroma_path
  ) # TODO: add providers & system ...


def search_agent_service_completion(provider, model, message, stream=False):
  system = """
You are a search AI.  
Your only task is to generate one or more concise, relevant search queries based on the user request.  

Output format rules (STRICT):  
- Always output each query on its own line in the form: search(<query>)  
- Replace any line breaks in the query with spaces.  
- Do NOT add words like "search for", "find", or "look up" inside the query.  
- Do NOT repeat the word 'search' inside the query.  
- Do NOT include quotes, punctuation outside the parentheses, or any text before/after the search(...) lines.  
- Keep the query natural and optimized for search engines.  
- max 2 search queries.  

Example:  
User: find best coffee shops in Paris  
AI:  
search(best coffee shops in Paris)  
search(top cafes Paris reviews)  
"""
  

  memory = "\n".join(item["content"] for item in get_memory())

  if memory:
      memory_str = "\n".join(memory)
      prompt = f"""      
      {system}
      ---
      {memory_str}
      ---
      {message}
      """
  else:
      prompt = f"""
      {system}
      ---
      {message}
      """

  if provider == "pollination":
    provider1 = PollinationsProvider()
  elif provider == "groq":
    provider1= GroqProvider() 
  elif provider == "a4f":
    provider1 = A4FProvider()
  else:
    return "ERROR PROVIDER"
  
  res = chat_completion_temp(
     provider=provider1, 
     system=system, 
     model=model, 
     user_message=prompt, 
     stream=False
  )

  print(res)
  scraped_data = ""

  # SCRAPPING
  try:
    queries = get_queries(res)
    print("scrapping data ... ",queries )
    for i in range(len(queries)):
      scraped_data += search(queries[i]) # test one query
  except Exception as e :
    print("error scrap data",e)
    scraped_data = "Error while scrapping, No information found !"


  # RAG
  try:
    # process the scraped data
    print("processing the scraped data ...")
    chroma_path = generate_data_store_text(scraped_data)
  except Exception as e :
    print("error process data with chroma",e)
  
  
  print("ai generating response ...")
  
  return query_rag(
     provider=provider1, 
     query_text=message, 
     model=model, 
     stream=stream, 
     chroma_path=chroma_path
  ) 


# from flask import Response, stream_with_context
# import json

# def search_agent_service_completion(provider, model, message, stream=False):
#     def generate():
#         yield json.dumps({"status": "Generating search queries..."}) + "\n"
#         system = """..."""

#         if provider == "pollination":
#             provider1 = PollinationsProvider()
#         elif provider == "groq":
#             provider1 = GroqProvider()
#         elif provider == "a4f":
#             provider1 = A4FProvider()
#         else:
#             yield json.dumps({"status": "ERROR: invalid provider"}) + "\n"
#             return

#         res = chat_completion(
#             provider=provider1,
#             system=system,
#             model=model,
#             user_message=message,
#             stream=False
#         )

#         yield json.dumps({"status": "Extracting search queries..."}) + "\n"
#         try:
#             queries = get_queries(res)
#         except Exception as e:
#             yield json.dumps({"status": f"Error parsing queries: {str(e)}"}) + "\n"
#             return

#         yield json.dumps({"status": f"Scraping {len(queries)} queries..."}) + "\n"
#         scraped_data = ""
#         for q in queries:
#             scraped_data += search(q)

#         yield json.dumps({"status": "Building ChromaDB index..."}) + "\n"
#         chroma_path = generate_data_store_text(scraped_data)

#         yield json.dumps({"status": "Generating final AI response..."}) + "\n"
#         for chunk in query_rag(
#             provider=provider1,
#             query_text=message,
#             model=model,
#             stream=True,
#             chroma_path=chroma_path
#         ):
#             yield chunk  # this can be raw AI text

#     return Response(stream_with_context(generate()), mimetype='text/plain')



