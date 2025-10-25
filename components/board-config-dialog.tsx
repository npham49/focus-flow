"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BoardConfig } from "@/lib/types"

interface BoardConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: BoardConfig) => void
  currentConfig: BoardConfig | null
}

export function BoardConfigDialog({ open, onOpenChange, onSave, currentConfig }: BoardConfigDialogProps) {
  const [name, setName] = useState("")
  const [acronym, setAcronym] = useState("")

  useEffect(() => {
    if (currentConfig) {
      setName(currentConfig.name)
      setAcronym(currentConfig.acronym)
    }
  }, [currentConfig, open])

  const generateAcronym = (boardName: string) => {
    // Generate acronym from board name (take first letter of each word)
    const words = boardName.trim().split(/\s+/)
    const generated = words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) // Max 4 characters
    setAcronym(generated || "TASK")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!currentConfig) {
      // Auto-generate acronym only for new boards
      generateAcronym(value)
    }
  }

  const handleSave = () => {
    if (!name.trim() || !acronym.trim()) return
    onSave({ name: name.trim(), acronym: acronym.trim().toUpperCase() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentConfig ? "Edit Board Settings" : "Create Your Board"}</DialogTitle>
          <DialogDescription>
            {currentConfig
              ? "Update your board name and acronym."
              : "Give your board a name. We'll generate an acronym for task IDs."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              placeholder="e.g., Product Roadmap, Sprint Planning"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acronym">Acronym (for task IDs)</Label>
            <Input
              id="acronym"
              placeholder="e.g., PROD, SPRINT"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground">
              Tasks will be numbered like: {acronym || "TASK"}-1, {acronym || "TASK"}-2, etc.
            </p>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!name.trim() || !acronym.trim()}>
            {currentConfig ? "Update Board" : "Create Board"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
