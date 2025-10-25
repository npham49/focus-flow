export interface Task {
  id: string
  taskNumber: number // Added task number for ID generation
  title: string
  description: string
  column: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  title: string
}

export interface BoardConfig {
  name: string
  acronym: string
}
