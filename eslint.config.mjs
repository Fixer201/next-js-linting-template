import { fixupPluginRules } from '@eslint/compat'
import jsPlugin from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import unicornModule from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'
import tailwindcssPlugin from 'eslint-plugin-tailwindcss'
import cspellPlugin from '@cspell/eslint-plugin'
import oxlintPlugin from 'eslint-plugin-oxlint'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import securityPlugin from 'eslint-plugin-security'
import noUnsanitizedPlugin from 'eslint-plugin-no-unsanitized'
import noSecretsPlugin from 'eslint-plugin-no-secrets'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import eslintReact from '@eslint-react/eslint-plugin'
import reactRsc from 'eslint-plugin-react-rsc'
import reactCompiler from 'eslint-plugin-react-compiler'
import importAccess from 'eslint-plugin-import-access/flat-config'
import prismaPlugin from '@v2nic/eslint-plugin-prisma'
import microsoftSdl from '@microsoft/eslint-plugin-sdl'

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const unicornPlugin = unicornModule.default ?? unicornModule
const tailwindConfigPath = './src/app/globals.css'

const eslintConfig = [
  // ─── Foundation ───────────────────────────────────────────────────────
  jsPlugin.configs.recommended,

  // Bridge: disable ESLint rules that oxlint already covers.
  // Security/code-quality plugins below have zero oxlint overlap,
  // so their rules pass through the bridge untouched.
  ...oxlintPlugin.configs['flat/recommended'],

  // ─── Next.js layer (native flat config from eslint-config-next) ──────
  // Provides @next/eslint-plugin-next rules: no-html-link, no-sync-scripts,
  // no-img-element, no-script-url, no-async-client-component, etc.
  ...nextCoreWebVitals,
  ...nextTypescript,

  // eslint-plugin-react v7 is incompatible with ESLint v10's context API.
  // Disable all react v7 rules — they're covered by oxlint + @eslint-react.
  {
    rules: {
      'react/display-name': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'react/no-children-prop': 'off',
      'react/no-danger-with-children': 'off',
      'react/no-deprecated': 'off',
      'react/no-direct-mutation-state': 'off',
      'react/no-find-dom-node': 'off',
      'react/no-is-mounted': 'off',
      'react/no-render-return-value': 'off',
      'react/no-string-refs': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'react/no-unsafe': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-render-return': 'off',
    },
  },

  // ─── React Compiler (Meta) — catches violations of compiler rules ────
  {
    plugins: { 'react-compiler': reactCompiler },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },

  // ─── RSC rules (eslint-plugin-react-rsc from Rel1cx/eslint-react) ──
  // Enforces 'use client' / 'use server' boundaries, server-only imports.
  {
    plugins: { 'react-rsc': reactRsc },
    rules: {
      'react-rsc/no-default-export-in-server': 'off', // Next.js pages use default exports
    },
  },

  // ─── Global ignores ─────────────────────────────────────────────────
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      '*.mjs',
      'next.config.ts',
      'postcss.config.mjs',
      'knip.json',
      'tsconfig*.json',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Security Layer — no oxlint overlap, full recommended configs.
  // These are the #1 recommendation from goldbergyoni/nodebestpractices.
  // ═══════════════════════════════════════════════════════════════════════

  // Node.js security: eval, child_process, path traversal, ReDoS, timing attacks
  securityPlugin.configs.recommended,

  // DOM XSS: innerHTML, document.write, location.href sinks
  noUnsanitizedPlugin.configs.recommended,

  // Code quality + security smells: cognitive complexity, duplicate strings, bug patterns
  sonarjsPlugin.configs.recommended,

  // Microsoft SDL — Security Development Lifecycle rules
  {
    plugins: { '@microsoft/sdl': microsoftSdl },
    rules: {
      '@microsoft/sdl/no-inner-html': 'error',
      '@microsoft/sdl/no-document-write': 'error',
      '@microsoft/sdl/no-html-method': 'error',
      '@microsoft/sdl/no-insecure-random': 'error',
      '@microsoft/sdl/no-insecure-url': 'warn',
      '@microsoft/sdl/no-postmessage-star-origin': 'error',
      '@microsoft/sdl/no-document-domain': 'error',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // React Layer — eslint-config-next already registers:
  //   @next/next, react, react-hooks, @typescript-eslint, import, jsx-a11y
  // We add @eslint-react (65 modern rules, zero overlap with next config).
  // ═══════════════════════════════════════════════════════════════════════

  // @eslint-react — modern, actively-maintained React ruleset (65 rules)
  eslintReact.configs.recommended,
  eslintReact.configs['recommended-typescript'],

  // ═══════════════════════════════════════════════════════════════════════
  // Unicorn — 100+ power rules. Oxlint covers 13; bridge handles overlap.
  // ═══════════════════════════════════════════════════════════════════════
  unicornPlugin.configs['flat/recommended'],

  // ═══════════════════════════════════════════════════════════════════════
  // File-scoped config — type-aware TS, secrets, and fine-tuning overrides
  // ═══════════════════════════════════════════════════════════════════════
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      },
    },
    plugins: {
      promise: promisePlugin,
      tailwindcss: tailwindcssPlugin,
      cspell: cspellPlugin,
      perfectionist: perfectionistPlugin,
      'no-secrets': noSecretsPlugin,
      'import-access': importAccess,
    },
    settings: {
      tailwindcss: {
        cssConfigPath: tailwindConfigPath,
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ─── Entropy-based secret detection (lint-time, before gitleaks) ───
      'no-secrets/no-secrets': [
        'error',
        {
          tolerance: 4.2,
          ignoreContent: '^https',
        },
      ],

      // ─── Security fine-tuning ─────────────────────────────────────────
      // The noisiest rule — fires on every obj[key] access pattern.
      // Keep it off; the other 9 security rules are sufficient.
      'security/detect-object-injection': 'off',

      // ─── Code quality limits (from creo-team / sebastian-software) ─────
      'sonarjs/cognitive-complexity': ['warn', 15],

      // ─── Block dynamic Function() construction (from browserbase/stagehand) ──
      // no-eval catches eval(). These AST selectors catch new Function()
      // and globalThis.Function() — bypasses that standard rules miss.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='Function']",
          message: 'Dynamic function construction via Function() is prohibited.',
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: 'Dynamic function construction via new Function() is prohibited.',
        },
        {
          selector:
            "CallExpression[callee.object.name='globalThis'][callee.property.name='Function']",
          message: 'Dynamic function construction via globalThis.Function() is prohibited.',
        },
      ],

      // ─── ESLint v10: prevent swallowed errors ─────────────────────────
      'preserve-caught-error': 'error',

      // ─── React settings ──────────────────────────────────────────────
      // TypeScript handles these; JSX transform handles react-in-jsx-scope
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',

      // ─── Import rules (oxlint covers default + namespace only) ────────
      'import/no-duplicates': 'warn',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'warn',
      'import/newline-after-import': 'warn',

      // ─── Type-aware TypeScript rules (NOT available in oxlint without TS 7+) ───
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-unary-minus': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-duplicate-type-constituents': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-extra-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-conversion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-literal-enum-member': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/no-mixed-enums': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',

      // ─── React Hooks (backup — oxlint covers these natively too) ──────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ─── Promise (rules NOT in oxlint's native promise plugin) ─────────
      'promise/no-native': 'off',
      'promise/avoid-new': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-wrap': 'warn',
      'promise/valid-params': 'warn',
      'promise/spec-only': 'warn',

      // ─── Unicorn (rules NOT covered by oxlint's 13 unicorn rules) ─────
      'unicorn/better-regex': 'warn',
      'unicorn/catch-error-name': 'warn',
      'unicorn/consistent-destructuring': 'warn',
      'unicorn/consistent-function-scoping': 'warn',
      'unicorn/custom-error-definition': 'error',
      'unicorn/error-message': 'warn',
      'unicorn/escape-case': 'warn',
      'unicorn/explicit-length-check': 'off', // clashes with TS strict-boolean
      'unicorn/filename-case': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-non-function-verb-prefix': 'off',
      'unicorn/no-abusive-eslint-disable': 'warn',
      'unicorn/no-array-callback-reference': 'warn',
      'unicorn/no-for-each': 'warn',
      'unicorn/no-array-method-this-argument': 'warn',
      'unicorn/no-array-push-push': 'warn',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-console-spaces': 'warn',
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-for-loop': 'warn',
      'unicorn/no-hex-escape': 'warn',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-lonely-if': 'warn',
      'unicorn/no-negated-condition': 'warn',
      'unicorn/no-nested-ternary': 'warn',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off',
      'unicorn/no-object-as-default-parameter': 'warn',
      'unicorn/no-process-exit': 'warn',
      'unicorn/no-static-only-class': 'warn',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/no-unreadable-array-destructuring': 'warn',
      'unicorn/no-unreadable-iife': 'warn',
      'unicorn/no-useless-promise-resolve-reject': 'warn',
      'unicorn/no-useless-switch-case': 'warn',
      'unicorn/no-useless-undefined': 'warn',
      'unicorn/no-zero-fractions': 'warn',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-find': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-array-index-of': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-at': 'warn',
      'unicorn/prefer-code-point': 'warn',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'warn',
      'unicorn/prefer-dom-node-append': 'warn',
      'unicorn/prefer-dom-node-dataset': 'warn',
      'unicorn/prefer-dom-node-remove': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unicorn/prefer-export-from': 'warn',
      'unicorn/prefer-includes': 'warn',
      'unicorn/prefer-keyboard-event-key': 'warn',
      'unicorn/prefer-logical-operator-over-ternary': 'warn',
      'unicorn/prefer-math-trunc': 'warn',
      'unicorn/prefer-modern-dom-apis': 'warn',
      'unicorn/prefer-modern-math-apis': 'warn',
      'unicorn/prefer-native-coercion-functions': 'warn',
      'unicorn/prefer-negative-index': 'warn',
      'unicorn/prefer-node-protocol': 'warn',
      'unicorn/prefer-number-properties': 'warn',
      'unicorn/prefer-object-from-entries': 'warn',
      'unicorn/prefer-optional-catch-binding': 'warn',
      'unicorn/prefer-prototype-methods': 'warn',
      'unicorn/prefer-query-selector': 'warn',
      'unicorn/prefer-reflect-apply': 'warn',
      'unicorn/prefer-regexp-test': 'warn',
      'unicorn/prefer-string-raw': 'warn',
      'unicorn/prefer-string-replace-all': 'warn',
      'unicorn/prefer-string-slice': 'warn',
      'unicorn/prefer-string-trim-start-end': 'warn',
      'unicorn/prefer-structured-clone': 'warn',
      'unicorn/prefer-type-error': 'error',
      'unicorn/throw-new-error': 'error',

      // ─── Tailwind CSS (NOT available in oxlint natively) ──────────────
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',

      // ─── CSpell (spellcheck — NOT available in oxlint at all) ─────────
      'cspell/spellchecker': [
        'warn',
        {
          checkIdentifiers: true,
          checkStrings: false,
          checkJSXText: true,
          checkComments: true,
        },
      ],

      // ─── Perfectionist (auto-sort imports, exports, objects, types) ────
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          order: 'asc',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          newlinesBetween: 0,
        },
      ],
      'perfectionist/sort-exports': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-named-imports': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-named-exports': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-objects': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-interfaces': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-union-types': ['warn', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-jsx-props': ['warn', { type: 'natural', order: 'asc' }],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Prisma layer — schema validation + ORM best practices
  // ═══════════════════════════════════════════════════════════════════════
  {
    files: ['prisma/**/*.{ts,js}', 'src/lib/db.ts'],
    plugins: {
      prisma: prismaPlugin,
    },
    rules: {
      'prisma/no-unsafe': 'error',
      'prisma/no-snake-case-in-ts': 'warn',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Server-only enforcement — prevent client imports of server modules
  // ═══════════════════════════════════════════════════════════════════════
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import-access/no-unresolved': 'off', // delegate to TS
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Overrides — API routes allow logging (server context)
  // ═══════════════════════════════════════════════════════════════════════
  {
    files: ['src/app/api/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },

  {
    files: ['prisma/seed.ts'],
    rules: {
      'unicorn/no-process-exit': 'off',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Overrides — test files (relaxed rules)
  // ═══════════════════════════════════════════════════════════════════════
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'react/no-array-index-key': 'off',
      'unicorn/no-array-for-each': 'off',
      'no-console': 'off',
      'no-magic-numbers': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
]

export default eslintConfig
