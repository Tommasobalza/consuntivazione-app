
"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Laptop } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2 rounded-md border p-1">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme("light")}
        className="flex-1"
      >
        <Sun className="mr-2 h-4 w-4" />
        Chiaro
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme("dark")}
        className="flex-1"

      >
        <Moon className="mr-2 h-4 w-4" />
        Scuro
      </Button>
      <Button
        variant={theme === 'system' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme("system")}
        className="flex-1"
      >
        <Laptop className="mr-2 h-4 w-4" />
        Sistema
      </Button>
    </div>
  )
}
