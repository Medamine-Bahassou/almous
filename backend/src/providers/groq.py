# 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
import os
import openai

class GroqProvider:
    def __init__(self):
        self.client = openai.OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=os.environ.get("GROQ_API_KEY")
        )

    def completion(self, system, model="llama-3.3-70b-versatile", messages=None, stream=False, **kwargs):
        """
        Compatible with global_completion.py: requires 'system', 'messages', and 'model'.
        """
        if messages is None:
            messages = []

        # Prepend the system message, which global_completion.py sends separately
        if system:
            messages = [{"role": "system", "content": system}] + messages

        # Ensure all messages have content as a string (not list or dict)
        for msg in messages:
            if not isinstance(msg.get("content"), str):
                raise ValueError(f"Invalid message content: {msg}")

        response = self.client.chat.completions.create(
            messages=messages,
            model=model,
            stream=stream,
            **kwargs
        )

        if stream:
            # This will return a generator
            def stream_generator():
                for chunk in response:
                    delta = chunk.choices[0].delta
                    content = delta.content if delta else None
                    if content:
                        yield content
            return stream_generator()  # 🧠 explicitly return a generator
        else:
            return response.choices[0].message.content

    def models(self):
        models = self.client.models.list()
        models_list = []
        for model in models.data:
            models_list.append([model.id, model.id])
        return models_list
