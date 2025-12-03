import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPromptSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  body: z.string().min(1),
  type: z.enum(["SYSTEM", "USER", "TOOL"]),
  platform: z.enum(["CHATGPT", "CURSOR", "MIDJOURNEY", "SUNO", "OTHER"]),
  modelHint: z.string().optional(),
  language: z.string().default("en"),
  useCase: z.string().min(1),
  clientOrProject: z.string().optional(),
  status: z.enum(["DRAFT", "TESTED", "PRODUCTION"]).default("DRAFT"),
  isFavorite: z.boolean().default(false),
  version: z.number().default(1),
  changelog: z.string().optional(),
  notes: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const categoryId = searchParams.get("categoryId")
    const tagIds = searchParams.getAll("tagIds")
    const platform = searchParams.get("platform")
    const status = searchParams.get("status")
    const isFavorite = searchParams.get("isFavorite")
    const language = searchParams.get("language")

    const where: any = {}

    if (search) {
      // SQLite doesn't support case-insensitive mode, so we use contains
      const searchLower = search.toLowerCase()
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { body: { contains: search } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = status
    }

    if (isFavorite !== null && isFavorite !== undefined) {
      where.isFavorite = isFavorite === "true"
    }

    if (language) {
      where.language = language
    }

    if (tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: tagIds,
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

    return NextResponse.json({ items: prompts, total: prompts.length })
  } catch (error) {
    console.error("Error fetching prompts:", error)
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createPromptSchema.parse(body)

    const { tagIds, ...promptData } = data

    const prompt = await prisma.prompt.create({
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

    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating prompt:", error)
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    )
  }
}

