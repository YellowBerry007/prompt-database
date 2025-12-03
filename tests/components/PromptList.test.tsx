import { render, screen } from "@testing-library/react"
import { PromptList } from "@/components/prompt/PromptList"

const mockPrompts = [
  {
    id: "1",
    title: "Test Prompt 1",
    description: "Test description",
    platform: "CURSOR",
    status: "PRODUCTION",
    isFavorite: true,
    lastUsedAt: new Date().toISOString(),
    usageCount: 5,
    category: { name: "Coding" },
    tags: [{ tag: { name: "refactoring" } }],
  },
  {
    id: "2",
    title: "Test Prompt 2",
    description: null,
    platform: "CHATGPT",
    status: "DRAFT",
    isFavorite: false,
    lastUsedAt: null,
    usageCount: 0,
    category: null,
    tags: [],
  },
]

describe("PromptList", () => {
  it("renders prompts", () => {
    render(<PromptList prompts={mockPrompts} />)

    expect(screen.getByText("Test Prompt 1")).toBeInTheDocument()
    expect(screen.getByText("Test Prompt 2")).toBeInTheDocument()
  })

  it("renders empty state when no prompts", () => {
    render(<PromptList prompts={[]} />)

    expect(screen.getByText("No prompts found.")).toBeInTheDocument()
  })

  it("displays prompt metadata", () => {
    render(<PromptList prompts={[mockPrompts[0]]} />)

    expect(screen.getByText("CURSOR")).toBeInTheDocument()
    expect(screen.getByText("PRODUCTION")).toBeInTheDocument()
    expect(screen.getByText("Coding")).toBeInTheDocument()
    expect(screen.getByText("refactoring")).toBeInTheDocument()
  })
})


