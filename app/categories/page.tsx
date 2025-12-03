"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent: Category | null
  children: Category[]
  _count: {
    prompts: number
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    slug: string
    parentId: string | null
    sortOrder: number
  }>({
    name: "",
    slug: "",
    parentId: null,
    sortOrder: 0,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const res = await fetch(`${basePath}/api/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: {
        name: string
        slug: string
        parentId?: string
        sortOrder: number
      } = {
        name: formData.name,
        slug: formData.slug,
        sortOrder: parseInt(String(formData.sortOrder)) || 0,
      }
      
      // Only include parentId if it's not null
      if (formData.parentId) {
        payload.parentId = formData.parentId
      }

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const url = editingCategory
        ? `${basePath}/api/categories/${editingCategory.id}`
        : `${basePath}/api/categories`
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingCategory(null)
        setFormData({ name: "", slug: "", parentId: null, sortOrder: 0 })
        fetchCategories()
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database'
      const response = await fetch(`${basePath}/api/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || null,
      sortOrder: (category as any).sortOrder || 0,
    })
    setDialogOpen(true)
  }

  const handleNew = () => {
    setEditingCategory(null)
    setFormData({ name: "", slug: "", parentId: "", sortOrder: 0 })
    setDialogOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const renderCategory = (category: Category, level = 0) => {
    return (
      <div key={category.id} className="ml-4">
        <Card className="mb-2 gradient-card shadow-glow hover:shadow-glow-hover transition-all border-purple-100">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="font-semibold">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                {category.slug} • {category._count.prompts} prompt
                {category._count.prompts !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(category)}
                className="border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(category.id)}
                className="hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {category.children.map((child) => renderCategory(child, level + 1))}
      </div>
    )
  }

  const topLevelCategories = categories.filter((cat) => !cat.parentId)

  if (loading && categories.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Categories
          </h1>
          <p className="text-gray-600 font-medium">
            Organize your prompts into categories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="gradient-primary shadow-glow hover:shadow-glow-hover transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "New Category"}
              </DialogTitle>
              <DialogDescription>
                Create a category to organize your prompts.
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

              <div>
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={formData.parentId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === "none" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .filter((cat) => cat.id !== editingCategory?.id)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {topLevelCategories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No categories yet. Create your first category!
            </CardContent>
          </Card>
        ) : (
          topLevelCategories.map((category) => renderCategory(category))
        )}
      </div>
    </div>
  )
}

