// lib/types.ts

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  files?: File[]
  type?: "text" | "reasoning" // Add this optional property
  isStreaming?: boolean
}

export interface MessagePart {
  type: "text" | "reasoning";
  text: string;
}
export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}