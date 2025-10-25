"use client"

import { useState, useEffect } from "react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { KanbanBoard } from "@/components/kanban-board"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [timerViewMode, setTimerViewMode] = useState<"full" | "compact">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerViewMode")
      return (saved as "full" | "compact") || "full"
    }
    return "full"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerViewMode", timerViewMode)
    }
  }, [timerViewMode])

  return (
    <main className="min-h-screen bg-background">
      {timerViewMode === "compact" && (
        <div className="sticky top-0 z-50">
          <PomodoroTimer viewMode="compact" onViewModeChange={setTimerViewMode} />
        </div>
      )}

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground text-balance">Focus Flow</h1>
              <p className="text-sm text-muted-foreground mt-1">Stay focused and organized with Pomodoro and Kanban</p>
            </div>
            <ThemeToggle />
          </header>

          {timerViewMode === "full" ? (
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
              <div className="lg:sticky lg:top-6 lg:self-start">
                <PomodoroTimer viewMode="full" onViewModeChange={setTimerViewMode} />
              </div>

              <div>
                <KanbanBoard />
              </div>
            </div>
          ) : (
            <div>
              <KanbanBoard />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
