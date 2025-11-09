# Cliq - Effect-TS AI Assistant

A functional, Effect-TS-based AI coding assistant CLI with multi-provider support.

> **Note**: This project is heavily inspired by [OpenCode](https://opencode.ai/), an open-source AI coding agent built for the terminal. Cliq explores similar concepts using Effect-TS for functional programming patterns.

## Features

- **Interactive Mode by Default**: Just run `bun start` to enter chat
- **Slash Commands**: Use `/model`, `/help`, `/exit` inside chat session
- **Multi-Provider Support**: Anthropic, OpenAI, Google (configured via environment variables)
- **Effect-TS Architecture**: Fully functional with proper Effect patterns
- **File Tools**: Read, write, edit files with diff preview
- **Search Tools**: Glob patterns and ripgrep integration
- **Session Management**: Persistent session and message storage under `~/.cliq/storage`
- **Vercel AI SDK Integration**: Uses Vercel's `ai` package with custom Effect-based tool adapters

## Demo

[![asciicast](https://asciinema.org/a/gmYWqWQFCmspTa2FVgayHUnDr.svg)](https://asciinema.org/a/gmYWqWQFCmspTa2FVgayHUnDr)

## Documentation

The full build series, Effect deep dives, tool mechanics, and reference docs are published at:

https://kpritam.github.io/cliq/

Key entry points:
- Build Series Overview: `/docs/build-series/overview`
- Mechanics Overview: `/docs/mechanics/overview`
- Effect Deep Dive: `/docs/effect/overview`
- Reference Index: `/docs/reference/overview`

## Quick Start

### Install Bun

```bash
# macOS & Linux
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal so the `bun` binary is on your PATH.

```bash
# Install dependencies
bun install

# Start interactive chat
bun start

# Build
bun run build
```

> Cliq targets Bun 1.1+. Porting to Node.js means swapping the Bun platform layer for the Node platform, but the Effect architecture and tooling patterns stay the same.

## Usage

### Interactive Mode

```
bun start
```

The CLI starts directly in interactive chat mode. Type your messages and press Enter.

### Slash Commands

- `/model` - Change AI model during session
- `/help` - Show available commands
- `/exit` - Exit the chat

### Configuration

Set environment variables in `.env`:

```env
# Choose your provider
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Optional: Override defaults
AI_PROVIDER=anthropic
AI_MODEL=claude-haiku-4-5
AI_TEMPERATURE=0.2
AI_MAX_STEPS=10
```

## Architecture

### Layer Structure

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

### Effect-TS Principles

- All side effects wrapped in Effect
- No `any` or type assertions
- Pure functions with explicit error handling
- Context.Tag for service definitions
- Layer-based dependency injection

## Project Structure

```
src/
├── cli.ts                      # Entry point that composes all layers
├── adapters/                   # Tool adapters for the Vercel AI SDK
├── chat/                       # Chat loop, readline wiring, terminal UI
├── persistence/                # File-based storage and session persistence
├── services/                   # Config, tool registry, provider integrations
│   └── config/                 # Environment + persistence helpers
├── tools/                      # File, search, edit, and directory tools
│   └── search/                 # Ripgrep parser utilities
├── types/                      # Shared branded types and schemas
└── utils/                      # Diff rendering and markdown parsing helpers
```

## Development

Effect-TS best practices:
- Use `Effect.gen` for sequential operations
- Use `pipe` for transformations
- Avoid promises/callbacks (use Effect primitives)
- All IO operations return Effects
- Service dependencies via Context.Tag

