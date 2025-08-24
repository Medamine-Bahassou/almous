// app/page.tsx
"use client"

import { useRef, useState } from "react"
import Sandbox from "@/components/sandbox"
import { Sidebar } from "@/components/chat/Sidebar"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { Conversation, Message } from "@/lib/types"
import LatexEditor from "@/components/latex/latexEditor"

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        // Welcome message removed to match new chat behavior
      ],
      createdAt: new Date(),
    },
  ])
  const [currentConversationId, setCurrentConversationId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [model, setModel] = useState<string>("")
  const [provider, setProvider] = useState<string>("")

  const [thinkStreaming, setThinkStreaming] = useState<boolean>(false)

  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const messages = currentConversation?.messages || []
  const artifact = false

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setSidebarOpen(false)
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    setSidebarOpen(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleToggleTool = (toolId: string) => {
    setSelectedTools((prevSelectedTools) => {
      if (prevSelectedTools.includes(toolId)) {
        return prevSelectedTools.filter((id) => id !== toolId)
      } else {
        return [...prevSelectedTools, toolId]
      }
    })
  }

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading || !currentConversation) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
    }

    const updatedTitle =
      messages.length === 0 && currentConversation.title === "New Chat"
        ? input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : "")
        : currentConversation.title

    // Add user message to the conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage], title: updatedTitle }
          : conv,
      ),
    )

    setInput("")
    setSelectedFiles([])
    setIsLoading(true)

    // This ID will be the base for all parts of this specific assistant response
    const assistantResponseId = (Date.now() + 1).toString()

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider,
          model: model,
          message: userMessage.content,
          attachment: selectedFiles.map((file) => file.name),
          tools: selectedTools,
          stream: true,
        }),
      })

      if (!response.body) {
        throw new Error("Response body is null")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || "" // Keep the last, possibly incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataContent = line.substring(5).trim()
            if (!dataContent) continue

            try {
              const parsed = JSON.parse(dataContent)

              if (parsed.status) {
                console.log("Backend status:", parsed.status)
                continue
              }

              const chunkText = typeof parsed.text === "string" ? parsed.text : typeof parsed === "string" ? parsed : ""
              if (!chunkText) continue

              const chunkType = parsed.type === "reasoning" ? "reasoning" : "text"

              const messageId = `${assistantResponseId}-${chunkType}`

              setConversations((prev) =>
                prev.map((conv) => {
                  if (conv.id !== currentConversationId) return conv

                  const existingMessage = conv.messages.find((m) => m.id === messageId)

                  if (existingMessage) {
                    // Append content to the existing message part
                    return {
                      ...conv,
                      messages: conv.messages.map((m) =>
                        m.id === messageId ? { ...m, content: m.content + chunkText } : m,
                      ),
                    }
                  } else {
                    // Create a new message part
                    const newMessage: Message = {
                      id: messageId,
                      content: chunkText,
                      role: "assistant",
                      timestamp: new Date(),
                      type: chunkType,
                      isStreaming: true,
                    }
                    return {
                      ...conv,
                      messages: [...conv.messages, newMessage],
                    }
                  }
                }),
              )
            } catch (e) {
              console.warn("Could not parse SSE JSON chunk:", dataContent, e)
            }
          }
        }
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== currentConversationId) return conv
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id.startsWith(assistantResponseId)
                ? { ...m, isStreaming: false } // ✅ stop streaming once complete
                : m,
            ),
          }
        }),
      )


    } catch (error) {
      console.error("Error fetching chat response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I ran into an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background ">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId || ""}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
      />

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className={`flex-1 ${artifact || selectedTools?.includes("latex") ? "grid grid-cols-2" : "grid grid-cols-1"} min-w-0 min-h-0`}>
        <div className="flex flex-col min-w-0 min-h-0 border-r">
          <ChatHeader
            title={currentConversation?.title || "Chat"}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {messages.length === 0 ? (
            <div className=" flex flex-col flex-1 items-center justify-center">
              <h1 className="text-3xl pb-3">What's on your mind today? </h1>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isLoading={isLoading}
                selectedFiles={selectedFiles}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
                selectedTools={selectedTools}
                onToggleTool={handleToggleTool}
                setModel={setModel}
                setProvider={setProvider}
              />
            </div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isLoading={isLoading}
                selectedFiles={selectedFiles}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
                selectedTools={selectedTools}
                onToggleTool={handleToggleTool}
                setModel={setModel}
                setProvider={setProvider}
              />
            </>
          )}
        </div>

        {artifact && (
          <div className={` flex flex-col min-w-0 min-h-0 p-4 bg-muted/20`}>
            <Sandbox />
          </div>
        )}

        {selectedTools.includes("latex") && (
          <div className="p-4 ">
            <LatexEditor />
          </div>
        )}
      </main>
    </div>
  )
}