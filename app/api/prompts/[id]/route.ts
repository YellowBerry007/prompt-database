import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updatePromptSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  body: z.string().min(1).optional(),
  type: z.enum(["SYSTEM", "USER", "TOOL"]).optional(),
  platform: z.enum(["CHATGPT", "CURSOR", "MIDJOURNEY", "SUNO", "OTHER"]).optional(),
  modelHint: z.string().optional(),
  language: z.string().optional(),
  useCase: z.string().min(1).optional(),
  clientOrProject: z.string().optional(),
  status: z.enum(["DRAFT", "TESTED", "PRODUCTION"]).optional(),
  isFavorite: z.boolean().optional(),
  version: z.number().optional(),
  changelog: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updatePromptSchema.parse(body)

    const { tagIds, ...promptData } = data

    // First, delete existing tags
    await prisma.promptTag.deleteMany({
      where: { promptId: params.id },
    })

    // Then update the prompt and create new tags
    const prompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        ...promptData,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json(prompt)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating prompt:", error)
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.prompt.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}


