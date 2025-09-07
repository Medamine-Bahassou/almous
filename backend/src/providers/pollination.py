import os
import requests
import json
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_URL = "https://text.pollinations.ai/openai"
API_KEY = os.environ.get("POLLINATIONS_API_KEY")

class PollinationsProvider:
    def __init__(self):
        self.api_key = API_KEY

    def completion(self, model="openai", messages="", stream=False, **kwargs):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        # tools = [
        #     {
        #         "mcpServers": {
        #             "jina-mcp-server": {
        #             "url": "https://mcp.jina.ai/sse",
        #             }
        #         }
        #     }
        # ]

        body = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "private": True,
            **kwargs,
        }

        if stream:
            def stream_generator():
                with requests.post(BASE_URL, json=body, headers=headers, stream=True) as resp:
                    resp.raise_for_status()
                    for line in resp.iter_lines():
                        if line:
                            decoded = line.decode("utf-8")
                            if decoded.startswith("data: "):
                                data_str = decoded[len("data: "):]
                                if data_str == "[DONE]":
                                    break
                                chunk = json.loads(data_str)
                                choices = chunk.get("choices", [])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    content = delta.get("content")
                                    if content:
                                        yield content
            return stream_generator()  # Return generator explicitly
        else:
            resp = requests.post(BASE_URL, json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]



    def models(self):
        url = "https://text.pollinations.ai/models"
        try:
            response = requests.get(url)
            response.raise_for_status()
            models_data = response.json()
            
            # Build list of tuples (model_name, description)
            models_list = []
            for model in models_data:
                name = model.get("name", "unknown")
                description = model.get("description", "")
                models_list.append((name, description))
            
            return models_list

        except requests.exceptions.RequestException as e:
            print(f"Error fetching text models: {e}")
            # fallback static list or empty list
            return [
                ("openai", "openai (chat and vision)"),
                ("openai-large", "openai-large (vision)"),
                ("claude-hybridspace", "claude-hybridspace (vision)"),
                ("openai-audio", "openai-audio (speech-to-text)"),
            ]
