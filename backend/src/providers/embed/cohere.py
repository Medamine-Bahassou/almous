import requests
import os
from dotenv import load_dotenv

load_dotenv()

class CohereEmbeddings:
    def __init__(self, model="embed-v4.0", api_key=None, input_type="classification"):
        self.model = model
        self.input_type = input_type
        self.api_key = api_key or os.environ.get("COHERE_API_KEY")
        if not self.api_key:
            raise ValueError("COHERE_API_KEY not provided")
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": f"bearer {self.api_key}"
        }

    def embed_documents(self, texts):
        """Embed a list of documents (Cohere allows batching directly)."""
        all_embeddings = []
        batch_size = 96  # Cohere v4.0 batch limit
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            all_embeddings.extend(self._embed(batch))
        return all_embeddings

    def embed_query(self, text):
        embeddings = self._embed([text])
        if not embeddings:
            raise ValueError(f"Cohere returned no embedding for text: {text!r}")
        return embeddings[0]


    def _embed(self, texts):
        clean_texts = [t.strip() for t in texts if t and t.strip()]
        if not clean_texts:
            raise ValueError("No valid texts provided for embedding")

        data = {
            "model": self.model,
            "texts": clean_texts,
            "input_type": self.input_type,
            "embedding_types": ["float"]
        }

        response = requests.post(
            "https://api.cohere.com/v2/embed",
            headers=self.headers,
            json=data
        )

        if not response.ok:
            print("❌ Embedding request failed:", response.text)
        response.raise_for_status()

        res_json = response.json()
        embeddings = res_json.get("response", {}).get("embeddings", [])

        if not embeddings:
            print("⚠️ Cohere returned empty embeddings. Full response:")
            print(res_json)

        return [item["embedding"] for item in embeddings]
