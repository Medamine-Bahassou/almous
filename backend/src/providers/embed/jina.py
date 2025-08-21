import requests
import os
from dotenv import load_dotenv

load_dotenv()

class JinaEmbeddings:
    def __init__(self, model="jina-embeddings-v2-base-en", api_key=None):
        self.model = model
        self.api_key = api_key or os.environ.get("JINA_API_KEY")
        if not self.api_key:
            raise ValueError("JINA_API_KEY not provided")
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }

    def embed_documents(self, texts):
        """Embed a list of documents with batching."""
        all_embeddings = []
        batch_size = 512  # Jina API limit
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            all_embeddings.extend(self._embed(batch))
        return all_embeddings

    def embed_query(self, text):
        """Embed a single query."""
        return self._embed([text])[0]

    def _embed(self, texts):
        # Remove empty strings and strip spaces
        clean_texts = [t.strip() for t in texts if t and t.strip()]
        if not clean_texts:
            raise ValueError("No valid texts provided for embedding")

        data = {
            "model": self.model,
            "input": clean_texts
        }

        response = requests.post(
            'https://api.jina.ai/v1/embeddings',
            headers=self.headers,
            json=data
        )

        if not response.ok:
            print("❌ Embedding request failed:", response.text)
        response.raise_for_status()

        return [item['embedding'] for item in response.json()['data']]
