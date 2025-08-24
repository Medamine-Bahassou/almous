// components/chat/ChatHeader.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface ChatHeaderProps {
  title: string
  onMenuClick: () => void
}

export function ChatHeader({ title, onMenuClick }: ChatHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm p-4 flex items-center gap-3">
      <Button onClick={onMenuClick} variant="ghost" size="sm" className="lg:hidden">
        <Menu className="h-4 w-4" />
      </Button>
      <h1 className="text-md font-medium flex-1 text-center">{title}</h1>
    </header>
  )
}