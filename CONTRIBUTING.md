# Contributing to Cliq

Thank you for your interest in improving Cliq. This guide explains how to get set up, propose changes, and keep the project healthy. Contributions of any size are welcome—bug fixes, docs updates, tooling improvements, and new tutorials all help the community.

## Development Workflow

### Prerequisites

- macOS, Linux, or WSL2
- [Bun](https://bun.sh/docs/installation) ≥ 1.1 (preferred install command: `curl -fsSL https://bun.sh/install | bash`)
- TypeScript ≥ 5.9 (installed automatically as a peer dependency)
- Optional: Node.js ≥ 20 for website tooling

### Repository Setup

```bash
git clone https://github.com/kpritam/cliq.git
cd cliq

# Install dependencies for the CLI and website
bun install
cd website && npm install && cd ..
```

Set up environment variables by copying the template and filling in your own API keys:

```bash
cp .env.example .env
```

### Useful Commands

| Task | Command |
| --- | --- |
| Start interactive CLI chat | `bun start` |
| Run CLI in watch mode | `bun run dev` |
| Build CLI bundle | `bun run build` |
| Type check CLI | `bun run typecheck` |
| Lint & format CLI | `bun run lint` / `bun run format` |
| Run both lint and typecheck | `bun run check` |
| Start docs site locally | `cd website && npm run start` |
| Build docs site | `cd website && npm run build` |

### Testing Changes

1. Make sure `bun run check` succeeds.
2. For documentation edits, run `npm run build` in `website/` to catch MDX issues.
3. When changing tooling or configuration, note any manual steps in the PR description.

## Pull Request Guidelines

1. **Fork first**: Work from a feature branch based on `main`.
2. **Small, focused PRs**: Stick to one topic per pull request.
3. **Update docs**: Reflect behavior changes in README or tutorials.
4. **Link issues**: Reference related issues using GitHub keywords where applicable.
5. **Checklist** before requesting review:
   - Tests and checks pass locally.
   - No debug logs or commented-out code.
   - New files include appropriate headers or licensing context if needed.
   - PR title is descriptive (imperative mood preferred).
6. **Review process**: Expect at least one maintainer review. Please respond to feedback within seven days or leave a note if you need more time.

## Branch Naming

Use a descriptive prefix:

- `feat/your-feature-name`
- `fix/issue-number`
- `docs/update-topic`

## Commit Message Style

Follow [Conventional Commits](https://www.conventionalcommits.org/) when possible:

- `feat(cli): add session list command`
- `fix(docs): clarify Bun install steps`
- `chore: update dependencies`

## Release Process

Maintainers handle releases. Contributors can help by ensuring CHANGELOG entries are added when introducing user-facing changes.

## Questions & Support

- Open a GitHub Discussion or issue for general questions.
- For security vulnerabilities, email `security@cliq.dev` instead of filing a public issue.

We appreciate your expertise and look forward to collaborating!

