from google import genai
from langchain.embeddings.base import Embeddings


class GeminiEmbeddings(Embeddings):
    def __init__(self, model="models/embedding-001"):
        self.client = genai.Client()
        self.model = model

    def embed_documents(self, texts):
        # Gemini expects a list of strings
        result = self.client.models.embed_content(
            model=self.model,
            contents=texts
        )
        # Gemini returns list of embeddings
        return [e.values for e in result.embeddings]

    def embed_query(self, text):
        result = self.client.models.embed_content(
            model=self.model,
            contents=[text]
        )
        return result.embeddings[0].values
