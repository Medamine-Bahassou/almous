// components/chat/Message.tsx
"use client"

import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ui/shadcn-io/ai/reasoning"
import { Message as MessageType } from "@/lib/types"

interface MessageProps {
  message: MessageType
}

export function ChatMessage({ message }: MessageProps) {
  const isUser = message.role === "user"

  // Don't render empty messages from the assistant
  if (!isUser && !message.content?.trim()) {
    return null
  }

  return (
    <div className={`flex  ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "max-w-[80%]" : "w-full"} space-y-2`}>
        {/* files */}
        {message.files && message.files.length > 0 && (
          <div className="space-y-2">
            {message.files.map((file, idx) => (
              <Card key={idx} className="p-3 bg-muted/30 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </Card>
            ))}
          </div>
        )}

        {/* message content */}
        
        {isUser ? (
          <Card
            className={`p-4 my-4 ${isUser ? "bg-neutral-100 dark:bg-neutral-900" : "bg-transparent w-full"
              } border-none shadow-none`}
          >
            <Response>{message.content}</Response>
          </Card>
        ) : (
          <>
            {message.type === "reasoning" ? (
              <Reasoning defaultOpen={false} isStreaming={message.isStreaming}>
                <ReasoningTrigger />
                <ReasoningContent>{message.content}</ReasoningContent>
              </Reasoning>
            ) : (
              <Response>{message.content}</Response>
            )}
          </>
        )}
      </div>
    </div>
  )
}