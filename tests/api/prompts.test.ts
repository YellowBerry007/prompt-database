/**
 * @jest-environment node
 */

import { POST, GET } from "@/app/api/prompts/route"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    prompt: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe("/api/prompts", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST", () => {
    it("should create a prompt successfully", async () => {
      const mockPrompt = {
        id: "test-id",
        title: "Test Prompt",
        body: "Test body",
        type: "USER",
        platform: "CURSOR",
        language: "en",
        useCase: "Testing",
        status: "DRAFT",
        isFavorite: false,
        version: 1,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        tags: [],
      }

      ;(prisma.prompt.create as jest.Mock).mockResolvedValue(mockPrompt)

      const request = new NextRequest("http://localhost:3000/api/prompts", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Prompt",
          body: "Test body",
          type: "USER",
          platform: "CURSOR",
          language: "en",
          useCase: "Testing",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe("Test Prompt")
      expect(prisma.prompt.create).toHaveBeenCalledTimes(1)
    })

    it("should return 400 for invalid input", async () => {
      const request = new NextRequest("http://localhost:3000/api/prompts", {
        method: "POST",
        body: JSON.stringify({
          title: "", // Invalid: empty title
          body: "Test body",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid input")
    })
  })

  describe("GET", () => {
    it("should return prompts", async () => {
      const mockPrompts = [
        {
          id: "test-id",
          title: "Test Prompt",
          category: null,
          tags: [],
        },
      ]

      ;(prisma.prompt.findMany as jest.Mock).mockResolvedValue(mockPrompts)

      const request = new NextRequest("http://localhost:3000/api/prompts")

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(prisma.prompt.findMany).toHaveBeenCalledTimes(1)
    })

    it("should filter by search query", async () => {
      ;(prisma.prompt.findMany as jest.Mock).mockResolvedValue([])

      const request = new NextRequest(
        "http://localhost:3000/api/prompts?search=test"
      )

      await GET(request)

      expect(prisma.prompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.any(Object) }),
            ]),
          }),
        })
      )
    })
  })
})


