# import argparse
# from langchain_chroma import Chroma
# from langchain.prompts import ChatPromptTemplate
# from src.providers.embed.jina import JinaEmbeddings
# from src.providers.groq import GroqProvider
# from dotenv import load_dotenv
# from src.providers.global_completion import chat_completion

# from poml import poml 

# load_dotenv()

# CHROMA_PATH = "db/chroma"

# _RAG_PROMPT= "/home/med/Desktop/Git/almous/backend/prompts/rag.poml"


# PROMPT_TEMPLATE = """
# Document(s):
# {context}

# ---
# User: {question}
# Assistant:"""

# def query_rag(provider, model="llama-3.3-70b-versatile", message=None, memory="", stream=False, chroma_path="") :
#     """Run a query against the RAG pipeline using Chroma + Jina + llm provide."""
    
#     # Load DB
#     embedding_function = JinaEmbeddings()
#     db = Chroma(
#         persist_directory=chroma_path,
#         embedding_function=embedding_function
#     )

#     # Search
#     results = db.similarity_search_with_relevance_scores(message, k=5)
#     if not results or results[0][1] < 0.5:
#         return "Unable to find matching results."

#     # Prepare context
#     context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])
#     prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    
#     # prompt = prompt_template.format(context=context_text, question=message)

#     prompt = poml(
#         markup=_RAG_PROMPT,
#         format="openai_chat",
#         context={
#             "document": context_text,
#             "message": message,
#             "memory":memory,
#         }
#     )
#     messages = prompt.get("messages")
#     print(messages)

#     # LLM response
#     # groq_provider = GroqProvider()
#     # messages = [{"role": "user", "content": prompt}]
#     # response_text = groq_provider.completion(system="", messages=messages)

#     if provider == None:
#         return "No provider"
#     # messages = [{"role": "user", "content": prompt}]

#     # print(">>>>>>DEBUG PROMPT "+messages +"\n ===============")
#     print(messages)

#     return chat_completion(provider=provider, messages=messages, model=model, stream=stream)
    


#     # # Sources
#     # sources = [doc.metadata.get("source") for doc, _ in results]
#     # return f"{response_text} \n <br>  \n # Sources: <br> \n {sources}"

# def main():
#     parser = argparse.ArgumentParser()
#     parser.add_argument("query_text", type=str, help="The query text.")
#     args = parser.parse_args()

#     result = query_rag(args.query_text)
#     print(result)

# if __name__ == "__main__":
#     main()




# rag
from langchain_chroma import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from src.providers.embed.jina import JinaEmbeddings
from langchain_cohere import CohereEmbeddings
from langchain_nomic import NomicEmbeddings
from langchain_together import TogetherEmbeddings



from src.providers.global_completion import chat_completion
from poml import poml
import os
from dotenv import load_dotenv

load_dotenv()

# ENHANCEMENT: A much more robust RAG prompt template.
# Using a clear, structured prompt is key to getting good RAG results.
RAG_PROMPT_TEMPLATE = """
**Task:** You are an intelligent assistant. Use the provided "Context Documents" to answer the "User's Question" accurately and concisely.

**Context Documents:**
---
{context}
---

**User:** {question}

---
{memory}
---
**Answer:** 
"""


def query_rag(provider, model, message, memory="", stream=False, chroma_path="",k=10):
    """
    Queries a temporary ChromaDB instance, constructs a high-quality prompt,
    and gets a response from the LLM.
    """
    if not os.path.isdir(chroma_path):
        return "Error: Invalid document database path provided."

    # 1. Load DB
    # embedding_function = FastEmbedEmbeddings()
    embedding_function = JinaEmbeddings(model="jina-clip-v2")
    # embedding_function = CohereEmbeddings(model="embed-v4.0")
    # embedding_function = NomicEmbeddings(model="nomic-embed-text-v1.5")
    # embedding_function = TogetherEmbeddings(model="intfloat/multilingual-e5-large-instruct")



    db = Chroma(persist_directory=chroma_path, embedding_function=embedding_function)

    # 2. Search for relevant documents
    # ENHANCEMENT: Use a relevance score threshold to filter out bad results.
    results = db.similarity_search_with_relevance_scores(message, k=k)
    
    # Filter results based on the score. A score of 0.7 is a good starting point for Jina.
    # relevant_docs = [doc for doc, score in results if score > 0.6]
    # print(relevant_docs)
    # if not relevant_docs:
    #     # We can either give a canned response or let the LLM handle it with no context.
    #     # Let's try letting the LLM handle it, as it might have general knowledge.
    #     # For a stricter RAG, you would return this message:
    #     # return "I could not find any relevant information in the provided documents to answer your question."
    #     context_text = "No relevant documents found."
    # else:
    #     # Prepare context
    #     context_text = "\n\n---\n\n".join(
    #         f"Source: {doc.metadata.get('source', 'N/A')}\nContent: {doc.page_content}"
    #         for doc in relevant_docs
    #     )
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])

    # 3. Construct the prompt using our high-quality template
    formatted_prompt = RAG_PROMPT_TEMPLATE.format(
        context=context_text,
        question=message,
        memory=memory
    )
    
    # The system prompt tells the LLM its core identity, while the user message contains the task.
    messages = [
        {"role": "system", "content": "You are a helpful assistant that answers questions based on provided documents."},
        {"role": "user", "content": formatted_prompt}
    ]
    
    print("--- RAG PROMPT ---")
    print(messages[1]['content'])
    print("------------------")

    # 4. Get LLM response
    return chat_completion(
        provider=provider, 
        messages=messages, 
        model=model, 
        stream=stream
    )