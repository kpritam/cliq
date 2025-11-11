import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

// Load .env file
dotenvConfig({ path: resolve(process.cwd(), '.env') })

const { ALGOLIA_APP_ID, ALGOLIA_API_KEY, ALGOLIA_INDEX_NAME, ENABLE_AI_SEARCH } = process.env

const algoliaConfigured = Boolean(ALGOLIA_APP_ID && ALGOLIA_API_KEY && ALGOLIA_INDEX_NAME)

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Cliq',
  tagline: 'Build Your Own CLI Coding Agent — From Zero to AI-Powered Dev Companion',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://kpritam.github.io',
  baseUrl: '/cliq/',
  trailingSlash: true,

  customFields: {
    aiSearchEnabled: ENABLE_AI_SEARCH === '1',
    aiProvider: 'none',
  },

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          'Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS. Step-by-step tutorials with hands-on exercises.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content:
          'CLI agent, AI coding assistant, Effect-TS, TypeScript, Vercel AI SDK, Bun, functional programming, AI tools, coding tutorial, terminal agent',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'Cliq Contributors',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'Build Your Own CLI Coding Agent | Cliq',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content:
          'Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS. Step-by-step tutorials with hands-on exercises.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:url',
        content: 'https://kpritam.github.io/cliq/',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:site_name',
        content: 'Cliq',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: 'https://kpritam.github.io/cliq/img/logo.svg',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:alt',
        content: 'Cliq - Build Your Own CLI Coding Agent',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:locale',
        content: 'en_US',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:title',
        content: 'Build Your Own CLI Coding Agent | Cliq',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:description',
        content:
          'Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:image',
        content: 'https://kpritam.github.io/cliq/img/logo.svg',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:image:alt',
        content: 'Cliq - Build Your Own CLI Coding Agent',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'algolia-site-verification',
        content: '2B7BEC80443E78E5',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'canonical',
        href: 'https://kpritam.github.io/cliq/',
      },
    },
  ],

  // GitHub pages deployment config.
  organizationName: 'kpritam',
  projectName: 'cliq',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          editUrl: 'https://github.com/kpritam/cliq/edit/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'keywords',
        content:
          'CLI agent, AI coding assistant, Effect-TS, TypeScript, Vercel AI SDK, Bun, functional programming, AI tools, coding tutorial, terminal agent',
      },
    ],
    image: 'img/logo.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    algolia: algoliaConfigured
      ? {
          appId: ALGOLIA_APP_ID!,
          apiKey: ALGOLIA_API_KEY!,
          indexName: ALGOLIA_INDEX_NAME!,
          contextualSearch: false,
          insights: true,
          searchPagePath: 'search',
        }
      : {
          appId: 'placeholder',
          apiKey: 'placeholder',
          indexName: 'placeholder',
        },
    navbar: {
      logo: {
        alt: 'Cliq Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'build-series/overview',
          position: 'left',
          label: 'Build Series',
        },
        {
          type: 'doc',
          docId: 'mechanics/overview',
          position: 'left',
          label: 'Mechanics',
        },
        {
          type: 'doc',
          docId: 'effect/overview',
          position: 'left',
          label: 'Effect Deep Dive',
        },
        {
          type: 'doc',
          docId: 'reference/overview',
          position: 'left',
          label: 'Reference',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://github.com/kpritam/cliq',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Introduction',
              to: '/docs/introduction',
            },
            {
              label: 'Build Series',
              to: '/docs/build-series/overview',
            },
          ],
        },
        {
          title: 'Deep Dives',
          items: [
            {
              label: 'Effect Deep Dive',
              to: '/docs/effect/overview',
            },
            {
              label: 'Mechanics',
              to: '/docs/mechanics/overview',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/kpritam/cliq',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Effect',
              href: 'https://effect.website/',
            },
            {
              label: 'Vercel AI SDK',
              href: 'https://ai-sdk.dev/docs/introduction',
            },
            {
              label: 'Bun',
              href: 'https://bun.com/',
            },
            {
              label: 'OpenCode',
              href: 'https://opencode.ai/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cliq contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'typescript', 'javascript', 'json'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
