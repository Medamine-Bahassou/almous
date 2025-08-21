# Almous - Your Extensible AI Chat 

<div align="center" style="border-radius: 30px; overflow: hidden; "  >
  <img src="./assets/image.png" alt="logo" /> 
</div>


Almous is a powerful and flexible AI backend designed to serve as the brain for advanced chat applications. It goes beyond simple Q&A by integrating multiple Large Language Model (LLM) providers, Retrieval-Augmented Generation (RAG) for document interaction, and an autonomous web search agent to provide answers based on real-time information from the internet.

Built with Python and Flask, Almous is modular, easy to extend, and ready to power your next-generation AI assistant.

## ✨ Core Features

-   **Multi-Provider LLM Integration**: Seamlessly switch between different LLM providers.
    -   🚀 **Groq**: For incredibly fast inference speeds.
    -   🧠 **A4F (AI4Finance)**: For access to specialized models.
    -   🎨 **Pollinations.ai**: For creative and diverse model options.
-   **Retrieval-Augmented Generation (RAG)**: Chat with your documents.
    -   Upload files (PDFs, Markdown, etc.) via a simple API endpoint.
    -   Almous processes, chunks, and indexes the content in a ChromaDB vector store.
    -   Ask questions and get answers sourced directly from your documents.
-   **Autonomous Search Agent**: Get answers from the web.
    -   When activated, the AI first generates relevant search queries based on your prompt.
    -   It uses DuckDuckGo to perform searches and crawls the top results.
    -   The scraped web content is then used as a knowledge base to generate a comprehensive, up-to-date answer.
-   **Real-time Streaming**: Responses are streamed word-by-word using Server-Sent Events (SSE) for a responsive user experience.
-   **Modular & Extensible Architecture**: The codebase is organized into controllers, services, providers, and tools, making it easy to add new features, LLM providers, or tools.
-   **Conversation Memory**: Remembers the last few turns of the conversation to maintain context.

## 🛠️ Technology Stack

| Category                 | Technology                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Backend Framework**    | [Flask](https://flask.palletsprojects.com/)                                                                 |
| **LLM Providers**        | [Groq](https://groq.com/), [A4F](https://a4f.com/), [Pollinations.ai](https://pollinations.ai/)                 |
| **RAG & VectorDB**       | [LangChain](https://www.langchain.com/), [ChromaDB](https://www.trychroma.com/)                               |
| **Embedding Models**     | [Jina AI](https://jina.ai/embeddings/), [Google Gemini](https://ai.google.dev/) (available)                  |
| **Web Search & Crawling**| `ddgs` (DuckDuckGo Search), `crawl4ai`                                                                      |
| **Data Validation**      | [Pydantic](https://docs.pydantic.dev/)                                                                      |
| **Document Processing**  | `markitdown` (converts various file types to Markdown)                                                      |
| **Environment Mgmt**     | `python-dotenv`                                                                                             |

## 🚀 Getting Started

Follow these instructions to get the Almous backend up and running on your local machine.

### Prerequisites

-   Python 3.10+
-   `pip` package manager
-   Git

### 1. Clone the Repository

```bash
git clone https://github.com/Medamine-Bahassou/almous.git
cd almous/backend
```

### 2. Set Up a Virtual Environment

It's highly recommended to use a virtual environment to manage dependencies.

```bash
# Create the virtual environment
python -m venv venv

# Activate it
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies


**Installation command**:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

You'll need API keys for the different services Almous uses.

1.  Create a file named `.env` in the `backend` directory.
2.  Add your API keys to this file.

**`.env` file example**:
```
# Groq API Key (https://console.groq.com/keys)
GROQ_API_KEY="gsk_..."

# Pollinations API Key (https://pollinations.ai/)
POLLINATIONS_API_KEY="..."

# A4F API Key (https://a4f.com/)
A4F_API_KEY="..."

# Jina AI API Key for Embeddings (https://jina.ai/embeddings/)
JINA_API_KEY="jina_..."
```

### 5. Run the Application

Once the setup is complete, you can start the Flask server.

```bash
flask --app src/app.py run
```
The server will start, typically at `http://127.0.0.1:5000`.

##  API Endpoints

### 1. Chat Endpoint

This is the main endpoint for all interactions. It supports standard chat, RAG, and the search agent.

-   **URL**: `/api/chat`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Response**: `text/event-stream` (streaming)

**Request Body**:
```json
{
  "provider": "groq",
  "model": "llama3-70b-8192",
  "message": "What is Retrieval-Augmented Generation?",
  "system": "You are a helpful AI assistant.",
  "attachment": [],
  "tools": [],
  "stream": true
}
```

**Field Descriptions**:
  -   `provider` (string, required): `groq`, `a4f`, or `pollination`.
-   `model` (string, required): The specific model ID for the chosen provider.
-   `message` (string, required): The user's prompt.
-   `system` (string, optional): A system prompt to guide the AI's behavior.
-   `attachment` (list, optional): A list of file paths (currently uses the server-side path of the last uploaded file). Leave as `[]` for non-RAG chat.
-   `tools` (list, optional): A list of tools to activate. Use `["search"]` to enable the web search agent.
-   `stream` (boolean, optional): Should always be `true` for the streaming endpoint.

### 2. File Upload Endpoint

Use this endpoint to upload a document for RAG.

-   **URL**: `/api/upload`
-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`

**Request Body**:
-   A form field named `file` containing the document you want to upload.

**Example `curl` command**:
```bash
curl -X POST -F "file=@/path/to/your/document.pdf" http://127.0.0.1:5000/api/upload
```
> **Note**: The current implementation clears the upload directory and saves only the latest file. This is suitable for single-user, single-document sessions.

### 3. Get Models Endpoint

Fetch the list of available models for a specific provider.

-   **URL**: `/api/models`
-   **Method**: `GET`
-   **Query Parameters**: `provider` (e.g., `/api/models?provider=groq`)

## 💡 How It Works

### Standard Chat Flow
1.  A request hits the `/api/chat` endpoint with no tools or attachments.
2.  The `chat_controller` validates the request using `ChatRequestDTO`.
3.  It calls `chat_service_completion`, passing the provider, model, and messages.
4.  The service retrieves conversation memory and prepares the final prompt.
5.  It invokes the `completion` method of the selected provider (`GroqProvider`, etc.).
6.  The provider makes the API call and streams the response back to the client.

### RAG Flow (Chat with Documents)
1.  The user first uploads a file to the `/api/upload` endpoint.
2.  The server saves the file in the `tools/rag/data` directory.
3.  The user sends a prompt to `/api/chat`. The frontend should indicate which file to use.
4.  The controller detects an attachment and calls `chat_rag_service_completion`.
5.  This service triggers `generate_data_store` from `build_database.py`.
    -   The document is converted to Markdown (`markitdown`).
    -   The text is cleaned, split into chunks (`LangChain`).
    -   The chunks are converted to vector embeddings (`JinaEmbeddings`).
    -   The embeddings are stored in a temporary ChromaDB instance.
6.  The user's query is used to perform a similarity search in the ChromaDB.
7.  The most relevant chunks are retrieved and inserted into a prompt template as context.
8.  This final, context-rich prompt is sent to the LLM to generate an answer.

### Search Agent Flow
1.  A request hits `/api/chat` with `tools: ["search"]`.
2.  The controller calls `search_agent_service_completion`.
3.  **Step 1 (Query Generation)**: The agent sends a request to the LLM with a specialized prompt, asking it to generate 1-2 concise search queries based on the user's message.
4.  **Step 2 (Search & Crawl)**: The agent parses the search queries and uses `ddgs` to get search results from DuckDuckGo. It then uses `crawl4ai` to scrape the content from the top links.
5.  **Step 3 (Index & Query)**: The scraped web content is treated like a document. It's indexed into a temporary ChromaDB instance on-the-fly, just like in the RAG flow.
6.  **Step 4 (Answer Generation)**: The original user message is used to query this new web-sourced vector database, and the LLM generates a final answer based on the retrieved real-time information.

## 📁 Project Structure

```
almous/backend/
├── src/
│   ├── controllers/
│   │   └── chat_controller.py   # Flask routes and API logic
│   ├── dtos/
│   │   └── chat_dto.py          # Pydantic data transfer objects
│   ├── providers/
│   │   ├── embed/
│   │   │   ├── jina.py          # Jina AI embedding provider
│   │   │   └── gemini_embed.py  # Google Gemini embedding provider
│   │   ├── a4f.py               # A4F LLM provider
│   │   ├── global_completion.py # Main completion logic and memory
│   │   ├── groq.py              # Groq LLM provider
│   │   └── pollination.py       # Pollinations.ai LLM provider
│   ├── services/
│   │   └── chat_service.py      # Business logic for chat, RAG, and search
│   └── tools/
│       ├── rag/
│       │   ├── data/            # Uploaded files for RAG
│       │   ├── db/chroma/       # ChromaDB vector stores
│       │   ├── build_database.py# Logic for processing and indexing docs
│       │   └── query_data.py    # Logic for querying the vector store
│       └── search/
│           ├── crawl.py         # Web crawling logic
│           ├── search.py        # DuckDuckGo search logic
│           └── search_agent.py  # Orchestrates the search agent flow
└── .env                         # Environment variables (you create this)
```

## 📈 Future Improvements

-   [ ] **Persistent RAG Storage**: Implement a more robust system for managing multiple documents and persistent ChromaDB collections.
-   [ ] **Add More Tools**: Integrate other tools like a code interpreter or calculator.
-   [ ] **Enhanced Error Handling**: Improve error reporting and resilience.
-   [ ] **Unit & Integration Tests**: Add a testing suite to ensure code quality.
-   [ ] **Containerization**: Add a `Dockerfile` for easy deployment with Docker.
