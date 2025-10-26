// Import/Export functionality for app data

export interface ExportData {
  version: string;
  exportDate: string;
  tasks: any[];
  boardConfig: any;
  taskCounter: number;
  pomodoroSettings: {
    workDuration: number;
    breakDuration: number;
  };
  timerViewMode: string;
}

export function exportData(): ExportData {
  const tasks = localStorage.getItem("kanban-tasks");
  const boardConfig = localStorage.getItem("board-config");
  const taskCounter = localStorage.getItem("task-counter");
  const pomodoroSettings = localStorage.getItem("pomodoroSettings");
  const timerViewMode = localStorage.getItem("timerViewMode");

  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    tasks: tasks ? JSON.parse(tasks) : [],
    boardConfig: boardConfig ? JSON.parse(boardConfig) : null,
    taskCounter: taskCounter ? parseInt(taskCounter, 10) : 1,
    pomodoroSettings: pomodoroSettings
      ? JSON.parse(pomodoroSettings)
      : { workDuration: 25, breakDuration: 5 },
    timerViewMode: timerViewMode || "full",
  };
}

export function downloadJSON(
  data: ExportData,
  filename: string = "focus-flow-data.json"
) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateImportData(data: any): data is ExportData {
  if (!data || typeof data !== "object") return false;

  // Check required fields
  if (!data.version || typeof data.version !== "string") return false;
  if (!data.exportDate || typeof data.exportDate !== "string") return false;
  if (!Array.isArray(data.tasks)) return false;

  // boardConfig can be null
  if (data.boardConfig !== null && typeof data.boardConfig !== "object")
    return false;

  // taskCounter
  if (typeof data.taskCounter !== "number") return false;

  // Check pomodoroSettings
  if (!data.pomodoroSettings || typeof data.pomodoroSettings !== "object")
    return false;
  if (typeof data.pomodoroSettings.workDuration !== "number") return false;
  if (typeof data.pomodoroSettings.breakDuration !== "number") return false;

  // Check timerViewMode
  if (!data.timerViewMode || typeof data.timerViewMode !== "string")
    return false;

  return true;
}

export function importData(data: ExportData): void {
  // Store each piece of data in localStorage
  localStorage.setItem("kanban-tasks", JSON.stringify(data.tasks));
  if (data.boardConfig) {
    localStorage.setItem("board-config", JSON.stringify(data.boardConfig));
  }
  localStorage.setItem("task-counter", data.taskCounter.toString());
  localStorage.setItem(
    "pomodoroSettings",
    JSON.stringify(data.pomodoroSettings)
  );
  localStorage.setItem("timerViewMode", data.timerViewMode);
}

export async function handleFileImport(
  file: File
): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateImportData(data)) {
      return {
        success: false,
        error:
          "Invalid file format. Please select a valid Focus Flow export file.",
      };
    }

    importData(data);
    return { success: true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error:
          "Invalid JSON file. Please select a valid Focus Flow export file.",
      };
    }
    return { success: false, error: "Failed to read file. Please try again." };
  }
}
