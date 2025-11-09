# Cliq Documentation Site

The documentation lives in `/website/` and is built with [Docusaurus 3](https://docusaurus.io/).

## Prerequisites

- Node.js ≥ 20 (Bun 1.1 is available via the root repository)
- npm ≥ 10 (ships with Node 20)

## Install dependencies

```bash
npm install
```

## Start local docs

```bash
npm start
```

This runs the dev server on <http://localhost:3000> with hot reload.

## Build static output

```bash
npm run build
```

## Preview the production build

```bash
npm run serve
```

## Maintenance checklist

- Run `npm run lint` at the repo root before publishing.
- Run `npm run build` after every documentation edit (already enforced in this project plan).
- Update navigation links in `docusaurus.config.ts` if you add new top-level sections.
