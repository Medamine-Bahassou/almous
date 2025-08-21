import numpy as np
from google import genai

def embed_text(texts):
    client = genai.Client()

    # texts can be a string or list of strings
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts
    )

    embeddings = [np.array(e.values, dtype='float32') for e in result.embeddings]

    if isinstance(texts, str):
        # single text: return 1D array
        return embeddings[0]
    else:
        # multiple texts: return 2D array
        return np.vstack(embeddings)
