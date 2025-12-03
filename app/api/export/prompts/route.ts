import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    const categories = await prisma.category.findMany({
      include: {
        parent: true,
      },
    })

    const tags = await prisma.tag.findMany()

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      prompts: prompts.map((prompt) => ({
        ...prompt,
        tags: prompt.tags.map((pt) => pt.tag.name),
        category: prompt.category?.name || null,
      })),
      categories: categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent?.name || null,
        sortOrder: cat.sortOrder,
      })),
      tags: tags.map((tag) => ({
        name: tag.name,
        slug: tag.slug,
      })),
    }

    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="prompts-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting prompts:", error)
    return NextResponse.json(
      { error: "Failed to export prompts" },
      { status: 500 }
    )
  }
}


