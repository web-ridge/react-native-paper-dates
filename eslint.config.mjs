import { defineConfig } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// These rules are the React Compiler checks. They ship in eslint-plugin-react-hooks
// and match babel-plugin-react-compiler, which is what the published build runs.

const compilerRules = [
  'globals',
  'immutability',
  'incompatible-library',
  'preserve-manual-memoization',
  'purity',
  'refs',
  'set-state-in-render',
  'static-components',
  'unsupported-syntax',
]

export default defineConfig(
  {
    ignores: ['src/**/__tests__/**', 'lib/**', 'example/**', 'website/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: Object.fromEntries(
      compilerRules.map((rule) => [`react-hooks/${rule}`, 'error'])
    ),
  }
)
