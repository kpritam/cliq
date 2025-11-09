import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  cliqDocs: [
    {
      type: 'category',
      label: 'Build Series',
      link: {
        type: 'doc',
        id: 'build-series/overview',
      },
      items: [
        {
          type: 'doc',
          id: 'build-series/01-bootstrap-runtime',
          label: '01 → Bootstrap runtime',
        },
        {
          type: 'doc',
          id: 'build-series/02-provider-config',
          label: '02 → Provider config',
        },
        {
          type: 'doc',
          id: 'build-series/03-first-tool-readfile',
          label: '03 → Read file tool',
        },
        {
          type: 'doc',
          id: 'build-series/04-agent-loop',
          label: '04 → Agent loop',
        },
        {
          type: 'doc',
          id: 'build-series/05-streaming',
          label: '05 → Streaming',
        },
        {
          type: 'doc',
          id: 'build-series/06-search-glob-grep',
          label: '06 → Search tools',
        },
        {
          type: 'doc',
          id: 'build-series/07-edit-preview-diff-gating',
          label: '07 → Edit with diff',
        },
        {
          type: 'doc',
          id: 'build-series/08-markdown-rendering',
          label: '08 → Markdown',
        },
        {
          type: 'doc',
          id: 'build-series/09-session-persistence',
          label: '09 → Sessions',
        },
        {
          type: 'doc',
          id: 'build-series/10-add-a-custom-tool',
          label: '10 → Custom tools',
        },
        {
          type: 'doc',
          id: 'build-series/11-performance-and-concurrency',
          label: '11 → Concurrency & tuning',
        },
      ],
    },
    {
      type: 'category',
      label: 'Mechanics',
      link: {
        type: 'doc',
        id: 'mechanics/overview',
      },
      items: [
        'mechanics/vercel-ai-sdk',
        'mechanics/tool-execution',
        'mechanics/diff-rendering',
        'mechanics/markdown-rendering',
        'mechanics/terminal-ui',
      ],
    },
    {
      type: 'category',
      label: 'Effect Deep Dive',
      link: {
        type: 'doc',
        id: 'effect/overview',
      },
      items: [
        'effect/effect-fundamentals',
        'effect/layers-and-dependency-injection',
        'effect/services-and-managed-runtimes',
        'effect/error-recovery',
        'effect/performance-and-concurrency',
        'effect/prompt-design',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      link: {
        type: 'doc',
        id: 'reference/overview',
      },
      items: [
        'reference/commands',
        'reference/config',
        'reference/services',
        'reference/types',
        'reference/tools',
      ],
    },
  ],
}

export default sidebars
