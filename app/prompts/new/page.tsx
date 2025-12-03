import { PromptForm } from "@/components/prompt/PromptForm"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  })

  return categories
}

async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return tags
}

export default async function NewPromptPage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  return <PromptForm categories={categories} tags={tags} />
}
