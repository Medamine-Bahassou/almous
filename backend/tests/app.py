import os
import json
from flask import Flask, request, Response
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Groq client
client = Groq(api_key="")

# Chat endpoint
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()

    # The messages from the frontend (@ai-sdk/react)
    user_messages = data.get("messages", [])

    # Convert frontend messages to Groq format
    groq_messages = []
    for msg in user_messages:
        role = msg.get("role", "user")
        parts = msg.get("parts", [])
        for part in parts:
            if part.get("type") == "text":
                groq_messages.append({"role": role, "content": part["text"]})
 
    def generate():

        reasoning = False
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # reasoning-capable Groq model
            messages=groq_messages,
            stream=True,
        )

        # Stream chunks back to frontend
        for chunk in stream:
            delta = chunk.choices[0].delta

            
            # If reasoning tokens are present (Groq supports think tags <think>...</think>)
            if delta.content and ("<think>" in delta.content or "</think>" in delta.content or reasoning == True):

                event = {
                    "id": chunk.id,
                    "role": "assistant",
                    "parts": [{"type": "reasoning", "text": delta.content}],
                }
                print(event)
                
                yield f"data: {json.dumps(event)}\n\n"

                if "<think>" in delta.content : 
                    reasoning = True
                elif "</think>" in delta.content : 
                    reasoning = False
                    continue


            if delta.content and reasoning == False:
                # Normal text part
                event = {
                    "id": chunk.id,
                    "role": "assistant",
                    "parts": [{"type": "text", "text": delta.content}],
                }
                print(event)
                yield f"data: {json.dumps(event)}\n\n"

        yield "data: [DONE]\n\n"

    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
