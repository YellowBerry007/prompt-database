"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    prompts: number
  }
}

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  })

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const res = await fetch(`${basePath}/api/tags`)
      const data = await res.json()
      setTags(data)
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const url = editingTag ? `${basePath}/api/tags/${editingTag.id}` : `${basePath}/api/tags`
      const method = editingTag ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingTag(null)
        setFormData({ name: "", slug: "" })
        fetchTags()
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving tag:", error)
      alert("Failed to save tag")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/tags/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTags()
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
      alert("Failed to delete tag")
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTag(null)
    setFormData({ name: "", slug: "" })
    setDialogOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  if (loading && tags.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Manage tags to label and filter your prompts
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
              <DialogDescription>
                Create a tag to label your prompts.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tags.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No tags yet. Create your first tag!
            </CardContent>
          </Card>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">
                    {tag.name}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {tag.slug} • {tag._count.prompts} prompt
                    {tag._count.prompts !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


