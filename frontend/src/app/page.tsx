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


// No longer need dummyResponses
// import { dummyResponses } from "@/data/dummy-data"

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        // {
        //   id: "1",
        //   content: "Hello! I'm an AI assistant. How can I help you today?",
        //   role: "assistant",
        //   timestamp: new Date(),
        // },
      ],
      createdAt: new Date(),
    },
  ])
  const [currentConversationId, setCurrentConversationId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([]); // State for the selected tools

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const messages = currentConversation?.messages || []
  const artifact = false;

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        // {
        //   id: Date.now().toString(),
        //   content: "Hello! I'm an AI assistant. How can I help you today?",
        //   role: "assistant",
        //   timestamp: new Date(),
        // },
      ],
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
        // If tool is already selected, remove it
        return prevSelectedTools.filter((id) => id !== toolId);
      } else {
        // If tool is not selected, add it
        return [...prevSelectedTools, toolId];
      }
    });
  };


  // --- NEW handleSend FUNCTION ---
  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading || !currentConversation) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
      // Your backend expects file names, not the file objects themselves
      // A real app would first upload the file, get a URL/ID, and send that.
      // For this example, we'll send the file names.
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
    };

    // Add a placeholder for the assistant's response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessagePlaceholder: Message = {
      id: assistantMessageId,
      content: "", // Start with empty content
      role: "assistant",
      timestamp: new Date(),
    };

    const updatedTitle =
      currentConversation.messages.length === 1 && currentConversation.title === "New Chat"
        ? input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : "")
        : currentConversation.title;

    // Add both the user message and the assistant placeholder to the conversation
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessagePlaceholder], title: updatedTitle }
          : conv
      )
    );

    setInput("");
    setSelectedFiles([]);

    try {
      // NOTE: Replace '/api/chat' with your actual backend URL if it's different.
      // You may need to configure a proxy in next.config.js for local development.
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: "pollination",
          model: "openai", // Or get this from state
          message: userMessage.content,
          attachment: selectedFiles.map(file => file.name), // Sending file names
          tools: selectedTools, // Send selected tools
          stream: true
        }),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        lines.forEach(line => {
          if (line.startsWith('data:')) {
            const dataContent = line.substring(5).trim();
            try {
              const parsed = JSON.parse(dataContent);

              // Handle status messages from the backend
              if (parsed.status) {
                console.log("Backend status:", parsed.status);
                // You could display this status to the user in a toast or temporarily
                // in the message bubble itself.
              } else {
                // It's a content chunk
                if (typeof parsed === "object" && parsed.content) {
                  appendContentToAssistantMessage(assistantMessageId, parsed.content);
                } else if (typeof parsed === "string") {
                  appendContentToAssistantMessage(assistantMessageId, parsed);
                }
              }
            } catch (e) {
              // If JSON.parse fails, it's likely a raw string chunk
              appendContentToAssistantMessage(assistantMessageId, dataContent);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      // Update the assistant message to show an error
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: "Sorry, I ran into an error. Please try again." }
                  : msg
              ),
            };
          }
          return conv;
        })
      );
    } finally {
      setIsLoading(false);
      setSelectedTools([]); // Reset tools after sending
    }
  };

  const appendContentToAssistantMessage = (messageId: string, chunk: string) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            ),
          };
        }
        return conv;
      })
    );
  };
  const [latexInput, setLatexInput] = useState(
    `Here is some text, and here is the code:

\`\`\`latex
\\documentclass{article}

\\begin{document}

Hello, this is a preview from my app!

$$ E = mc^2 $$

\\end{document}
\`\`\``
  )
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
            // ✅ Center input when no messages
            <>
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
                />
              </div>
            </>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div className="border-t" />
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
              />
            </>

          )}
        </div>

        {
          artifact && (
            <div className={` flex flex-col min-w-0 min-h-0 p-4 bg-muted/20`}>
              <Sandbox />
            </div>
          )
        }


        {
          selectedTools.includes("latex") && (
            <div className="p-4 ">
              <LatexEditor />
            </div>
          )
        }
      </main>
    </div>
  )
}