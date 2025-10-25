"use client"

import type React from "react"

import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, GripVertical } from "lucide-react"

interface TaskCardProps {
  task: Task
  onDragStart: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onPreview: (task: Task) => void
  isDragging: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
  isDropTarget?: boolean
}

const getColumnColorClass = (column: string) => {
  switch (column) {
    case "todo":
      return "bg-red-950/20 border-red-900/30 hover:bg-red-950/30"
    case "in-progress":
      return "bg-yellow-950/20 border-yellow-900/30 hover:bg-yellow-950/30"
    case "done":
      return "bg-green-950/20 border-green-900/30 hover:bg-green-950/30"
    default:
      return "bg-card"
  }
}

export function TaskCard({
  task,
  onDragStart,
  onEdit,
  onDelete,
  onPreview,
  isDragging,
  onDragOver,
  onDrop,
  isDropTarget = false,
}: TaskCardProps) {
  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.stopPropagation()
        onDrop?.()
      }}
      onClick={() => onPreview(task)}
      className={`cursor-pointer transition-all hover:shadow-md ${getColumnColorClass(task.column)} ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-muted-foreground mb-1">{task.id}</div>
            <CardTitle className="text-sm font-medium leading-tight text-balance">{task.title}</CardTitle>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="pb-3">
          <p className="text-xs text-muted-foreground text-pretty line-clamp-2">{task.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
