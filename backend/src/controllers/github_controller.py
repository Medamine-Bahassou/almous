from flask import Blueprint, request, jsonify, Response, stream_with_context
from src.dtos.github_dto import GithubRequestDTO

from src.services.github_service import (
  chat_github_repo_service
)

github_bp = Blueprint('github', __name__, url_prefix='/api')


@github_bp.route('/readme-gen', methods=["POST"])
def scrap_repo():

  dto = GithubRequestDTO(**request.get_json())



  return chat_github_repo_service(
    repo_url=dto.repo_url,
    provider=dto.provider,
    model=dto.model,
    stream=True,
  )