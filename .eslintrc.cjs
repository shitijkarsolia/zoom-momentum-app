const { resolve } = require('path');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '*.cjs', '*.mjs'],
  overrides: [
    {
      // Client-specific rules (React)
      files: ['client/src/**/*.{ts,tsx}'],
      plugins: ['react', 'react-hooks'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        'react/no-unescaped-entities': 'off',
        'react-hooks/purity': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/set-state-in-effect': 'off',
      },
      settings: {
        react: { version: 'detect' },
      },
      env: {
        browser: true,
        node: false,
      },
    },
    {
      // Server-specific rules
      files: ['server/src/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
    },
    {
      // Mock transcript
      files: ['mock-transcript/src/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
