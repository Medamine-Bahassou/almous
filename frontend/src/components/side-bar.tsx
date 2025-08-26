// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Plus, Github, Flame, MessageSquareText, UserRound, Sun, Moon, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";



export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/a/chat", label: "Chat", icon: MessageSquareText },
    { href: "/a/readme", label: "Readme", icon: Github },
    { href: "/a/latex", label: "LaTeX", icon: FileText },
  ];

  const { theme, setTheme } = useTheme()

  return (
    <aside className="flex h-screen w-16 p-2 flex-col justify-between border-r">
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col items-center gap-6 pt-6">
          {/* Logo placeholder */}
          <div className="h-10 w-10 rounded-md   flex justify-center items-center" >
            <Link href={"/"}>
              <Flame />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col items-center gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex h-12  w-12 flex-col items-center justify-center gap-1 rounded-md text-xs",
                      pathname === href && "bg-muted font-medium"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4 pb-6">


          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Profile"
              >
                <UserRound />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
          <div className="p-4 border-t">
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 border-none cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

        </div>
      </TooltipProvider>
    </aside>
  );
}
