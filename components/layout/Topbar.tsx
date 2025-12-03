"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Download, Upload, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function Topbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set("search", searchQuery)
    }
    router.push(`/prompts?${params.toString()}`)
  }

  const handleExport = async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/export/prompts`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prompts-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export prompts")
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/import/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        alert("Import successful!")
        setImportOpen(false)
        setImportFile(null)
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Import failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Import failed:", error)
      alert("Failed to import prompts")
    }
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-purple-100 bg-white/80 backdrop-blur-sm px-6 shadow-sm">
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <Link href="/prompts/new">
          <Button className="gradient-primary shadow-glow hover:shadow-glow-hover transition-all">
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        </Link>

        <Button variant="outline" onClick={handleExport} className="border-purple-200 hover:bg-purple-50 hover:border-purple-300">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-purple-200 hover:bg-purple-50 hover:border-purple-300">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Prompts</DialogTitle>
              <DialogDescription>
                Upload a JSON file exported from this application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setImportFile(file)
                }}
              />
              <Button onClick={handleImport} disabled={!importFile}>
                Import
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


