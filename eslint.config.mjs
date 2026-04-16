import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript — zakaz any
      '@typescript-eslint/no-explicit-any': 'error',

      // Zakaz unused variables (z wyjątkiem _prefix)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // Ignorujemy wygenerowane pliki i konfiguracje
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
    ],
  },
]

export default eslintConfig
