// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, Bot } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 border-b">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <Bot className="h-6 w-6" />
          Almous
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-6">
          <Link href="#">
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="#">
            <Button variant="ghost">Pricing</Button>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Link href="#">
            <Button>Log in</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="mb-4">
          <span className="px-3 py-1 text-sm rounded-full bg-muted">
            🤖 Powered by multi-agent AI
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl">
          Smarter conversations with <span className="text-primary">Almous</span>
        </h1>

        <p className="mt-6 max-w-xl text-muted-foreground">
          Almous is your intelligent multi-agent chat assistant.
          Coordinate, brainstorm, and execute tasks with AI agents that collaborate
          like a real team — built for productivity, research, and growth.
        </p>

        <div className="mt-8 flex gap-4">
          <Link href={"/a/chat"}>
            <Button size="lg">
              Start chatting
            </Button>
          </Link>
          <Button size="lg" variant="secondary">
            Book a demo
          </Button>
        </div>
      </main>
    </div>
  );
}
