from flask import Response, stream_with_context, jsonify

memory = []

def get_memory():
    return memory

def append_memory(role, content):
    global memory
    # memory.append(role +": "+ content)
    memory.append({"role":role, "content": content})

def chat_completion(provider, model, messages, stream=False):
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
                append_memory("user", "User: " + messages[-1].get("content") + "\n Ai: " )
                append_memory("assistant", full_response)
                print(full_response)
            except Exception as e:
                yield f"[ERROR] {str(e)}"

        return generate()  
    #   return Response(stream_with_context(generate()), content_type='text/plain')
    else :
      try:
          full_response = provider.completion(model=model, messages=messages, stream=False)
          append_memory("user", "User: " + messages[-1].get("content") + "\n Ai: " )
          append_memory("assistant", full_response)
          return full_response
        # return jsonify({"response": full_response})
      except Exception as e:
          return jsonify({"error": str(e)}), 500


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


