# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

Cliq is an Effect-TS-based AI coding assistant CLI with multi-provider support (Anthropic, OpenAI, Google). The project follows functional programming principles with Effect-TS, emphasizing type safety, pure functions, and explicit error handling through Effects.

## Development Commands

### Running the CLI
- `bun start` - Start interactive chat mode
- `bun run dev` - Start with watch mode (auto-reload on changes)

### Build and Type Checking
- `bun run build` - Build CLI to dist/ directory (target: bun)
- `bun run typecheck` - Run TypeScript type checking without emitting files

### Code Quality
- `bun run lint` - Run Biome linter checks
- `bun run format` - Format code with Biome (auto-fix)
- `bun run check` - Run both linting and type checking

### Environment Setup
Copy `.env` to configure API keys:
```env
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
AI_PROVIDER=anthropic  # Optional: defaults to first available
AI_MODEL=claude-haiku-4-5  # Optional: provider defaults
AI_TEMPERATURE=0.2
AI_MAX_STEPS=10
```

## Architecture

### Layer-Based Dependency Injection

The application uses Effect-TS Layer composition for dependency injection. All services are defined as `Context.Tag` and composed into a `MainLayer` in src/cli.ts:

```
MainLayer
├── BunContext (FileSystem, Path, Command, Terminal)
├── PlatformStack (Paths)
├── StorageLayer (FileKeyValueStore)
├── ConfigStack (ConfigService)
├── SessionStack (SessionStore)
├── ToolsStack (FileTools, SearchTools, EditTools)
├── VercelStack (VercelAI)
└── RegistryStack (ToolRegistry)
```

**Layer Dependencies:**
- PlatformStack depends on BunContext
- StorageLayer depends on PlatformStack + BunContext
- ConfigStack depends on StorageLayer
- SessionStack depends on StorageLayer
- ToolsStack depends on BunContext
- VercelStack depends on ConfigStack
- RegistryStack depends on ToolsStack + VercelStack

### Core Services

**ConfigService** (src/services/ConfigService.ts)
- Manages AI provider/model configuration
- Persists settings via FileKeyValueStore
- Auto-detects provider from environment variables
- Provides `load`, `current`, and `setProvider` operations

**VercelAI** (src/services/VercelAI.ts)
- Wraps Vercel AI SDK with Effect-TS patterns
- Creates provider-specific LanguageModel instances
- Handles `streamChat` with tool execution via `streamText`
- Supports multi-step tool calling with `stepCountIs`

**ToolRegistry** (src/services/ToolRegistry.ts)
- Registers all Effect-based tools as Vercel AI SDK tools
- Uses ManagedRuntime for each tool service (FileTools, SearchTools, EditTools)
- Adapts Effect functions to Vercel AI SDK format via VercelToolAdapters

**SessionStore** (src/persistence/SessionStore.ts)
- Persists chat sessions and messages
- Uses FileKeyValueStore for JSON storage
- Session format includes id, path, title, and timestamps

**FileKeyValueStore** (src/persistence/FileKeyValueStore.ts)
- Simple file-based key-value storage
- Stores data in `~/.cliq/storage/{namespace}/{key}.json`
- Operations: get, set, remove, listKeys, clearNamespace

### Tool System

Tools are Effect-based services that get adapted to Vercel AI SDK format:

**FileTools** (src/tools/FileTools.ts)
- `readFile`: Read file contents with path validation
- `writeFile`: Write files (ensures within CWD)
- `fileExists`: Check file existence and type
- `renderMarkdown`: Parse and render markdown with metadata extraction

**SearchTools** (src/tools/SearchTools.ts)
- `searchByGlob`: Pattern-based file search
- `searchByContent`: Content search using ripgrep

**EditTools** (src/tools/EditTools.ts)
- `editFile`: Apply diffs to files with validation
- Shows unified diff format for preview

**Tool Adapter Pattern:**
- Each tool service uses ManagedRuntime in ToolRegistry
- Effect functions wrapped in async promises for Vercel AI SDK
- Schema validation via @effect/schema
- Tool parameters/results are strongly typed

### Chat Program

**ChatProgram** (src/chat/ChatProgram.ts)
- Main interactive loop using readline
- Slash commands: `/model`, `/exit`, `/help`
- Message flow: User input → SessionStore → VercelAI.streamChat → Stream response → SessionStore
- System prompt built in src/chat/systemPrompt.ts with provider/model context
- Tool calls displayed via ToolResultPresenter (src/chat/ui/ToolResultPresenter.ts)

## Effect-TS Development Patterns

### Service Definition
All services use `Context.Tag`:
```typescript
export class MyService extends Context.Tag("MyService")<
  MyService,
  { readonly myMethod: Effect.Effect<Result, Error> }
>() {}
```

### Layer Creation
Services are created as Layers with dependencies:
```typescript
export const layer = Layer.effect(
  MyService,
  Effect.all([Dependency1, Dependency2]).pipe(
    Effect.map(([dep1, dep2]) => ({
      myMethod: /* implementation */
    }))
  )
)
```

### Effect Composition
- Use `Effect.gen` for sequential operations with generator syntax
- Use `pipe` with `Effect.flatMap`, `Effect.map`, `Effect.tap` for transformations
- Use `Effect.all` for parallel operations
- Always handle errors explicitly with `Effect.catchAll`, `Effect.orDie`, etc.

### Best Practices
- No `any` types or type assertions
- All IO operations return Effects
- Pure functions - side effects wrapped in Effect
- Use Schema for runtime validation
- Service dependencies via Context.Tag
- Avoid promises/callbacks - use Effect primitives

## Project Structure Notes

- Entry point: src/cli.ts (composes all layers and runs ChatProgram)
- TypeScript config: strict mode, bundler module resolution, ESNext target
- Package type: "module" (ESM)
- Runtime: Bun (not Node.js)
- Code formatter: Biome (not Prettier/ESLint)
- Storage location: ~/.cliq/storage/
