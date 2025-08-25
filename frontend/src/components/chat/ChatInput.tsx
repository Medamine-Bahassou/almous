// components/chat/ChatInput.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Paperclip, X, FileText, SlidersHorizontal, Microscope, Box, ArrowUp, ChevronDown, Globe, BookOpenText, Sparkle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "../ui/checkbox"
import { useModels } from "@/hook/useModels"
import { fetchModels } from "@/lib/models"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  handleSend: () => void
  isLoading: boolean
  selectedFiles: File[]
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeFile: (index: number) => void
  selectedTools: string[];
  onToggleTool: (tool: string) => void;
  setModel: (modelId: string) => void
  setProvider: (providerId: string) => void
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  isLoading,
  selectedFiles,
  handleFileUpload,
  removeFile,
  selectedTools,
  onToggleTool,
  setModel,
  setProvider
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }


  // const [selectedModel, setSelectedModel] = useState({ id: "gpt-4o", name: "GPT-4o" })

  // const models = [
  //   { id: 'gpt-4o', name: 'GPT-4o' },
  //   { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  //   { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  // ];

  // const { models, loading: modelsLoading, error: modelsError } = useModels("pollination");


  const tools = [
    { id: 'search', name: 'Search' },
    { id: 'study', name: 'Study mode' },
    { id: 'better', name: 'Better mode' },
  ];

  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<[string, string][]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');

  const [selectedProvider, setSelectedProvider] = useState("")


  const providers = [
    { id: "pollination", name: "Pollination" },
    { id: "groq", name: "Groq" },
    { id: "a4f", name: "A4F" },
  ]

  useEffect(()=> {
    setSelectedProvider(providers[0].id)
    setProvider(providers[0].id)
  },[])


  useEffect(() => {
    async function loadModels() {
      try {
        const formatted = await fetchModels(selectedProvider);
        setModels(formatted);
        if (formatted.length) {
          setSelectedModel(formatted[0][0]);
          setSelectedModelName(formatted[0][1]);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadModels();
  }, [selectedProvider]);







  return (
    <footer className=" bg-background/80 backdrop-blur-sm  w-full px-6 ">
      <div className="max-w-4xl mx-auto">
        {selectedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedFiles.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                <FileText className="h-3 w-3" />
                <span className="text-xs truncate max-w-32">{file.name}</span>
                <Button onClick={() => removeFile(index)} variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground">
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <label htmlFor="prompt">
          <div className="relative flex flex-col items-center w-full p-2 space-x-2 border glow bg-zinc-100 dark:bg-zinc-800 rounded-3xl">
            <div className="w-full">
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

            <div className="w-full flex justify-between">
              <div className="flex items-center gap-2">

                {/* more tools  */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="border-none " variant="ghost">
                      <SlidersHorizontal className="w-5 h-5 " />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuGroup>
                      {tools.map((tool) => (
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          key={tool.id}
                          onClick={() => onToggleTool(tool.id)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              {tool.id === "study" && <BookOpenText />}
                              {tool.id === "better" && <Sparkle />}
                              {tool.id === "search" && <Globe />}
                              {tool.name}
                            </div>
                            <Checkbox
                              id={tool.id}
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={() => onToggleTool(tool.id)}
                            />
                          </div>
                        </DropdownMenuItem>
                      ))}

                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>


                {/* file upload */}
                <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                  <Paperclip className="w-5 h-5" />
                </Button>



                {/* latex tool */}
                <Button
                  variant={selectedTools.includes('latex') ? "default" : "secondary"}
                  onClick={() => onToggleTool('latex')}
                  className="flex-shrink-0 gap-2 px-3 text-sm rounded-full "
                >
                  <FileText className="w-4 h-4" />
                  LaTeX
                </Button>
              </div>
              <div>
                <div className="flex items-center gap-2">

                  {/* models list */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="border-none w-40 " variant="outline" >
                        <div className="text-xs truncate">
                          {selectedModelName}
                        </div>
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 " align="start">
                      <DropdownMenuGroup>
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model[0]}
                            onClick={() => {
                              setModel(model[0]);
                              setSelectedModelName(model[1]);
                            }}
                          >
                            <div className="text-xs">
                              {model[1]}
                            </div>
                          </DropdownMenuItem>
                        ))}

                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>


                  {/* providers list */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="border-none w-32 " variant="outline" >
                        <div className="text-xs truncate">
                          {selectedProvider}
                        </div>
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 " align="start">
                      <DropdownMenuGroup>
                        {providers.map((provider) => (
                          <DropdownMenuItem
                            key={provider.id}
                            onClick={() => {
                              setSelectedProvider(provider.id);
                              setProvider(provider.id);
                            }}
                          >
                            <div className="text-xs">
                              {provider.name}
                            </div>
                          </DropdownMenuItem>
                        ))}

                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>


                  {/* send button */}
                  <Button onClick={handleSend} disabled={(!input.trim() && selectedFiles.length === 0) || isLoading} size="icon" className="flex-shrink-0 w-10 h-10 rounded-full bg-black opacity-80 dark:bg-white hover:opacity-100 hover:bg-black dark:hover:opacity-100 disabled:opacity-50">
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </label>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
        <p className="pt-2 text-xs text-center text-muted-foreground">AI can make mistakes. Consider checking important information.</p>
      </div>
    </footer>
  )
}