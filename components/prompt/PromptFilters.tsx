"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PromptFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>
  tags: Array<{ id: string; name: string; slug: string }>
  initialFilters: {
    categoryId?: string
    tagIds?: string | string[]
    platform?: string
    status?: string
    isFavorite?: string
    language?: string
  }
}

export function PromptFilters({
  categories,
  tags,
  initialFilters,
}: PromptFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/prompts?${params.toString()}`)
  }

  const toggleTag = (tagId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentTagIds = params.getAll("tagIds")
    if (currentTagIds.includes(tagId)) {
      params.delete("tagIds")
      currentTagIds
        .filter((id) => id !== tagId)
        .forEach((id) => params.append("tagIds", id))
    } else {
      params.append("tagIds", tagId)
    }
    router.push(`/prompts?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/prompts")
  }

  const selectedTagIds = Array.isArray(initialFilters.tagIds)
    ? initialFilters.tagIds
    : initialFilters.tagIds
    ? [initialFilters.tagIds]
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        {(initialFilters.categoryId ||
          selectedTagIds.length > 0 ||
          initialFilters.platform ||
          initialFilters.status ||
          initialFilters.isFavorite ||
          initialFilters.language) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-purple-50 hover:text-purple-700">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={initialFilters.categoryId || undefined}
            onValueChange={(value) =>
              updateFilter("categoryId", value || null)
            }
          >
            <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={initialFilters.platform || undefined}
            onValueChange={(value) => updateFilter("platform", value || null)}
          >
            <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHATGPT">ChatGPT</SelectItem>
              <SelectItem value="CURSOR">Cursor</SelectItem>
              <SelectItem value="MIDJOURNEY">Midjourney</SelectItem>
              <SelectItem value="SUNO">Suno</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={initialFilters.status || undefined}
            onValueChange={(value) => updateFilter("status", value || null)}
          >
            <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="TESTED">Tested</SelectItem>
              <SelectItem value="PRODUCTION">Production</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Language</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g., en, nl"
            value={initialFilters.language || ""}
            onChange={(e) => updateFilter("language", e.target.value || null)}
            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <label
                key={tag.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTag(tag.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{tag.name}</span>
              </label>
            )
          })}
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-glow border-purple-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Favorite</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={initialFilters.isFavorite === "true"}
              onChange={(e) =>
                updateFilter("isFavorite", e.target.checked ? "true" : null)
              }
              className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-400 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-purple-700">Show favorites only</span>
          </label>
        </CardContent>
      </Card>
    </div>
  )
}

