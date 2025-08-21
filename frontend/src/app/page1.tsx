"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import Image from "next/image"
import Link from "next/link"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Sandbox from "@/components/sandbox"
import { Response } from "@/components/ui/shadcn-io/ai/response";

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: File[]
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

const dummyResponses = [
  `
  # Title 
  Here's some code:
  
\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

  `,
  "That's an interesting question. Let me think about that...",
  "I understand what you're asking. Here's my perspective on that topic.",
]

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()

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

  const handleSend = () => {
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

    // Fake assistant response
    setTimeout(() => {
      const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)]
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: "assistant",
        timestamp: new Date(),
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId ? { ...conv, messages: [...conv.messages, assistantMessage] } : conv,
        ),
      )
      setIsLoading(false)
    }, 1200)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }


  const artifact = false;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // set to scrollHeight
    }
  }, [input]);

  return (
    <div className="flex h-screen bg-background">


      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">

          {/* LOGO */}
          <div className="border-b mt-1">
            <div className="mx-4">

              <img
                src={"https://mohamedamine-bahassou.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo1.5a4b53ad.png&w=1080&q=75"}
                alt="logo"
                width={50}
              />
            </div>

          </div>

          {/* Buttons */}
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

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Chat */}
      <main className={`flex-1 ${artifact ? "grid grid-cols-2" : "grid grid-cols-1"}  min-w-0 min-h-0`}>



        <div className="flex flex-col min-w-0 min-h-0 border-r">

          {/* Header */}
          <header className="border-b bg-background/80 backdrop-blur-sm p-4 flex items-center gap-3">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="sm" className="lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium flex-1 text-center">{currentConversation?.title || "ChatGPT"}</h1>
          </header>


          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start "}`}>
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
                      <Card
                        className={`p-4 ${message.role === "user"
                          ? "bg-neutral-100 dark:bg-neutral-900 border-none shadow-none  "
                          : " border-none shadow-none w-2xl  "
                          }`}
                      >
                        {/* <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p> */}
                        <Response>{message.content}</Response>

                      </Card>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* --- UPDATED INPUT SECTION --- */}
          <footer className="border-t bg-background/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              {/* File preview row */}
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

              {/* Input container */}
              <div className="relative flex flex-col items-center w-full p-2 space-x-2 bg-zinc-100 dark:bg-zinc-800 rounded-3xl">

                <div className="w-full">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask Anything..."
                    className="flex-1 w-full pb-2 px-4 bg-transparent border-none outline-0 shadow-none
  focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground resize-none overflow-auto max-h-[200px] "
                    disabled={isLoading}
                    rows={1} // start with 1 row
                    ref={textareaRef}
                  />


                </div>

                <div className="w-full flex justify-between">

                  <div>

                    <Button variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-shrink-0 gap-2 px-3 text-sm rounded-full bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    >
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


        {/* RIGHT: Extra Column */}
        <div className={` ${artifact ? "flex" : "hidden"}   flex-col min-w-0 min-h-0 p-4 bg-muted/20`}>
          {/* <h2 className="text-lg font-semibold mb-4">Extra Panel</h2>
          <p className="text-sm text-muted-foreground">
            You can place tools, notes, search, or conversation details here.
          </p> */}
          <Sandbox/>
        </div>

      </main>

    </div>
  )
}