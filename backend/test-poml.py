from poml import poml

system = poml(
    markup="/home/med/Desktop/Git/almous/backend/prompts/prompt-input.poml",
    format="openai_chat",
    context={"input_message": "message", "memory":"de"}
  )

for i in range(len(system.get("messages"))):
  res = system.get("messages")[i].get("content")
  print(res)

# print(system.get("messages")[0])