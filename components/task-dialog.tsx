"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSave: (id: string, title: string, description: string) => void | ((title: string, description: string) => void)
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    } else {
      setTitle("")
      setDescription("")
    }
  }, [task, open])

  const handleSave = () => {
    if (!title.trim()) return

    if (task) {
      ;(onSave as (id: string, title: string, description: string) => void)(task.id, title, description)
    } else {
      ;(onSave as (title: string, description: string) => void)(title, description)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the task details below." : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!title.trim()}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
