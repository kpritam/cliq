/* ESLint configuration for Docusaurus website */
module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'mdx'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: ['dist', 'build', '.docusaurus'],
  overrides: [
    {
      files: ['**/*.md', '**/*.mdx'],
      extends: ['plugin:mdx/recommended'],
      parser: 'eslint-mdx',
    },
  ],
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    // React 17+ / automatic runtime – no need to import React in scope
    'react/react-in-jsx-scope': 'off',
    // MDX/tutorial prose frequently includes apostrophes and quotes
    'react/no-unescaped-entities': 'off',
    // Docusaurus virtual modules resolution
    'import/no-unresolved': [
      'error',
      {
        ignore: ['^@docusaurus/', '^@theme/'],
      },
    ],
  },
}
