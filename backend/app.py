from flask import Flask
from flask_cors import CORS
import os
from pathlib import Path
from dotenv import load_dotenv


# Load env
load_dotenv()

# App setup
app = Flask(__name__)
# BASE_INDEX_DIR = Path(__file__).parent
# app.config['UPLOAD_FOLDER'] = f'{BASE_INDEX_DIR}/uploads'
# os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
CORS(app)

from src.controllers.chat_controller import chat_bp

# Register Blueprints
app.register_blueprint(chat_bp)

if __name__ == '__main__':
    app.run(debug=True)
