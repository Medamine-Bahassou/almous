# app.py

import os
import json
from flask import Flask, request, Response, jsonify, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for requests from your frontend's origin
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize the Groq client
try:
    groq_client = Groq(api_key="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")
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    groq_client = None

# --- Helper Function to format messages ---
def format_messages_for_groq(messages):
    """
    Formats messages from the Vercel AI SDK format to the Groq API format.
    The frontend sends: [{'role': 'user', 'parts': [{'type': 'text', 'text': 'Hello'}]}]
    Groq expects: [{'role': 'user', 'content': 'Hello'}]
    """
    formatted_messages = []
    for msg in messages:
        # We only process 'user' and 'assistant' roles for the conversation
        if msg.get("role") in ["user", "assistant"]:
            # Combine all text parts into a single content string
            content = "".join(part.get("text", "") for part in msg.get("parts", []) if part.get("type") == "text")
            if content:
                formatted_messages.append({"role": msg["role"], "content": content})
    return formatted_messages

# --- Main Chat Endpoint ---
@app.route('/api/chat', methods=['POST'])
def chat_handler():
    if not groq_client:
        return jsonify({"error": "Groq client not initialized. Check API key."}), 500

    try:
        data = request.json
        messages = data.get('messages', [])
        # The frontend also sends the model, but we can hardcode it here or use it
        # chat_model = data.get('selectedChatModel', 'llama3-8b-8192')
        chat_model = "llama3-8b-8192" # Using a reliable and fast model

        if not messages:
            return jsonify({"error": "No messages provided"}), 400

        # Format messages for the Groq API
        formatted_messages = format_messages_for_groq(messages)

        def generate_stream():
            """Generator function to stream the response from Groq."""
            try:
                # Create a streaming chat completion request
                stream = groq_client.chat.completions.create(
                    messages=formatted_messages,
                    model=chat_model,
                    stream=True,
                )

                # The Vercel AI SDK expects a specific data format for streaming text:
                # 0:"chunk1"
                # 0:"chunk2"
                # ...
                # The '0:' is a prefix for text data.
                for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        # We need to JSON-encode the string to handle special characters
                        # and then wrap it in the AI SDK's text format.
                        yield f'0:{json.dumps(content)}\n'

            except Exception as e:
                print(f"An error occurred during streaming: {e}")
                # Yield a final error message in the stream if something goes wrong
                error_message = f"Error: {str(e)}"
                yield f'0:{json.dumps(error_message)}\n'
        
        # Use stream_with_context to make the request context available to the generator
        # The mimetype is important for the AI SDK to correctly interpret the stream
        return Response(stream_with_context(generate_stream()), mimetype='text/plain; charset=utf-8')

    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({"error": str(e)}), 500

# --- Placeholder Vote Endpoint ---
@app.route('/api/vote', methods=['GET'])
def get_votes():
    """
    Placeholder endpoint for fetching votes.
    In a real application, you would query your database.
    """
    chat_id = request.args.get('chatId')
    print(f"Received request for votes for chat ID: {chat_id}")
    
    # Return some dummy data in the format the frontend expects
    dummy_votes = [
        # Example: {"id": "vote_1", "messageId": "msg_abc", "chatId": chat_id, "voteType": "up"}
    ]
    return jsonify(dummy_votes)


if __name__ == '__main__':
    # Run the app on a different port than the frontend, e.g., 5001
    app.run(debug=True, port=5001)