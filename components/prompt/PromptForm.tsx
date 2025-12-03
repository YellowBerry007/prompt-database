"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Copy } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
}

interface Tag {
  id: string
  name: string
  slug?: string
}

interface PromptFormProps {
  prompt?: {
    id: string
    title: string
    description: string | null
    body: string
    type: string
    platform: string
    modelHint: string | null
    language: string
    useCase: string
    clientOrProject: string | null
    status: string
    isFavorite: boolean
    version: number
    changelog: string | null
    notes: string | null
    categoryId: string | null
    tags: { tag: { id: string; name: string } }[]
  }
  categories: Category[]
  tags: Tag[]
}

export function PromptForm({ prompt, categories, tags }: PromptFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    body: string
    type: string
    platform: string
    modelHint: string
    language: string
    useCase: string
    clientOrProject: string
    status: string
    isFavorite: boolean
    version: number
    changelog: string
    notes: string
    categoryId: string | null
    tagIds: string[]
  }>({
    title: prompt?.title || "",
    description: prompt?.description || "",
    body: prompt?.body || "",
    type: prompt?.type || "USER",
    platform: prompt?.platform || "CURSOR",
    modelHint: prompt?.modelHint || "",
    language: prompt?.language || "en",
    useCase: prompt?.useCase || "",
    clientOrProject: prompt?.clientOrProject || "",
    status: prompt?.status || "DRAFT",
    isFavorite: prompt?.isFavorite || false,
    version: prompt?.version || 1,
    changelog: prompt?.changelog || "",
    notes: prompt?.notes || "",
    categoryId: prompt?.categoryId || null,
    tagIds: prompt?.tags.map((t) => t.tag.id) || [],
  })

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    prompt?.tags.map((t) => t.tag as Tag) || []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        tagIds: selectedTags.map((t) => t.id),
        categoryId: formData.categoryId,
      }

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const url = prompt ? `${basePath}/api/prompts/${prompt.id}` : `${basePath}/api/prompts`
      const method = prompt ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/prompts")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving prompt:", error)
      alert("Failed to save prompt")
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!prompt) return

    setLoading(true)
    try {
      const payload = {
        ...formData,
        title: `${formData.title} (Copy)`,
        version: 1,
        changelog: `Duplicated from version ${prompt.version}`,
        tagIds: selectedTags.map((t) => t.id),
        categoryId: formData.categoryId,
      }

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push("/prompts")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error duplicating prompt:", error)
      alert("Failed to duplicate prompt")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formData.body)
      if (prompt) {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
        await fetch(`${basePath}/api/prompts/${prompt.id}/usage`, { method: "PATCH" })
      }
      alert("Copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      alert("Failed to copy to clipboard")
    }
  }

  const handleDelete = async () => {
    if (!prompt) return
    if (!confirm("Are you sure you want to delete this prompt?")) return

    setLoading(true)
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/prompts/${prompt.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/prompts")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      alert("Failed to delete prompt")
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: Tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {prompt ? "Edit Prompt" : "New Prompt"}
        </h1>
        <div className="flex gap-2">
          {prompt && (
            <>
              <Button type="button" variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </Button>
              <Button type="button" variant="outline" onClick={handleDuplicate}>
                Duplicate
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="body">Prompt Body *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                rows={10}
                required
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYSTEM">System</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="TOOL">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHATGPT">ChatGPT</SelectItem>
                  <SelectItem value="CURSOR">Cursor</SelectItem>
                  <SelectItem value="MIDJOURNEY">Midjourney</SelectItem>
                  <SelectItem value="SUNO">Suno</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modelHint">Model Hint</Label>
              <Input
                id="modelHint"
                value={formData.modelHint}
                onChange={(e) =>
                  setFormData({ ...formData, modelHint: e.target.value })
                }
                placeholder="e.g., gpt-4, claude-3"
              />
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                placeholder="en, nl, etc."
              />
            </div>

            <div>
              <Label htmlFor="useCase">Use Case *</Label>
              <Input
                id="useCase"
                value={formData.useCase}
                onChange={(e) =>
                  setFormData({ ...formData, useCase: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="clientOrProject">Client/Project</Label>
              <Input
                id="clientOrProject"
                value={formData.clientOrProject}
                onChange={(e) =>
                  setFormData({ ...formData, clientOrProject: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="TESTED">Tested</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value === "none" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags
                  .filter((tag) => !selectedTags.find((t) => t.id === tag.id))
                  .map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      + {tag.name}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={formData.isFavorite}
                onChange={(e) =>
                  setFormData({ ...formData, isFavorite: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isFavorite" className="cursor-pointer">
                Mark as favorite
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              type="number"
              value={formData.version}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  version: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea
              id="changelog"
              value={formData.changelog}
              onChange={(e) =>
                setFormData({ ...formData, changelog: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

