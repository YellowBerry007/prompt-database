import { PromptForm } from "@/components/prompt/PromptForm"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

async function getPrompt(id: string) {
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  return prompt
}

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

export default async function PromptDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [prompt, categories, tags] = await Promise.all([
    getPrompt(params.id),
    getCategories(),
    getTags(),
  ])

  if (!prompt) {
    notFound()
  }

  return <PromptForm prompt={prompt} categories={categories} tags={tags} />
}
