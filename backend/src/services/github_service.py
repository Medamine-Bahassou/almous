from poml import poml 

from src.tools.rag.query_data import (
  query_rag
)
from src.tools.github.scrap_github import ( 
  scrap_repo
)

from src.providers.pollination import PollinationsProvider
from src.providers.groq import GroqProvider
from src.providers.a4f import A4FProvider





def chat_github_repo_service(repo_url, provider, model, stream=False):

  prompt = """
You are a technical documentation expert. I will provide you with the contents of a codebase, and I need you to generate 
a comprehensive README.md file that will help developers understand and work with this project.

The README should include:
1. Project title and brief description
2. Key features
3. Technologies used
4. Prerequisites
5. Detailed step-by-step installation guide
6. Usage examples
7. Configuration (if applicable)
8. Project structure explanation
9. Contributing guidelines (if found in the codebase)
10. License information (if found in the codebase)

Important guidelines:
- Be specific and detailed in the installation steps
- Include any environment variables that need to be set
- List all dependencies that need to be installed
- If there are scripts in package.json or requirements.txt, explain their purposes
- If there are configuration files, explain their options
- Keep the tone professional but friendly
- Use proper markdown formatting
- Include usage examples for key features
- If the project has a CLI, include command examples
- Explain any error messages users might encounter

Please generate a comprehensive README.md based on this information.
"""

  data_rag_path = scrap_repo(repo_url)

  if(provider == "pollination"):
    provider1 = PollinationsProvider()
  elif (provider == "groq"):
    provider1 = GroqProvider()
  elif (provider == "a4f"):
    provider1 = A4FProvider()

  return query_rag(
    provider=provider1,
    model=model,
    message=prompt,
    memory="",
    stream=True,
    chroma_path=data_rag_path
  )