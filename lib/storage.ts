import type { Task, BoardConfig } from "./types"

const TASKS_KEY = "kanban-tasks"
const BOARD_CONFIG_KEY = "board-config"
const TASK_COUNTER_KEY = "task-counter"

export const storage = {
  // Board config
  getBoardConfig(): BoardConfig | null {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(BOARD_CONFIG_KEY)
    return data ? JSON.parse(data) : null
  },

  setBoardConfig(config: BoardConfig): void {
    if (typeof window === "undefined") return
    localStorage.setItem(BOARD_CONFIG_KEY, JSON.stringify(config))
  },

  // Tasks
  getTasks(): Task[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTasks(tasks: Task[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  },

  // Task counter for generating sequential IDs
  getTaskCounter(): number {
    if (typeof window === "undefined") return 1
    const counter = localStorage.getItem(TASK_COUNTER_KEY)
    return counter ? Number.parseInt(counter, 10) : 1
  },

  incrementTaskCounter(): number {
    if (typeof window === "undefined") return 1
    const current = this.getTaskCounter()
    const next = current + 1
    localStorage.setItem(TASK_COUNTER_KEY, next.toString())
    return current
  },

  // Generate task ID with acronym
  generateTaskId(acronym: string): { id: string; taskNumber: number } {
    const taskNumber = this.incrementTaskCounter()
    return {
      id: `${acronym.toUpperCase()}-${taskNumber}`,
      taskNumber,
    }
  },
}
