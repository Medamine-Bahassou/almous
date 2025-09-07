# import requests

# url = "https://integrate.api.nvidia.com/v1/embeddings"

# payload = {
#     "input": "string",
#     "model": "nvidia/llama-3.2-nemoretriever-300m-embed-v1",
#     "input_type": "passage",
#     "encoding_format": "float",
#     "truncate": "NONE",
#     "user": "string"
# }
# headers = {
#     "accept": "application/json",
#     "content-type": "application/json",
#     "authorization": "Bearer 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"
# }

# response = requests.post(url, json=payload, headers=headers)

# print(response.text)



import requests
import os
from dotenv import load_dotenv

load_dotenv()

class NvidiaEmbeddings:
    def __init__(self, model="nvidia/llama-3.2-nemoretriever-300m-embed-v1", api_key=None):
        self.model = model
        self.api_key = api_key or os.environ.get("NVIDIA_API_KEY")
        if not self.api_key:
            raise ValueError("NVIDIA_API_KEY not provided")
        self.url = "https://integrate.api.nvidia.com/v1/embeddings"
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {self.api_key}"
        }

    def embed_documents(self, texts):
        """Embed a list of documents."""
        all_embeddings = []
        for text in texts:
            all_embeddings.append(self._embed(text))
        return all_embeddings

    def embed_query(self, text):
        """Embed a single query."""
        return self._embed(text)

    def _embed(self, text):
        if not text or not text.strip():
            raise ValueError("No valid text provided for embedding")

        payload = {
            "input": text,
            "model": self.model,
            "input_type": "passage",
            "encoding_format": "float",
            "truncate": "NONE",
            "user": "user"
        }

        response = requests.post(self.url, headers=self.headers, json=payload)

        if not response.ok:
            print("❌ Embedding request failed:", response.text)
        response.raise_for_status()

        return response.json().get("data", [{}])[0].get("embedding")

# # Example usage
# if __name__ == "__main__":
#     nvidia_embed = NvidiaEmbeddings()
#     embedding = nvidia_embed.embed_query("Hello world")
#     print(embedding)
