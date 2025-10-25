import { NextResponse } from "next/server"
import type { Task } from "@/lib/types"

// In-memory storage for demo purposes
// In production, use a database
const tasks: Task[] = [
  {
    id: "1",
    title: "Design new feature",
    description: "Create mockups for the dashboard redesign",
    column: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Review pull requests",
    description: "Check and approve pending PRs",
    column: "in-progress",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Update documentation",
    description: "Add API documentation for new endpoints",
    column: "done",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const taskIndex = tasks.findIndex((t) => t.id === id)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(tasks[taskIndex])
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const taskIndex = tasks.findIndex((t) => t.id === id)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  tasks.splice(taskIndex, 1)
  return NextResponse.json({ success: true })
}
