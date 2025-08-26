"use client"

import React, { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Paperclip, X, FileText, SlidersHorizontal, ChevronDown, Globe, BookOpenText, Sparkle, ArrowUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox"
import { fetchModels } from "@/lib/models"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  handleSend: () => void
  isLoading: boolean
  selectedFiles: File[]
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
  setTools: (tools: string[]) => void
  setModel: (modelId: string) => void
  setProvider: (providerId: string) => void
}

interface Tool {
  id: string
  name: string
  icon: React.ElementType // 👈 use ElementType so you can render it
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  isLoading,
  selectedFiles,
  handleFileUpload,
  removeFile,
  setTools,
  setModel,
  setProvider
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------
  // TOOLS
  // ---------------------------
  const tools: Tool[] = [
    { id: "search", name: "Search", icon: Globe },
    { id: "study", name: "Study mode", icon: BookOpenText },
    { id: "better", name: "Better mode", icon: Sparkle },
  ]

  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const handleToggleTool = (toolId: string) => {
    setSelectedTools(prev => {
      const newTools = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]

      setTools(newTools) // sync to parent
      return newTools
    })
  }

  // ---------------------------
  // PROVIDERS & MODELS
  // ---------------------------
  const providers = [
    { id: "pollination", name: "Pollination" },
    { id: "groq", name: "Groq" },
    { id: "a4f", name: "A4F" },
  ]

  const [selectedProvider, setSelectedProvider] = useState("")
  const [models, setModels] = useState<[string, string][]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedModelName, setSelectedModelName] = useState("")

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    setSelectedProvider(providers[0].id)
    setProvider(providers[0].id)
  }, [])

  useEffect(() => {
    async function loadModels() {
      try {
        const formatted = await fetchModels(selectedProvider)
        setModels(formatted)
        if (formatted.length) {
          setSelectedModel(formatted[0][0])
          setSelectedModelName(formatted[0][1])
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (selectedProvider) loadModels()
  }, [selectedProvider])

  // ---------------------------
  // SEND
  // ---------------------------
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <footer className="bg-background/80 backdrop-blur-sm w-full px-6">
      <div className="max-w-4xl mx-auto pt-2">

        {/* Selected tools badges */}
        {selectedTools.length > 0 && (
          <div className="ml-4 flex gap-2 overflow-x-auto pb-2">
            {selectedTools.map((toolId) => {
              const tool = tools.find(t => t.id === toolId)!
              const Icon = tool.icon
              return (
                <Badge key={tool.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  <Icon className="h-3 w-3" />
                  <span className="text-xs truncate max-w-32">{tool.name}</span>
                  <Button
                    onClick={() => handleToggleTool(tool.id)}
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        )}



        <label htmlFor="prompt">
          <div className="relative flex flex-col items-center w-full p-2 space-x-2 border glow bg-zinc-100 dark:bg-zinc-800 rounded-3xl">

            <div className="w-full">
              {/* Selected files badges */}
              {selectedFiles.length > 0 && (
                <div className=" ml-2 flex gap-2 overflow-x-auto pb-2">
                  {selectedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="  flex items-center gap-2 px-3 py-1">
                      <FileText className="h-3 w-3" />
                      <span className="text-xs truncate max-w-32">{file.name}</span>
                      <Button onClick={() => removeFile(index)} variant="ghost" size="sm" className="cursor-pointer h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              <textarea
                id="prompt"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask Anything..."
                className="flex-1 w-full py-2  px-4 bg-transparent border-none outline-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground resize-none overflow-auto max-h-[200px]"
                rows={1}
              />
            </div>

            <div className="w-full flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                {/* Tools */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="border-none rounded-full size-10 cursor-pointer" variant="outline">
                      <SlidersHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuGroup>
                      {tools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <DropdownMenuItem key={tool.id}
                            onSelect={(e) => {
                              e.preventDefault()
                              handleToggleTool(tool.id)
                            }}>
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {tool.name}
                              </div>
                              <Checkbox checked={selectedTools.includes(tool.id)} />
                            </div>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* File upload */}
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="border-none rounded-full size-10 cursor-pointer">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Models */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="border-none w-40" variant="outline">
                      <div className="text-xs truncate">{selectedModelName}</div>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuGroup>
                      {models.map((model) => (
                        <DropdownMenuItem
                          key={model[0]}
                          onClick={() => {
                            setModel(model[0])
                            setSelectedModelName(model[1])
                          }}
                        >
                          <div className="text-xs">{model[1]}</div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Providers */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="border-none w-32" variant="outline">
                      <div className="text-xs truncate">{selectedProvider}</div>
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32" align="start">
                    <DropdownMenuGroup>
                      {providers.map((provider) => (
                        <DropdownMenuItem
                          key={provider.id}
                          onClick={() => {
                            setSelectedProvider(provider.id)
                            setProvider(provider.id)
                          }}
                        >
                          <div className="text-xs">{provider.name}</div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Send */}
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                  size="icon"
                  className="w-10 h-10 rounded-full bg-black opacity-80 dark:bg-white hover:opacity-100 disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </label>

        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
      </div>
    </footer>
  )
}
