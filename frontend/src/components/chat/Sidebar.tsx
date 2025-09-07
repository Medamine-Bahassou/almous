// components/chat/Sidebar.tsx
"use client"

import { useTheme } from "next-themes"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Moon, Sun, File } from "lucide-react"
import { Conversation } from "@/lib/types"

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  isOpen: boolean
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  isOpen,
}: SidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className={`${isOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform lg:translate-x-0 lg:static`}
    >
      <div className="flex flex-col h-full">
        {/* LOGO */}
        

        {/* Buttons */}
        <div className="p-4   flex flex-col gap-2">
          <Button onClick={onNewChat} variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          {/* <Link href={"/readme"}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <File className="h-4 w-4" />
              README Generator
            </Button>
          </Link> */}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                variant={conversation.id === currentConversationId ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
              >
                <div className="truncate">
                  <div className="font-medium text-sm truncate">{conversation.title}</div>
                  <div className="text-xs text-muted-foreground">{conversation.createdAt.toLocaleDateString()}</div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

      </div>
    </aside>
  )
}