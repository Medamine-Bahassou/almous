from src.providers.embed.jina import JinaEmbeddings
# from langchain_cohere import CohereEmbeddings
# from langchain_nomic import NomicEmbeddings
# from langchain_together import TogetherEmbeddings
from src.providers.embed.nvidia_llama import NvidiaEmbeddings


class EmbeddingFunction:
    def __init__(self, provider: str = "jina"):
        self.provider = provider.lower()
        self.embedding = self._get_embedding_provider()

    def _get_embedding_provider(self):
        if self.provider == "jina":
            return JinaEmbeddings()
        elif self.provider == "nvidia":
            return NvidiaEmbeddings()
        # elif self.provider == "cohere":
        #     return CohereEmbeddings()
        # elif self.provider == "nomic":
        #     return NomicEmbeddings()
        # elif self.provider == "together":
        #     return TogetherEmbeddings()
        else:
            raise ValueError(f"Unknown embedding provider: {self.provider}")

    def get(self):
        """Return the embedding instance."""
        return self.embedding
