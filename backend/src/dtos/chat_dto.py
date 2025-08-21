# dtos/chat_dto.py
from pydantic import BaseModel
from typing import List, Optional

class ChatRequestDTO(BaseModel):
    provider: str = "groq"
    message: str
    model: str
    attachment: Optional[List[str]] = []
    system: Optional[str] = "you are ai assistant"
    stream: bool = False
    tools: Optional[List[str]] = []
