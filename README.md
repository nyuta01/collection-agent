# Collection Agent

A flexible collection management system powered by AI agents. Manage collections and items with arbitrary data structures based on JSON Schema definitions.

## Features

### Collection Management
- **Schema-based data structure**: Define data structure for each collection using JSON Schema
- **CRUD operations**: Create, read, update, and delete collections
- **Search functionality**: Search collections by title
- **Validation**: Strict schema validation with Ajv

### Item Management
- **Schema compliance**: Manage items according to collection schemas
- **CRUD operations**: Add, get, update, and delete items
- **Fuzzy search**: Fast item search with Fuse.js
- **Time-sortable IDs**: ULID-based time-sortable identifiers

### AI Agent
- **Natural language interaction**: Operate collections and items through chat interface
- **Tool execution**: 12 types of tools (collection/item operations, search)
- **Web search integration**: Fetch latest information using OpenAI's web search and add to collections
- **Streaming support**: Real-time AI response display
- **Multi-language support**: Automatic response in user's language

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Drizzle ORM
- **Storage**: MinIO (S3-compatible)
- **AI**: OpenAI GPT-5 + AI SDK v5
- **Validation**: Ajv (JSON Schema), Zod
- **Search**: Fuse.js
- **Testing**: Vitest

## Setup

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL
- MinIO

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env file and configure:
# - DATABASE_URL
# - MINIO_* (MinIO configuration)
# - OPENAI_API_KEY

# Database migration
pnpm drizzle-kit push

# MinIO setup
# Start MinIO server and create bucket
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### UI Operations

1. **Home** (`/`): Collection list and item management
2. **AI Agent** (`/agent`): Operate collections and items with natural language
3. **Collections** (`/collections`): View collection details

### AI Agent Usage Examples

```
# Create a collection
"Create a book collection with title, author, publication year, genre, and read status fields"

# Add an item
"Add a book called 1984. Author is George Orwell, published in 1949"

# Web search and add
"Search for the latest bestseller novels and add the most popular one to the collection"

# Search
"Find books by Haruki Murakami"

# List all
"Show all collections"
```

### API Usage Examples

```typescript
// Create a collection
const collection = await Collection.create({
  title: 'Books',
  description: 'My book collection',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      author: { type: 'string' },
      year: { type: 'integer', minimum: 1000, maximum: 3000 },
      genre: { type: 'string', enum: ['fiction', 'non-fiction', 'mystery', 'sci-fi'] },
      read: { type: 'boolean' }
    },
    required: ['title', 'author']
  }
});

// Add an item
const item = await Item(collection).add({
  title: '1984',
  author: 'George Orwell',
  year: 1949,
  genre: 'fiction',
  read: true
});

// Search
const results = await Item(collection).search('Orwell');
```

## Project Structure

```
src/
├── app/
│   ├── agent/              # AI agent UI
│   ├── api/
│   │   ├── agent/          # AI agent API
│   │   ├── collections/    # Collections API
│   │   └── items/          # Items API
│   ├── collections/        # Collections list UI
│   └── page.tsx            # Home page
├── lib/
│   ├── agent/
│   │   └── tools.ts        # AI agent tool definitions
│   ├── collection.ts       # Collection management logic
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   └── schema.ts       # Drizzle schema
│   └── storage.ts          # MinIO storage
└── __tests__/              # Tests
```

## Testing

```bash
# Run tests
pnpm test

# UI mode
pnpm test:ui

# Single run
pnpm test:run
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=collections
MINIO_USE_SSL=false

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

## AI Agent Features

### Available Tools

**Collection Management:**
- `listCollections`: List all collections
- `getCollection`: Get details of a specific collection
- `createCollection`: Create a new collection
- `updateCollection`: Update a collection
- `deleteCollection`: Delete a collection
- `searchCollections`: Search collections by title

**Item Management:**
- `listItems`: List all items in a collection
- `getItem`: Get a specific item
- `addItem`: Add a new item to a collection
- `updateItem`: Update an item
- `deleteItem`: Delete an item
- `searchItems`: Search items in a collection

**External Information:**
- `web_search`: Fetch latest information via web search

### Features

- **Streaming responses**: Real-time AI response display
- **Tool execution visualization**: Display executed tools with their inputs and outputs
- **Detailed explanations**: Detailed explanations after all tool executions
- **Error handling**: Provide causes and solutions when errors occur
- **Multi-language support**: Automatic response in user's language

## For Developers

### Type Safety
- No `any` types allowed
- Proper type definitions for all API responses
- Runtime validation with Zod schemas

### Coding Conventions
- Follow ESLint configuration
- Don't change design without permission
- Write tests

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
