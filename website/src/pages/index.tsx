import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'
import Layout from '@theme/Layout'
import { useEffect, useRef, type ReactNode } from 'react'

import styles from './index.module.css'

const episodes = [
  {
    number: 'Ep 1',
    title: 'Bootstrap the Runtime',
    description:
      'Set up Effect-TS layers, Bun context, and dependency injection to create a composable foundation.',
    duration: '15 min',
    level: 'Beginner',
    link: '/docs/build-series/01-bootstrap-runtime',
  },
  {
    number: 'Ep 2',
    title: 'Provider Configuration',
    description:
      'Build a flexible config system supporting Anthropic, OpenAI, and Google with environment-based detection.',
    duration: '12 min',
    level: 'Beginner',
    link: '/docs/build-series/02-provider-config',
  },
  {
    number: 'Ep 3',
    title: 'First Tool: Read File',
    description:
      'Create your first tool with schema validation, path safety, and Error handling through Effects.',
    duration: '18 min',
    level: 'Intermediate',
    link: '/docs/build-series/03-first-tool-readfile',
  },
  {
    number: 'Ep 4',
    title: 'The Agent Loop',
    description:
      'Wire up the core orchestration loop connecting user input, LLM responses, and tool execution.',
    duration: '20 min',
    level: 'Intermediate',
    link: '/docs/build-series/04-agent-loop',
  },
  {
    number: 'Ep 5',
    title: 'Streaming Responses',
    description:
      'Implement real-time streaming UI with Vercel AI SDK for responsive, progressive output.',
    duration: '16 min',
    level: 'Intermediate',
    link: '/docs/build-series/05-streaming',
  },
  {
    number: 'Ep 6',
    title: 'Search: Glob & Grep',
    description:
      'Add powerful file search and content matching using ripgrep with type-safe adapters.',
    duration: '14 min',
    level: 'Intermediate',
    link: '/docs/build-series/06-search-glob-grep',
  },
  {
    number: 'Ep 7',
    title: 'Edit with Diff Preview',
    description: 'Build safe file editing with unified diff rendering and user-controlled gating.',
    duration: '22 min',
    level: 'Advanced',
    link: '/docs/build-series/07-edit-preview-diff-gating',
  },
  {
    number: 'Ep 8',
    title: 'Markdown Rendering',
    description:
      'Parse and display beautiful markdown with syntax highlighting and metadata extraction.',
    duration: '12 min',
    level: 'Intermediate',
    link: '/docs/build-series/08-markdown-rendering',
  },
  {
    number: 'Ep 9',
    title: 'Session Persistence',
    description: 'Implement chat history and session management with file-based key-value storage.',
    duration: '16 min',
    level: 'Intermediate',
    link: '/docs/build-series/09-session-persistence',
  },
  {
    number: 'Ep 10',
    title: 'Add a Custom Tool',
    description:
      'Learn the pattern for creating your own tools and integrating them into the registry.',
    duration: '18 min',
    level: 'Advanced',
    link: '/docs/build-series/10-add-a-custom-tool',
  },
  {
    number: 'Ep 11',
    title: 'Performance & Concurrency',
    description:
      'Optimize with concurrent operations, caching strategies, and Effect-TS performance patterns.',
    duration: '20 min',
    level: 'Advanced',
    link: '/docs/build-series/11-performance-and-concurrency',
  },
]

const features = [
  {
    icon: '🔄',
    title: 'Prompt Orchestration',
    description: 'Master multi-turn conversations with context management and streaming responses',
  },
  {
    icon: '🛠️',
    title: 'Tool Execution',
    description: 'Build type-safe tools with schema validation and Effect-based error handling',
  },
  {
    icon: '⚡',
    title: 'Message Streaming',
    description: 'Implement real-time UI updates with progressive rendering and live tool feedback',
  },
  {
    icon: '🤖',
    title: 'LLM Integration',
    description:
      'Swap between Anthropic, OpenAI, and Google providers with zero architectural changes',
  },
  {
    icon: '✨',
    title: 'CLI UX Polish',
    description:
      'Create beautiful terminal interfaces with colors, markdown rendering, and diff previews',
  },
  {
    icon: '📦',
    title: 'Effect-TS Runtime',
    description:
      'Compose layers, manage dependencies, and handle errors with pure functional patterns',
  },
]

const timelineSteps = [
  {
    title: 'Watch',
    description: 'Follow step-by-step walkthroughs that explain every concept and design decision',
  },
  {
    title: 'Code',
    description: 'Build the agent yourself with hands-on exercises and working code examples',
  },
  {
    title: 'Run',
    description: 'Test your CLI agent immediately and see real-time tool execution in action',
  },
]

function HomepageHeader() {
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = playerRef.current
    if (!container) return

    // Clear previous embeds (in case of HMR in dev)
    container.innerHTML = ''

    // Add styles for Asciinema player sizing
    const styleId = 'asciinema-player-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        asciinema-player {
          width: 100% !important;
          max-width: 100% !important;
          transform: scaleY(0.7) !important;
          transform-origin: top center !important;
        }
        .asciinema-player-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          transform: scaleY(0.7) !important;
          transform-origin: top center !important;
        }
        .asciinema-player {
          width: 100% !important;
          max-width: 100% !important;
          transform: scaleY(0.7) !important;
          transform-origin: top center !important;
        }
      `
      document.head.appendChild(style)
    }

    const script = document.createElement('script')
    script.src = 'https://asciinema.org/a/gmYWqWQFCmspTa2FVgayHUnDr.js'
    script.id = 'asciicast-gmYWqWQFCmspTa2FVgayHUnDr'
    script.async = true
    container.appendChild(script)

    return () => {
      // Cleanup on unmount
      container.innerHTML = ''
    }
  }, [])

  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroContent}`}>
        <Heading as="h1" className={styles.heroTitle}>
          Build your own <span className={styles.highlight}>CLI coding agent</span> from scratch
        </Heading>
        <p className={styles.heroSubtitle}>
          A hands-on tutorial series for building an Effect-TS powered CLI agent with type-safe tool
          execution and streaming responses.
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary button--lg" to="/docs/build-series/overview">
            Start Building
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/kpritam/cliq"
          >
            View on GitHub
          </Link>
        </div>

        <div className={styles.terminalWindow}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalDot} />
            <div className={styles.terminalDot} />
            <div className={styles.terminalDot} />
          </div>
          <div className={styles.terminalBody}>
            <div ref={playerRef} className={styles.demoPlayer} />
          </div>
        </div>
      </div>
    </header>
  )
}

function WhatYoullLearn() {
  return (
    <section className={`container ${styles.featuresSection}`}>
      <Heading as="h2" className={styles.sectionTitle}>
        What You'll Learn
      </Heading>
      <p className={styles.sectionSubtitle}>
        Master the essential skills to build production-ready CLI agents with modern tooling and
        best practices
      </p>
      <div className="row">
        {features.map((feature) => (
          <div key={feature.title} className="col col--4 margin-bottom--lg">
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <Heading as="h3" className={styles.featureTitle}>
                {feature.title}
              </Heading>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          How It Works
        </Heading>
        <p className={styles.sectionSubtitle}>
          A simple three-step process to master CLI agent development from fundamentals to
          production deployment
        </p>
        <div className={styles.timeline}>
          {timelineSteps.map((step, index) => (
            <div key={step.title} className={styles.timelineStep}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <Heading as="h3" className={styles.stepTitle}>
                {step.title}
              </Heading>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SeriesOutline() {
  return (
    <section className={`container ${styles.seriesSection}`}>
      <Heading as="h2" className={styles.sectionTitle}>
        Series Outline
      </Heading>
      <p className={styles.sectionSubtitle}>
        11 comprehensive episodes taking you from setup to production-ready CLI agent
      </p>
      <div className={styles.episodeGrid}>
        {episodes.map((episode) => (
          <Link key={episode.number} to={episode.link} className={styles.episodeCard}>
            <div className={styles.episodeNumber}>{episode.number}</div>
            <Heading as="h3" className={styles.episodeTitle}>
              {episode.title}
            </Heading>
            <p className={styles.episodeDescription}>{episode.description}</p>
            <div className={styles.episodeMeta}>
              <span>⏱️ {episode.duration}</span>
              <span>📊 {episode.level}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <Heading as="h2" className={styles.ctaTitle}>
          Ready to Build?
        </Heading>
        <p className={styles.ctaSubtitle}>
          Start building your own AI-powered CLI agent today. Follow the step-by-step tutorial
          series.
        </p>
        <div className={styles.ctaActions}>
          <Link className="button button--primary button--lg" to="/docs/build-series/overview">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/kpritam/cliq"
          >
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home(): ReactNode {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cliq',
    url: 'https://kpritam.github.io/cliq/',
    logo: 'https://kpritam.github.io/cliq/img/logo.svg',
    description:
      'Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS.',
    sameAs: ['https://github.com/kpritam/cliq'],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cliq',
    url: 'https://kpritam.github.io/cliq/',
    description:
      'Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS. Step-by-step tutorials with hands-on exercises.',
    publisher: {
      '@type': 'Organization',
      name: 'Cliq Contributors',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://kpritam.github.io/cliq/search/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Build Your Own CLI Coding Agent',
    description:
      'A comprehensive tutorial series for building an Effect-TS powered CLI agent with type-safe tool execution and streaming responses.',
    provider: {
      '@type': 'Organization',
      name: 'Cliq',
      url: 'https://kpritam.github.io/cliq/',
    },
    courseCode: 'CLIQ-101',
    educationalLevel: 'Intermediate',
    teaches: [
      'Effect-TS functional programming',
      'CLI agent development',
      'AI tool integration',
      'TypeScript type safety',
      'Vercel AI SDK',
    ],
  }

  return (
    <Layout
      title="Build Your Own CLI Coding Agent"
      description="Learn to build a Claude-style CLI coding agent from scratch using TypeScript and Effect-TS. Step-by-step tutorials with hands-on exercises."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(courseSchema)}</script>
      </Head>
      <HomepageHeader />
      <main>
        <WhatYoullLearn />
        <HowItWorks />
        <SeriesOutline />
        <CTASection />
      </main>
    </Layout>
  )
}
