// components/chat/MessageList.tsx
"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./Message"
import { Message } from "@/lib/types"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  // const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Scroll to the bottom whenever the messages array changes
    // bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-auto  overscroll-contain custom-scrollbar ">
      <div className="h-full">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-28">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Show loader only when waiting for assistant's first response */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex justify-start">
              <div className="loader"></div>
            </div>
          )}

          {/* This empty div is the target for scrolling */}
          {/* <div ref={bottomRef} /> */}
        </div>
      </div>
    </div>
  )
}