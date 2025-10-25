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

export async function GET() {
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newTask: Task = {
    id: Date.now().toString(),
    title: body.title,
    description: body.description || "",
    column: body.column || "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  tasks.push(newTask)
  return NextResponse.json(newTask)
}
