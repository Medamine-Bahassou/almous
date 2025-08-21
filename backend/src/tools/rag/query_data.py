import argparse
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from src.providers.embed.jina import JinaEmbeddings
from src.providers.groq import GroqProvider
from dotenv import load_dotenv
from src.providers.global_completion import chat_completion

load_dotenv()

CHROMA_PATH = "db/chroma"
PROMPT_TEMPLATE = """
Document(s):
{context}

---
User: {question}
Assistant:"""

def query_rag(provider, system="", model="llama-3.3-70b-versatile", query_text=None, stream=False, chroma_path="") :
    """Run a query against the RAG pipeline using Chroma + Jina + Groq."""
    
    # Load DB
    embedding_function = JinaEmbeddings()
    db = Chroma(
        persist_directory=chroma_path,
        embedding_function=embedding_function
    )

    # Search
    results = db.similarity_search_with_relevance_scores(query_text, k=5)
    if not results or results[0][1] < 0.5:
        return "Unable to find matching results."

    # Prepare context
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # LLM response
    # groq_provider = GroqProvider()
    # messages = [{"role": "user", "content": prompt}]
    # response_text = groq_provider.completion(system="", messages=messages)

    if provider == None:
        return "No provider"
    # messages = [{"role": "user", "content": prompt}]

    print(">>>>>>DEBUG PROMPT "+prompt +"\n ===============")
    return chat_completion(provider=provider, system=system, user_message=prompt, model=model, stream=stream)
    


    # # Sources
    # sources = [doc.metadata.get("source") for doc, _ in results]
    # return f"{response_text} \n <br>  \n # Sources: <br> \n {sources}"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()

    result = query_rag(args.query_text)
    print(result)

if __name__ == "__main__":
    main()
