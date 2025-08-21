// lib/types.ts

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: File[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}