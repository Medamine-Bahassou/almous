// components/chat/Message.tsx
"use client"

import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import { Message } from "@/lib/types"
import { useEffect } from "react"
import { useLatex } from "@/context/LatexContext"

interface MessageProps {
  message: Message
}

export function ChatMessage({ message }: MessageProps) {

  function extractLatex(content: string): string | null {
    let match = content.match(/```latex\s*([\s\S]*?)```/i);
    if (!match) {
      match = content.match(/```\s*([\s\S]*?)```/i);
    }
    return match ? match[1].trim() : null;
  }
  const { setLatex } = useLatex();

  useEffect(() => {
    if (message.content) {
      const latexOnly = extractLatex(message.content);
      if (latexOnly) {
        setLatex(latexOnly);
      }
    }
  }, [message, setLatex]);



  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div className={`${isUser ? "max-w-[80%]" : "w-full"} space-y-2`}>

        {/* files */}
        {message.files && message.files.length > 0 && (
          <div className="space-y-2">
            {message.files.map((file, idx) => (
              <Card
                key={idx}
                className="p-3 bg-muted/30 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </Card>
            ))}
          </div>
        )}

        {/* message */}
        <Card
          className={`p-4 ${isUser
              ? "bg-neutral-100 dark:bg-neutral-900"
              : "bg-transparent  w-full"
            } border-none shadow-none`}
        >
          <Response >{message.content}</Response>
        </Card>
      </div>

    </div>
  )
}