"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Menu,
  Sun,
  Moon,
  Paperclip,
  X,
  FileText,
  SlidersHorizontal,
  Microscope,
  Box,
  ArrowUp,
  ChevronDown,
  File,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Sandbox from "@/components/sandbox"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ui/shadcn-io/ai/reasoning"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "text" | "reasoning"
  files?: File[]
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        {
          id: "1",
          content: "Hello! I'm an AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ])
  const [currentConversationId, setCurrentConversationId] = useState("1")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [artifact, setArtifact] = useState(false) // State for the right panel
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const messages = currentConversation?.messages || []

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }
  useEffect(scrollToBottom, [messages])

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [
        {
          id: Date.now().toString(),
          content: "Hello! I'm an AI assistant. How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setSidebarOpen(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading || !currentConversation) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim() || (selectedFiles.length > 0 ? `Uploaded ${selectedFiles.length} file(s)` : ""),
      role: "user",
      timestamp: new Date(),
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
    }

    const updatedTitle =
      currentConversation.messages.length === 1 && currentConversation.title === "New Chat"
        ? input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : "")
        : currentConversation.title

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

    // ---- STREAMING FROM BACKEND ----
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...currentConversation.messages.map((m) => ({
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
          { role: "user", parts: [{ type: "text", text: userMessage.content }] },
        ],
      }),
    })

    if (!res.body) {
      setIsLoading(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split("\n\n")
      buffer = parts.pop() || ""

      for (const part of parts) {
        if (!part.startsWith("data:")) continue
        const payload = part.replace("data: ", "")
        if (payload === "[DONE]") {
          setIsLoading(false)
          return
        }

        try {
          const event = JSON.parse(payload)
          const chunk = event.parts[0]
          const backendMessageId = event.id
          const chunkType = chunk.type || "text"
          const messageId = `${backendMessageId}-${chunkType}`

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id !== currentConversationId) {
                return conv
              }
              const existingMessage = conv.messages.find((m) => m.id === messageId)
              if (existingMessage) {
                return {
                  ...conv,
                  messages: conv.messages.map((m) =>
                    m.id === messageId ? { ...m, content: m.content + chunk.text } : m
                  ),
                }
              } else {
                const newMessage: Message = {
                  id: messageId,
                  content: chunk.text,
                  role: "assistant",
                  type: chunkType,
                  timestamp: new Date(),
                }
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                }
              }
            }),
          )
        } catch (err) {
          console.error("Parse error", err, payload)
        }
      }
    }
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          <div className="border-b mt-1">
            <div className="mx-4">
              <img
                src={"https://mohamedamine-bahassou.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo1.5a4b53ad.png&w=1080&q=75"}
                alt="logo"
                width={50}
              />
            </div>
          </div>
          <div className="p-4 border-b flex flex-col gap-2">
            <Button onClick={handleNewChat} variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Link href={"/readme"}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <File className="h-4 w-4" />
                README Generator
              </Button>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  onClick={() => {
                    setCurrentConversationId(conversation.id)
                    setSidebarOpen(false)
                  }}
                  variant={conversation.id === currentConversationId ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">{conversation.title}</div>
                    <div className="text-xs text-muted-foreground">{conversation.createdAt.toLocaleDateString()}</div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className={`flex-1 ${artifact ? "grid grid-cols-2" : "grid grid-cols-1"} min-w-0 min-h-0`}>
        <div className="flex flex-col min-w-0 min-h-0 border-r">
          <header className="border-b bg-background/80 backdrop-blur-sm p-4 flex items-center gap-3">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium flex-1 text-center">{currentConversation?.title || "ChatGPT"}</h1>
          </header>
          <div className="flex-1 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => {
                  if (message.role === "user") {
                    return (
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[80%] space-y-2">
                          {message.files && message.files.length > 0 && (
                            <div className="space-y-2">
                              {message.files.map((file, idx) => (
                                <Card key={idx} className="p-3 bg-muted/30 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm truncate">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                </Card>
                              ))}
                            </div>
                          )}
                          <Card className="p-4 bg-neutral-100 dark:bg-neutral-900 border-none shadow-none">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </Card>
                        </div>
                      </div>
                    )
                  }
                  if (message.role === "assistant") {
                    if (message.type === "reasoning" && message.content) {
                      return (
                        <Reasoning key={message.id} isStreaming={isLoading} defaultOpen={false}>
                          <ReasoningTrigger />
                          <ReasoningContent>{message.content}</ReasoningContent>
                        </Reasoning>
                      )
                    }
                    if (message.type === "text" || message.type === undefined) {
                      return (
                        <div key={message.id} className="flex justify-start">
                          <Card className="p-4 border-none shadow-none max-w-[80%]">
                            <Response>{message.content}</Response>
                          </Card>
                        </div>
                      )
                    }
                  }
                  return null
                })}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <Card className="p-4 bg-muted">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <footer className="border-t bg-background/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              {selectedFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      <FileText className="h-3 w-3" />
                      <span className="text-xs truncate max-w-32">{file.name}</span>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="relative flex flex-col items-center w-full p-2 space-x-2 bg-zinc-100 dark:bg-zinc-800 rounded-3xl">
                <div className="w-full">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Anything..."
                    className="flex-1 w-full pb-2 px-4 bg-transparent border-none outline-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground resize-none overflow-auto max-h-[200px]"
                    disabled={isLoading}
                    rows={1}
                    ref={textareaRef}
                  />
                </div>
                <div className="w-full flex justify-between">
                  <div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                    <Button variant="secondary" className="flex-shrink-0 gap-2 px-3 text-sm rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600">
                      <Microscope className="w-4 h-4" />
                      Researcher
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" className="h-auto p-1 rounded-md">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">K2</span>
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0.5 rounded-sm">New</Badge>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                        <Box className="w-5 h-5" />
                      </Button>
                      <Button
                        onClick={handleSend}
                        disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                        size="icon"
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-black opacity-80 dark:bg-zinc-700 hover:opacity-100 hover:bg-black dark:hover:bg-zinc-600 disabled:opacity-50"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
              <p className="pt-2 text-xs text-center text-muted-foreground">AI can make mistakes. Consider checking important information.</p>
            </div>
          </footer>
        </div>
        <div className={` ${artifact ? "flex" : "hidden"} flex-col min-w-0 min-h-0 p-4 bg-muted/20`}>
          <Sandbox />
        </div>
      </main>
    </div>
  )
}