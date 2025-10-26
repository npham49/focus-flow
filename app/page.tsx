"use client"

import { useState, useEffect } from "react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { KanbanBoard } from "@/components/kanban-board"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImportExportDialog } from "@/components/import-export-dialog"
import { useTimerState } from "@/lib/use-timer-state"

export default function Home() {
  const timerState = useTimerState()

  // Initialize with default value to avoid hydration mismatch
  const [timerViewMode, setTimerViewMode] = useState<"full" | "compact">("full")

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerViewMode")
      if (saved === "compact" || saved === "full") {
        setTimerViewMode(saved)
      }
    }
  }, [])

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("timerViewMode", timerViewMode)
    }
  }, [timerViewMode])

  return (
    <main className="min-h-screen bg-background">
      {/* Compact timer at the very top (outside padding) */}
      {timerViewMode === "compact" && (
        <div className="sticky top-0 z-50">
          <PomodoroTimer
            viewMode="compact"
            onViewModeChange={setTimerViewMode}
            timerState={timerState}
          />
        </div>
      )}

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground text-balance">Focus Flow</h1>
              <p className="text-sm text-muted-foreground mt-1">Stay focused and organized with Pomodoro and Kanban</p>
              <p className="text-xs text-muted-foreground mt-1">
                All data stored locally in your browser. Use Import/Export to backup.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ImportExportDialog />
              <ThemeToggle />
            </div>
          </header>

          {/* Full mode: Timer and Kanban side by side */}
          {timerViewMode === "full" ? (
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
              <div className="lg:sticky lg:top-6 lg:self-start">
                <PomodoroTimer
                  viewMode="full"
                  onViewModeChange={setTimerViewMode}
                  timerState={timerState}
                />
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

          {/* Attribution */}
          <footer className="text-center text-xs text-muted-foreground pt-8 pb-4 space-y-1">
            <p>
              Sound Effect by{" "}
              <a
                href="https://pixabay.com/users/miraclei-45186201/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=364180"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                MiraclEI
              </a>{" "}
              from{" "}
              <a
                href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=364180"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Pixabay
              </a>
            </p>
            <p>
              <a
                href="https://github.com/npham49/focus-flow"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
