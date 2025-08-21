import os
from openai import OpenAI

class A4FProvider:
    def __init__(self):
        self.api_key = os.environ.get("A4F_API_KEY", "ddc-a4f-bc5817b66d684c3fa712da0357f2a2d9")
        self.base_url = "https://api.a4f.co/v1"
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)

    def completion(self, system, model="provider-6/o3-high", messages=None, stream=False, **kwargs):
        if messages is None:
            messages = []

        # Prepend system message
        if system:
            messages = [{"role": "system", "content": system}] + messages

        # Validate all message contents are strings
        for msg in messages:
            if not isinstance(msg.get("content"), str):
                raise ValueError(f"Invalid message content: {msg}")

        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=stream,
            **kwargs
        )

        if stream:
            def stream_generator():
                for chunk in response:
                    delta = chunk.choices[0].delta
                    content = delta.content if delta else None
                    if content:
                        yield content
            return stream_generator()
        else:
            return response.choices[0].message.content

    def models(self):
        models = self.client.models.list()
        models_list = []
        for model in models.data:
            models_list.append([model.id, getattr(model, "base_model", model.id)])
        return models_list
