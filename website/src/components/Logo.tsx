import { useColorMode } from '@docusaurus/theme-common'
import React from 'react'

export default function Logo() {
  const { colorMode } = useColorMode()
  const isDarkTheme = colorMode === 'dark'

  return (
    <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="textShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect width="400" height="120" fill="none" />
      <g transform="translate(20, 72)">
        <path
          d="M 0 -10 L 28 12 L 0 34"
          stroke="#10B981"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="60"
          y="30"
          fontFamily="JetBrains Mono, SF Mono, Consolas, monospace"
          fontSize="72"
          fontWeight="900"
          fill={isDarkTheme ? '#F5F5F5' : '#1b1f23'}
          letterSpacing="0.02em"
          filter="url(#textShadow)"
        >
          cliq
        </text>
        <rect x="278" y="-8" width="24" height="58" rx="3" fill="url(#cursorGrad)">
          <animate attributeName="opacity" values="1;0.15;1" dur="0.85s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  )
}
