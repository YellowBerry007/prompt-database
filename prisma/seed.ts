import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const category1 = await prisma.category.upsert({
    where: { slug: "productivity" },
    update: {},
    create: {
      name: "Productivity",
      slug: "productivity",
      sortOrder: 1,
    },
  })

  const category2 = await prisma.category.upsert({
    where: { slug: "coding" },
    update: {},
    create: {
      name: "Coding",
      slug: "coding",
      sortOrder: 2,
    },
  })

  // Create tags
  const tag1 = await prisma.tag.upsert({
    where: { slug: "refactoring" },
    update: {},
    create: {
      name: "Refactoring",
      slug: "refactoring",
    },
  })

  const tag2 = await prisma.tag.upsert({
    where: { slug: "documentation" },
    update: {},
    create: {
      name: "Documentation",
      slug: "documentation",
    },
  })

  // Create sample prompts
  await prisma.prompt.upsert({
    where: { id: "sample-1" },
    update: {},
    create: {
      id: "sample-1",
      title: "Code Review Assistant",
      description: "A prompt to help review and improve code quality",
      body: "Please review the following code and provide suggestions for improvement, focusing on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Readability and maintainability",
      type: "SYSTEM",
      platform: "CURSOR",
      modelHint: "gpt-4",
      language: "en",
      useCase: "Code review",
      status: "PRODUCTION",
      isFavorite: true,
      categoryId: category2.id,
      tags: {
        create: [
          { tagId: tag1.id },
        ],
      },
    },
  })

  await prisma.prompt.upsert({
    where: { id: "sample-2" },
    update: {},
    create: {
      id: "sample-2",
      title: "Documentation Generator",
      description: "Generate comprehensive documentation for code",
      body: "Generate detailed documentation for the following code, including:\n- Function descriptions\n- Parameter explanations\n- Return value descriptions\n- Usage examples",
      type: "USER",
      platform: "CHATGPT",
      language: "en",
      useCase: "Documentation",
      status: "TESTED",
      categoryId: category2.id,
      tags: {
        create: [
          { tagId: tag2.id },
        ],
      },
    },
  })

  console.log("Seed data created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


