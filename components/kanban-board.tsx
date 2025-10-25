"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { TaskDialog } from "@/components/task-dialog"
import { TaskPreviewDialog } from "@/components/task-preview-dialog"
import { BoardConfigDialog } from "@/components/board-config-dialog"
import type { Task, Column, BoardConfig } from "@/lib/types"
import { storage } from "@/lib/storage"

const COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
]

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [previewTask, setPreviewTask] = useState<Task | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [activeColumn, setActiveColumn] = useState<string>("todo")
  const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)

  useEffect(() => {
    const config = storage.getBoardConfig()
    if (config) {
      setBoardConfig(config)
      const loadedTasks = storage.getTasks()
      setTasks(loadedTasks)
    } else {
      // Show config dialog if no board exists
      setConfigDialogOpen(true)
    }
  }, [])

  const handleSaveBoardConfig = (config: BoardConfig) => {
    storage.setBoardConfig(config)
    setBoardConfig(config)
    setConfigDialogOpen(false)
  }

  const handleCreateTask = (title: string, description: string) => {
    if (!boardConfig) return

    const { id, taskNumber } = storage.generateTaskId(boardConfig.acronym)
    const newTask: Task = {
      id,
      taskNumber,
      title,
      description,
      column: activeColumn,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
    setDialogOpen(false)
  }

  const handleUpdateTask = (id: string, title: string, description: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            title,
            description,
            updatedAt: new Date().toISOString(),
          }
        : t,
    )
    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
    setDialogOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== id)
    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDragOverTask = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTaskId(taskId)
  }

  const handleDrop = (columnId: string, dropTaskId?: string) => {
    if (!draggedTask) return

    const columnTasks = tasks.filter((t) => t.column === columnId)
    const otherTasks = tasks.filter((t) => t.column !== columnId && t.id !== draggedTask.id)

    let updatedTasks: Task[]

    if (draggedTask.column === columnId && dropTaskId) {
      // Reordering within the same column
      const draggedIndex = columnTasks.findIndex((t) => t.id === draggedTask.id)
      const dropIndex = columnTasks.findIndex((t) => t.id === dropTaskId)

      // Remove dragged task from its current position
      const filteredColumnTasks = columnTasks.filter((t) => t.id !== draggedTask.id)

      // Insert at new position
      filteredColumnTasks.splice(dropIndex, 0, {
        ...draggedTask,
        updatedAt: new Date().toISOString(),
      })

      updatedTasks = [...otherTasks, ...filteredColumnTasks]
    } else {
      // Moving to a different column or dropping in empty space
      const updatedDraggedTask = {
        ...draggedTask,
        column: columnId,
        updatedAt: new Date().toISOString(),
      }

      if (dropTaskId) {
        // Insert before the drop target
        const dropIndex = columnTasks.findIndex((t) => t.id === dropTaskId)
        columnTasks.splice(dropIndex, 0, updatedDraggedTask)
        updatedTasks = [...otherTasks, ...columnTasks]
      } else {
        // Add to end of column
        updatedTasks = tasks.map((t) => (t.id === draggedTask.id ? updatedDraggedTask : t))
      }
    }

    setTasks(updatedTasks)
    storage.saveTasks(updatedTasks)
    setDraggedTask(null)
    setDragOverColumn(null)
    setDragOverTaskId(null)
  }

  const openCreateDialog = (columnId: string) => {
    setActiveColumn(columnId)
    setEditingTask(null)
    setDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const openPreviewDialog = (task: Task) => {
    setPreviewTask(task)
    setPreviewDialogOpen(true)
  }

  if (!boardConfig) {
    return (
      <BoardConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={handleSaveBoardConfig}
        currentConfig={null}
      />
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{boardConfig.name}</h2>
          <p className="text-sm text-muted-foreground">Task prefix: {boardConfig.acronym}-</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Board Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Card
            key={column.id}
            className={`flex flex-col bg-card transition-all ${
              dragOverColumn === column.id ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(column.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium">{column.title}</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCreateDialog(column.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              {tasks
                .filter((task) => task.column === column.id)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteTask}
                    onPreview={openPreviewDialog}
                    isDragging={draggedTask?.id === task.id}
                    onDragOver={(e) => handleDragOverTask(e, task.id)}
                    onDrop={() => handleDrop(column.id, task.id)}
                    isDropTarget={dragOverTaskId === task.id}
                  />
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />

      {previewTask && (
        <TaskPreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          task={previewTask}
          onEdit={() => {
            setPreviewDialogOpen(false)
            openEditDialog(previewTask)
          }}
          onDelete={() => {
            setPreviewDialogOpen(false)
            handleDeleteTask(previewTask.id)
          }}
        />
      )}

      <BoardConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={handleSaveBoardConfig}
        currentConfig={boardConfig}
      />
    </>
  )
}
