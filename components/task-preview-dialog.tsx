"use client"

import type { Task } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"

interface TaskPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  onEdit: () => void
  onDelete: () => void
}

export function TaskPreviewDialog({ open, onOpenChange, task, onEdit, onDelete }: TaskPreviewDialogProps) {
  const getColumnBadge = (column: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      todo: { label: "To Do", className: "bg-slate-500/20 text-slate-300 hover:bg-slate-500/30" },
      "in-progress": { label: "In Progress", className: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" },
      done: { label: "Done", className: "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" },
    }
    return variants[column] || variants.todo
  }

  const columnBadge = getColumnBadge(task.column)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-muted-foreground">{task.id}</span>
                <Badge className={columnBadge.className}>{columnBadge.label}</Badge>
              </div>
              <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
            {task.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Created</div>
                <div>{format(new Date(task.createdAt), "MMM d, yyyy")}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Updated</div>
                <div>{format(new Date(task.updatedAt), "MMM d, yyyy")}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-1 bg-transparent">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1 sm:flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
