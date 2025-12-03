import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const importSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  prompts: z.array(z.any()),
  categories: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = importSchema.parse(body)

    // Import categories first
    const categoryMap = new Map<string, string>()
    if (data.categories) {
      for (const cat of data.categories) {
        let existing = await prisma.category.findUnique({
          where: { slug: cat.slug },
        })

        if (!existing) {
          existing = await prisma.category.create({
            data: {
              name: cat.name,
              slug: cat.slug,
              sortOrder: cat.sortOrder || 0,
            },
          })
        } else {
          // Update if needed
          existing = await prisma.category.update({
            where: { id: existing.id },
            data: {
              name: cat.name,
              sortOrder: cat.sortOrder || 0,
            },
          })
        }
        categoryMap.set(cat.name, existing.id)
      }

      // Update parent relationships
      for (const cat of data.categories) {
        if (cat.parent) {
          const parentId = categoryMap.get(cat.parent)
          if (parentId) {
            const childId = categoryMap.get(cat.name)
            if (childId) {
              await prisma.category.update({
                where: { id: childId },
                data: { parentId },
              })
            }
          }
        }
      }
    }

    // Import tags
    const tagMap = new Map<string, string>()
    if (data.tags) {
      for (const tag of data.tags) {
        let existing = await prisma.tag.findUnique({
          where: { slug: tag.slug },
        })

        if (!existing) {
          existing = await prisma.tag.create({
            data: {
              name: tag.name,
              slug: tag.slug,
            },
          })
        }
        tagMap.set(tag.name, existing.id)
      }
    }

    // Import prompts
    let importedCount = 0
    for (const promptData of data.prompts) {
      const categoryId = promptData.category
        ? categoryMap.get(promptData.category) || null
        : null

      const prompt = await prisma.prompt.create({
        data: {
          title: promptData.title,
          description: promptData.description,
          body: promptData.body,
          type: promptData.type,
          platform: promptData.platform,
          modelHint: promptData.modelHint,
          language: promptData.language || "en",
          useCase: promptData.useCase,
          clientOrProject: promptData.clientOrProject,
          status: promptData.status || "DRAFT",
          isFavorite: promptData.isFavorite || false,
          version: promptData.version || 1,
          changelog: promptData.changelog,
          notes: promptData.notes,
          categoryId,
          tags: promptData.tags
            ? {
                create: promptData.tags
                  .map((tagName: string) => tagMap.get(tagName))
                  .filter(Boolean)
                  .map((tagId: string) => ({ tagId })),
              }
            : undefined,
        },
      })
      importedCount++
    }

    return NextResponse.json({
      success: true,
      imported: {
        prompts: importedCount,
        categories: categoryMap.size,
        tags: tagMap.size,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid import format", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error importing prompts:", error)
    return NextResponse.json(
      { error: "Failed to import prompts" },
      { status: 500 }
    )
  }
}


