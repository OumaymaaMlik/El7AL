// One strict lint setup for the whole repository (backend, web, mobile, shared).
// Errors are things that are wrong. Warnings are debts we track: `npm run lint` fails if their number grows
// (see --max-warnings in package.json), so the code can only get cleaner.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/** Data files (translations, copy) are long by nature, not by complexity. */
const DATA_FILES = [
  '**/i18n/locales/*.ts',
  '**/lib/*Copy.ts',
  '**/hooks/useTranslation.ts',
  'apps/backend/prisma/**',
  // A 3D scene is one animation timeline; splitting it would hide the order things happen in.
  'apps/web/src/components/ui/stage3d/**',
  // Scripts and the lifecycle test read top to bottom like a story; splitting them would hide it.
  'apps/backend/src/scripts/**',
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.expo/**',
      'apps/mobile/android/**',
      'apps/mobile/ios/**',
      'apps/web/public/**',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      // Debts: counted, not allowed to grow.
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  { files: DATA_FILES, rules: { 'max-lines': 'off' } },

  // The lifecycle test reads arbitrary JSON answers from the server; typing each one would only add noise.
  { files: ['apps/backend/src/scripts/**/*.ts'], rules: { '@typescript-eslint/no-explicit-any': 'off' } },

  // Backend and scripts run on Node.
  {
    files: ['apps/backend/**/*.ts', 'packages/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },

  // Web and mobile are React apps: hook rules matter.
  {
    files: ['apps/web/**/*.{ts,tsx}', 'apps/mobile/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.es2021 } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Config and tooling files.
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' }, // Babel and Metro configs are CommonJS
  },

  // Layering: the web app and the shared UI must not reach into the backend, and nobody imports another app.
  {
    files: ['apps/web/**/*.{ts,tsx}', 'apps/mobile/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/apps/backend/**', '@el7al/backend', '@el7al/backend/*'], message: 'Apps talk to the backend only through its API.' },
            { group: ['**/apps/web/**', '**/apps/mobile/**'], message: 'An app must not import another app. Put shared code in packages/.' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/backend/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/apps/web/**', '**/apps/mobile/**', 'react', 'react-dom', 'react-native'], message: 'The backend must not depend on a client app or on UI libraries.' },
          ],
        },
      ],
    },
  },
);
