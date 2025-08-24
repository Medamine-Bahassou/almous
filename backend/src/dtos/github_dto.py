# dtos/chat_dto.py
from pydantic import BaseModel
from typing import List, Optional

class GithubRequestDTO(BaseModel):
    repo_url: str
    provider: str = "groq"
    model: str
