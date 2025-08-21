from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
import os
import re
import shutil
from src.providers.embed.jina import JinaEmbeddings
from pathlib import Path

from markitdown import MarkItDown


from dotenv import load_dotenv

load_dotenv()



CHROMA_PATH = "db/chroma"
DATA_PATH = "/home/med/Desktop/Git/AIONOS/backend_new/src/tools/rag/data"

def main():
    generate_data_store()

def generate_data_store():
    # documents = load_documents()
    documents = load_documents_with_markitdown(DATA_PATH)
    chunks = split_text(documents)
    return save_to_chroma(chunks)


def generate_data_store_text(data: str):
    # Wrap the string as a single Document
    doc = Document(page_content=data, metadata={})
    chunks = split_text([doc])  # split_text expects a list of Documents
    return save_to_chroma(chunks)


def load_documents():
    loader = DirectoryLoader(DATA_PATH, glob="*.md")
    documents = loader.load()
    return documents



import string

def clean_text(text: str) -> str:
    # Remove markdown images
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)

    # Remove non-ASCII characters (like emojis, special Unicode)
    text = text.encode("ascii", errors="ignore").decode()

    # Remove markdown links but keep text: [text](url) => text
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)

    # Remove inline code `code`
    text = re.sub(r"`{1,3}.*?`{1,3}", "", text)

    # Remove HTML tags if any
    text = re.sub(r"<.*?>", "", text)

    # Collapse multiple newlines and spaces to a single space
    text = re.sub(r"\s+", " ", text)

    # Strip leading/trailing spaces
    text = text.strip()

    return text

def load_documents_with_markitdown(folder_path: str) -> list[Document]:
    """Load and convert all supported files in the folder into Markdown documents."""
    md_converter = MarkItDown()
    documents = []

    for file_path in Path(folder_path).glob("**/*"):
        if file_path.is_file():
            try:
                # Convert to Markdown
                result = md_converter.convert(str(file_path))
                markdown_text = result.text_content

                # clean text
                markdown_text = clean_text(markdown_text)

                # Skip empty documents
                if not markdown_text.strip():
                    continue

                # Store as LangChain Document
                documents.append(Document(
                    page_content=markdown_text,
                    metadata={"source": str(file_path)}
                ))
            except Exception as e:
                print(f"⚠️ Skipping {file_path}: {e}")

    print(f"✅ Loaded {len(documents)} documents from {folder_path}")
    return documents


def split_text(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    if chunks:  # Make sure list is not empty
        document = chunks[min(10, len(chunks)-1)]  # Last chunk if fewer than 11
        print(document.page_content)
        print(document.metadata)
    print(document.page_content)
    print(document.metadata)
    return chunks

import uuid

def save_to_chroma(chunks: list[Document]):

    PATH = f"{CHROMA_PATH}/{uuid.uuid4()}"

    # # Clear out the database first
    # if os.path.exists(CHROMA_PATH):
    #     shutil.rmtree(CHROMA_PATH)
        

    # Create a new DB from the documents using Jina embeddings
    embedding_function = JinaEmbeddings()
    Chroma.from_documents(
        chunks,
        embedding_function,
        persist_directory=PATH
    )
    print(f"Saved {len(chunks)} chunks to {PATH}.")

    return PATH

if __name__ == "__main__":
    main()
