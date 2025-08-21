// components/chat/MessageList.tsx
"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./Message"
import { Message } from "@/lib/types"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  // const scrollAreaRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   if (scrollAreaRef.current) {
  //     const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
  //     if (scrollContainer) {
  //       scrollContainer.scrollTop = scrollContainer.scrollHeight
  //     }
  //   }
  // }, [messages])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const prevLengthRef = useRef<number>(0)

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      // Only scroll when a NEW message is added
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    prevLengthRef.current = messages.length
  }, [messages])


  return (
    <div className="flex-1 overflow-auto">
      <div   className="h-full ">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <>
            <div ref={bottomRef} />
            <div className="loader"></div>
            </>

          )}
        </div>
      </div>
    </div>
  )
}