import { PromptList } from "@/components/prompt/PromptList"
import { PromptFilters } from "@/components/prompt/PromptFilters"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

async function getPrompts(searchParams: {
  search?: string
  categoryId?: string
  tagIds?: string[]
  platform?: string
  status?: string
  isFavorite?: string
  language?: string
}) {
  const where: any = {}

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
      { body: { contains: searchParams.search } },
    ]
  }

  if (searchParams.categoryId) {
    where.categoryId = searchParams.categoryId
  }

  if (searchParams.platform) {
    where.platform = searchParams.platform
  }

  if (searchParams.status) {
    where.status = searchParams.status
  }

  if (searchParams.isFavorite !== undefined && searchParams.isFavorite !== null) {
    where.isFavorite = searchParams.isFavorite === "true"
  }

  if (searchParams.language) {
    where.language = searchParams.language
  }

  if (searchParams.tagIds && searchParams.tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: searchParams.tagIds,
        },
      },
    }
  }

    const prompts = await prisma.prompt.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Transform Date objects to strings for JSON serialization
    // This is necessary because Next.js cannot serialize Date objects to JSON
    const transformedPrompts = prompts.map((prompt) => {
      const result: any = {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        body: prompt.body,
        type: prompt.type,
        platform: prompt.platform,
        modelHint: prompt.modelHint,
        language: prompt.language,
        useCase: prompt.useCase,
        clientOrProject: prompt.clientOrProject,
        status: prompt.status,
        isFavorite: prompt.isFavorite,
        version: prompt.version,
        changelog: prompt.changelog,
        notes: prompt.notes,
        usageCount: prompt.usageCount,
        lastUsedAt: prompt.lastUsedAt ? prompt.lastUsedAt.toISOString() : null,
        categoryId: prompt.categoryId,
        category: prompt.category ? {
          id: prompt.category.id,
          name: prompt.category.name,
          slug: prompt.category.slug,
        } : null,
        tags: prompt.tags.map((pt) => ({
          promptId: pt.promptId,
          tagId: pt.tagId,
          tag: {
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
          },
        })),
        createdAt: prompt.createdAt.toISOString(),
        updatedAt: prompt.updatedAt.toISOString(),
      }
      return result
    })

    return { items: transformedPrompts, total: transformedPrompts.length }
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          prompts: true,
        },
      },
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  })

  // Transform Date objects to strings for JSON serialization
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parentId: cat.parentId,
    sortOrder: cat.sortOrder,
    parent: cat.parent ? {
      id: cat.parent.id,
      name: cat.parent.name,
      slug: cat.parent.slug,
      parentId: cat.parent.parentId,
      sortOrder: cat.parent.sortOrder,
    } : null,
    children: cat.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      parentId: child.parentId,
      sortOrder: child.sortOrder,
    })),
    _count: cat._count,
  }))
}

async function getTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          prompts: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  // Transform Date objects to strings for JSON serialization
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    _count: tag._count,
  }))
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    categoryId?: string
    tagIds?: string | string[]
    platform?: string
    status?: string
    isFavorite?: string
    language?: string
  }
}) {
  const tagIds = Array.isArray(searchParams.tagIds)
    ? searchParams.tagIds
    : searchParams.tagIds
    ? [searchParams.tagIds]
    : []

  const [prompts, categories, tags] = await Promise.all([
    getPrompts({ ...searchParams, tagIds }),
    getCategories(),
    getTags(),
  ])

  // Prompts are already transformed in getPrompts function

  return (
    <div className="flex gap-6">
      <div className="w-64 flex-shrink-0">
        <PromptFilters
          categories={categories}
          tags={tags}
          initialFilters={searchParams}
        />
      </div>
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Prompts
          </h1>
          <p className="text-gray-600 font-medium">
            {prompts.total} prompt{prompts.total !== 1 ? "s" : ""} found
          </p>
        </div>
        <PromptList prompts={prompts.items} />
      </div>
    </div>
  )
}
