from flask import Response, stream_with_context, jsonify
import json 
import re 

memory = []

def get_memory():
    return memory

def append_memory(role, content):
    global memory
    # memory.append(role +": "+ content)
    memory.append({"role":role, "content": content})


def chat_completion(provider, model, messages, stream=False):
    """
    Handles chat completions, supporting streaming with reasoning/text part detection.
    """
    if not messages:
        return jsonify({"error": "No message provided"}), 400

    # --- Streaming Logic ---
    if stream:
        def generate():
            full_response = ""
            is_reasoning = False
            
            try:
                # Stream directly from the provider
                for chunk in provider.completion(model=model, messages=messages, stream=True):
                    if not chunk:
                        continue
                    
                    # Accumulate the full response for memory
                    full_response += chunk

                    # Process the chunk for tags
                    processing_chunk = chunk
                    while processing_chunk:
                        if is_reasoning:
                            # We are inside a <think> block, looking for </think>
                            end_tag_match = re.search(r'</think>', processing_chunk)
                            if end_tag_match:
                                # Found the end tag
                                end_index = end_tag_match.start()
                                reasoning_part = processing_chunk[:end_index]
                                
                                # Yield the reasoning part
                                if reasoning_part:
                                    yield f"data: {json.dumps({'type': 'reasoning', 'text': reasoning_part})}\n\n"

                                # Update state and remaining chunk
                                is_reasoning = False
                                processing_chunk = processing_chunk[end_tag_match.end():]
                            else:
                                # No end tag in this chunk, so the whole thing is reasoning
                                yield f"data: {json.dumps({'type': 'reasoning', 'text': processing_chunk})}\n\n"
                                processing_chunk = "" # Done with this chunk
                        else:
                            # We are outside a <think> block, looking for <think>
                            start_tag_match = re.search(r'<think>', processing_chunk)
                            if start_tag_match:
                                # Found the start tag
                                start_index = start_tag_match.start()
                                text_part = processing_chunk[:start_index]

                                # Yield the text part before the tag
                                if text_part:
                                    yield f"data: {json.dumps({'type': 'text', 'text': text_part})}\n\n"
                                
                                # Update state and remaining chunk
                                is_reasoning = True
                                processing_chunk = processing_chunk[start_tag_match.end():]
                            else:
                                # No start tag in this chunk, so the whole thing is text
                                yield f"data: {json.dumps({'type': 'text', 'text': processing_chunk})}\n\n"
                                processing_chunk = "" # Done with this chunk

                # After the stream is finished, save the complete response to memory
                # Ensure you have the user's message in the last entry for context
                last_user_message = next((m['content'] for m in reversed(messages) if m['role'] == 'user'), "")
                append_memory("user", f"User: {last_user_message}\n Ai: ")
                append_memory("assistant", full_response)

            except Exception as e:
                error_payload = json.dumps({'type': 'text', 'text': f'[ERROR] An error occurred: {str(e)}'})
                yield f"data: {error_payload}\n\n"

        return generate()

    # --- Non-Streaming Logic ---
    else:
        try:
            full_response = provider.completion(model=model, messages=messages, stream=False)
            
            # Save to memory
            last_user_message = next((m['content'] for m in reversed(messages) if m['role'] == 'user'), "")
            append_memory("user", f"User: {last_user_message}\n Ai: ")
            append_memory("assistant", full_response)
            
            # For non-streaming, you can just return the full text.
            # The frontend doesn't need parts if it's not streaming.
            return full_response
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500


# def chat_completion(provider, model, messages, stream=False):
#     # check if the message exist
#     if not messages:
#         return jsonify({"error": "No message provided"}), 400



#     # completion process if stream or not
#     if stream :
#         def generate():
#             try:
#                 full_response = ""
#                 # 🔁 Use the passed provider to call the streaming completion
#                 for chunk in provider.completion(model=model, messages=messages, stream=True):
#                     full_response += chunk
#                     yield chunk
                
#                 # save memory
#                 append_memory("user", "User: " + messages[-1].get("content") + "\n Ai: " )
#                 append_memory("assistant", full_response)
#                 print(full_response)
#             except Exception as e:
#                 yield f"[ERROR] {str(e)}"

#         return generate()  
#     #   return Response(stream_with_context(generate()), content_type='text/plain')
#     else :
#       try:
#           full_response = provider.completion(model=model, messages=messages, stream=False)
#           append_memory("user", "User: " + messages[-1].get("content") + "\n Ai: " )
#           append_memory("assistant", full_response)
#           return full_response
#         # return jsonify({"response": full_response})
#       except Exception as e:
#           return jsonify({"error": str(e)}), 500


def chat_completion_temp(provider, model, messages, stream=False):
    # check if the message exist
    if not messages:
        return jsonify({"error": "No message provided"}), 400

    
    # completion process if stream or not
    if stream :
        def generate():
            try:
                full_response = ""
                # 🔁 Use the passed provider to call the streaming completion
                for chunk in provider.completion(model=model, messages=messages, stream=True):
                    full_response += chunk
                    yield chunk
                
                # save memory
                print(full_response)
            except Exception as e:
                yield f"[ERROR] {str(e)}"

        return generate()  
    #   return Response(stream_with_context(generate()), content_type='text/plain')
    else :
      try:
          full_response = provider.completion(model=model, messages=messages, stream=False)
          return full_response
        # return jsonify({"response": full_response})
      except Exception as e:
          return jsonify({"error": str(e)}), 500


