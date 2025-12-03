# Prompt Database

A full-stack web application for managing and organizing AI prompts. Built with Next.js, Prisma, and SQLite.

## Features

- ✅ Create, edit, and delete prompts
- ✅ Organize prompts with categories and tags
- ✅ Filter prompts by category, tags, platform, status, and more
- ✅ Full-text search across title, description, and body
- ✅ Usage tracking (usage count and last used date)
- ✅ Copy prompts to clipboard with one click
- ✅ Duplicate prompts
- ✅ Mark prompts as favorites
- ✅ Export/import prompts in JSON format
- ✅ Hierarchical category structure
- ✅ Modern UI with TailwindCSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod

## Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Prompt database"
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

The default `.env` file should contain:
```
DATABASE_URL="file:./dev.db"
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed the database with sample data
npm run db:seed
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Run migrations
```bash
npm run db:migrate
```

### Push schema changes (for development)
```bash
npm run db:push
```

### Seed the database
```bash
npm run db:seed
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Docker

### Quick Start

De snelste manier om de applicatie te draaien met Docker:

```bash
# Build en start de container
docker-compose up -d --build

# Initialiseer de database
docker-compose exec app npx prisma migrate deploy

# (Optioneel) Seed de database
docker-compose exec app npm run db:seed
```

De applicatie is nu beschikbaar op http://localhost:3300

### Development Mode

Voor development met hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Handige Commands

```bash
# Logs bekijken
docker-compose logs -f app

# Container stoppen
docker-compose down

# Container opnieuw opbouwen
docker-compose up -d --build --force-recreate
```

Voor meer gedetailleerde Docker instructies, zie [DOCKER.md](./DOCKER.md)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── prompts/          # Prompt pages
│   ├── categories/       # Category pages
│   └── tags/             # Tag pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── prompt/           # Prompt-related components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema and migrations
├── tests/                 # Test files
└── public/                # Static assets
```

## API Endpoints

### Prompts
- `GET /api/prompts` - List prompts (with filters)
- `POST /api/prompts` - Create a prompt
- `GET /api/prompts/[id]` - Get a prompt
- `PUT /api/prompts/[id]` - Update a prompt
- `DELETE /api/prompts/[id]` - Delete a prompt
- `PATCH /api/prompts/[id]/usage` - Track prompt usage

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create a category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create a tag
- `PUT /api/tags/[id]` - Update a tag
- `DELETE /api/tags/[id]` - Delete a tag

### Export/Import
- `GET /api/export/prompts` - Export all prompts as JSON
- `POST /api/import/prompts` - Import prompts from JSON

## Usage

### Creating a Prompt

1. Click "New Prompt" in the top bar
2. Fill in the required fields (title, body, use case)
3. Optionally add description, category, tags, and other metadata
4. Click "Save"

### Filtering Prompts

Use the sidebar filters to:
- Filter by category
- Filter by tags (multiple selection)
- Filter by platform
- Filter by status
- Filter by language
- Show only favorites

### Searching

Use the search bar in the top bar to search across:
- Prompt titles
- Descriptions
- Prompt body content

### Export/Import

**Export:**
1. Click "Export" in the top bar
2. A JSON file will be downloaded with all prompts, categories, and tags

**Import:**
1. Click "Import" in the top bar
2. Select a JSON file exported from this application
3. Click "Import"
4. The prompts will be imported (categories and tags will be created if they don't exist)

### Copying a Prompt

1. Open a prompt
2. Click "Copy Prompt" button
3. The prompt body will be copied to your clipboard
4. Usage count and last used date will be automatically updated

## License

MIT

