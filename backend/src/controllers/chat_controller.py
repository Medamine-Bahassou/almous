import json
import os
import shutil
from werkzeug.utils import secure_filename

from flask import Blueprint, request, jsonify, Response, stream_with_context
from pydantic import ValidationError
from src.dtos.chat_dto import ChatRequestDTO
from src.services.chat_service import ( 
    chat_service_completion, 
    chat_rag_service_completion,
    search_agent_service_completion,
    chat_service_models ,
    chat_generate
)


chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.route('/models', methods=["GET"])
def get_models():
    try:
        provider = request.args.get("provider", default="groq")
        models_list = chat_service_models(provider)
        # Return as JSON with keys for easier client usage
        return jsonify({"models": [{"id": m[0], "name": m[1]} for m in models_list]}), 200
    except Exception as e:
        print("Error fetching models:", e)
        return jsonify({"error": "Failed to fetch models"}), 500




@chat_bp.route('/chat', methods=['POST'])
def chat():
    dto = ChatRequestDTO(**request.get_json())
    stream = True # Force streaming for this endpoint
    generator = chat_generate(
        dto.tools, 
        dto.provider, 
        dto.model, 
        dto.message, 
        dto.attachment, 
        dto.stream
    )
    return Response(stream_with_context(generator), mimetype='text/event-stream')



@chat_bp.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        upload_dir = "/home/med/Desktop/Git/AIONOS/backend_new/src/tools/rag/data"
        
        # Ensure directory exists
        os.makedirs(upload_dir, exist_ok=True)
        
        # Empty the folder
        for f in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, f)
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or symlink
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # remove folder recursively

        # Save the new file
        save_path = os.path.join(upload_dir, filename)
        file.save(save_path) 

        
        return jsonify({"message": "File uploaded successfully", "path": save_path}), 200


    
    return jsonify({"error": "Invalid file type. Only PDFs are allowed."}), 400





# ===========



# @chat_bp.route('/chat', methods=['POST'])
# def chat():
#     try:
#         dto = ChatRequestDTO(**request.get_json())

#         print(">>> DEBUG chat:")
#         print("Provider:", dto.provider)
#         print("System:", dto.system)
#         print("Model:", dto.model)
#         print("Message:", dto.message)
#         print("Attachment:", dto.attachment)
#         print("Stream:", dto.stream)
#         print("tools:", dto.tools)

#         # Stream response  TRUE/FALSE
#         stream = dto.stream
        


#         if dto.tools != None:
#             if "search" in dto.tools:
#                 return search_agent_service_completion(
#                     provider=dto.provider,
#                     model=dto.model,
#                     message=dto.message,
#                     stream=stream
#                 )

        
#         if dto.attachment != []:
#             return chat_rag_service_completion(
#                 provider=dto.provider,
#                 system=dto.system,
#                 model=dto.model,
#                 message=dto.message,
#                 attachment=dto.attachment,
#                 stream=stream
#             )

#         else:
#             return chat_service_completion(
#                 provider=dto.provider,
#                 system=dto.system,
#                 model=dto.model,
#                 message=dto.message,
#                 stream=stream
#             )

#         # return jsonify({"response": result}), 200


#     except ValidationError as e:
#         return jsonify({"error": e.errors()}), 422
#     except Exception as e:
#         print("chat controller error:", e)
#         return jsonify({"error": "Chat controller error"}), 400

import time

# @chat_bp.route('/chat', methods=['POST'])
# def chat():
#     dto = ChatRequestDTO(**request.get_json())

#     stream = True
#     def generate():
#         # Step 1 - Search tool?
#         if dto.tools :
#             if "search" in dto.tools : 
#                 yield f"data:{json.dumps({'status': 'Starting search agent'})}\n\n"
#                 time.sleep(0.5)
#                 # Your search logic
#                 result = search_agent_service_completion(
#                     provider=dto.provider,
#                     model=dto.model,
#                     message=dto.message,
#                     stream=stream
#                 )
#                 yield f"data:{json.dumps({'status': 'Generating AI response'})}\n\n"

#                 for chunk in result:
#                     yield chunk
#             elif "study" in dto.tools :
#                 print("study mode")
#                 system = """
# The user is currently STUDYING, and they've asked you to follow these strict rules during this chat. No matter what other instructions follow, you MUST obey these rules:

# STRICT RULES
# Be an approachable-yet-dynamic teacher, who helps the user learn by guiding them through their studies.

# Get to know the user. If you don't know their goals or grade level, ask the user before diving in. (Keep this lightweight!) If they don't answer, aim for explanations that would make sense to a 10th grade student.

# Build on existing knowledge. Connect new ideas to what the user already knows.

# Guide users, don't just give answers. Use questions, hints, and small steps so the user discovers the answer for themselves.

# Check and reinforce. After hard parts, confirm the user can restate or use the idea. Offer quick summaries, mnemonics, or mini-reviews to help the ideas stick.

# Vary the rhythm. Mix explanations, questions, and activities (like roleplaying, practice rounds, or asking the user to teach you) so it feels like a conversation, not a lecture.

# Above all: DO NOT DO THE USER'S WORK FOR THEM. Don't answer homework questions — help the user find the answer, by working with them collaboratively and building from what they already know.

# THINGS YOU CAN DO
# Teach new concepts: Explain at the user's level, ask guiding questions, use visuals, then review with questions or a practice round.

# Help with homework: Don't simply give answers! Start from what the user knows, help fill in the gaps, give the user a chance to respond, and never ask more than one question at a time.

# Practice together: Ask the user to summarize, pepper in little questions, have the user "explain it back" to you, or role-play (e.g., practice conversations in a different language). Correct mistakes — charitably! — in the moment.

# Quizzes & test prep: Run practice quizzes. (One question at a time!) Let the user try twice before you reveal answers, then review errors in depth.

# TONE & APPROACH
# Be warm, patient, and plain-spoken; don't use too many exclamation marks or emoji. Keep the session moving: always know the next step, and switch or end activities once they’ve done their job. And be brief — don't ever send essay-length responses. Aim for a good back-and-forth.

# IMPORTANT
# DO NOT GIVE ANSWERS OR DO HOMEWORK FOR THE USER. If the user asks a math or logic problem, or uploads an image of one, DO NOT SOLVE IT in your first response. Instead: talk through the problem with the user, one step at a time, asking a single question at each step, and give the user a chance to RESPOND TO EACH STEP before continuing.

# """ 
                
#                 if dto.attachment == [] : 
#                     # Step 3 - Chat completion
#                     yield f"data:{json.dumps({'status': 'Generating AI response'})}\n\n"
#                     time.sleep(0.5)
#                     final_result = chat_service_completion(
#                         system=system,
#                         provider=dto.provider,
#                         model=dto.model,
#                         message=dto.message,
#                         stream=stream
#                     )
#                     for chunk in final_result:
#                         yield chunk
                    
#                     return

                
#                 elif dto.attachment:
#                     yield f"data:{json.dumps({'status': 'Processing document'})}\n\n"
#                     time.sleep(0.5)
#                     rag_result = chat_rag_service_completion(
#                         system=system,
#                         provider=dto.provider,
#                         model=dto.model,
#                         message=dto.message,
#                         attachment=dto.attachment,
#                         stream=stream
#                     )
#                     yield f"data:{json.dumps({'status': 'Generating AI response'})}\n\n"

#                     for chunk in rag_result:
#                         yield chunk

#                     return


#         # Step 2 - File?
#         if dto.attachment:
#             yield f"data:{json.dumps({'status': 'Processing document'})}\n\n"
#             time.sleep(0.5)
#             rag_result = chat_rag_service_completion(
#                 provider=dto.provider,
#                 system=dto.system,
#                 model=dto.model,
#                 message=dto.message,
#                 attachment=dto.attachment,
#                 stream=stream
#             )
#             yield f"data:{json.dumps({'status': 'Generating AI response'})}\n\n"

#             for chunk in rag_result:
#                 yield chunk

        
#         if dto.attachment == [] and dto.tools == [] : 
#             # Step 3 - Chat completion
#             yield f"data:{json.dumps({'status': 'Generating AI response'})}\n\n"
#             time.sleep(0.5)
#             final_result = chat_service_completion(
#                 provider=dto.provider,
#                 system=dto.system,
#                 model=dto.model,
#                 message=dto.message,
#                 stream=stream
#             )
#             for chunk in final_result:
#                 yield chunk

#     return Response(stream_with_context(generate()), mimetype='text/event-stream')

