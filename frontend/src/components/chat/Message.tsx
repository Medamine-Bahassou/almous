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
    <div className={`py-4 flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div className="flex flex-col justify-end items-end w-full">

        {/* files */}
        {message.files && message.files.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.files.map((file, idx) => (
              <Card key={idx} className="p-3 bg-muted/30 flex flex-row items-center rounded-br-none gap-2 shadow-none">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px] ">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </Card>
            ))}
          </div>
        )}

        <div className={` ${isUser ? "max-w-[80%]" : "w-full"} space-y-2`}>

          {/* message content */}

          {isUser ? (
            <Card
              className={`p-4  ${isUser ? "bg-neutral-100 dark:bg-neutral-900" : "bg-transparent w-full"
                } border-none shadow-none`}
            >

              {
                isUser ?

                  <CollapsibleMessage content={message.content} />
                  :

                  <Response>
                    {message.content}
                  </Response>

              }

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
    </div>
  )
}

import { useState } from "react"
import { Button } from "../ui/button"

function CollapsibleMessage({ content, limit = 400 }: { content: string, limit?: number }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > limit

  return (
    <div className="relative text-balance  ">
      <p className="  break-words whitespace-pre-wrap   ">
        {expanded
          ? content
          : isLong
            ? content.slice(0, limit) + "..."
            : content}
      </p>

      {isLong && (
        <div className="w-full flex justify-center  ">

          <Button
            className="  rounded-full cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
      
    </div>
  )
}
