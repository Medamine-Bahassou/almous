import os
import re
import shutil
from pathlib import Path

from markitdown import MarkItDown


from dotenv import load_dotenv

load_dotenv()


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



def load_documents_with_markitdown(folder_path: str) -> str:
    """Load and convert all supported files in the folder into Markdown documents."""
    md_converter = MarkItDown()

    res = ""

    for file_path in Path(folder_path).glob("**/*"):
        if file_path.is_file():
            try:
                # Convert to Markdown
                result = md_converter.convert(str(file_path))
                markdown_text = result.text_content

                # clean text
                markdown_text = clean_text(markdown_text)

                res += markdown_text 

            except Exception as e:
                print(f"⚠️ Skipping {file_path}: {e}")

    print(f"✅ Loaded text from {folder_path}")
    return res


# res = load_documents_with_markitdown("/home/med/Desktop/Git/almous/uploads/")
# print(res)



# from docling.document_converter import DocumentConverter

# source = "https://arxiv.org/pdf/2408.09869"  # document per local path or URL
# converter = DocumentConverter()
# result = converter.convert(source)
# print(result.document.export_to_markdown())  # output: "## Docling Technical Report[...]"
