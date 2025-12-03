import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = await prisma.prompt.update({
      where: { id: params.id },
      data: {
        usageCount: {
          increment: 1,
        },
        lastUsedAt: new Date(),
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
    console.error("Error updating prompt usage:", error)
    return NextResponse.json(
      { error: "Failed to update prompt usage" },
      { status: 500 }
    )
  }
}


