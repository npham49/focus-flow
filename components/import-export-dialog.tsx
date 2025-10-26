"use client"

import { useState, useRef } from "react"
import { Download, Upload, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { exportData, downloadJSON, handleFileImport } from "@/lib/import-export"

export function ImportExportDialog() {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const data = exportData()
      const filename = `focus-flow-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(data, filename)
      setMessage({ type: 'success', text: 'Data exported successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data.' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    const result = await handleFileImport(file)

    if (result.success) {
      setMessage({ type: 'success', text: 'Data imported successfully! Reloading page...' })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.error || 'Import failed.' })
    }

    setImporting(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileJson className="h-4 w-4 mr-2" />
          Import/Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import/Export Data</DialogTitle>
          <DialogDescription>
            Backup your tasks and settings, or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Export Data</h4>
            <p className="text-sm text-muted-foreground">
              Download all your tasks, timer settings, and preferences as a JSON file.
            </p>
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export to JSON
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Import Data</h4>
            <p className="text-sm text-muted-foreground">
              Restore from a previously exported JSON file. This will replace all current data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleImportClick}
              className="w-full"
              variant="outline"
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Importing...' : 'Import from JSON'}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${message.type === 'success'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Warning */}
          <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              ⚠️ Warning: Importing will replace all your current data with the data from the file.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
