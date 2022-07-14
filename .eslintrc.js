module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts', '.d.tsx'],
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {},
    },
  },
  rules: {
    'semi': ['error', 'never'],
    'quotes': ['error', 'single', 'avoid-escape'],
    'comma-dangle': ['error', 'always-multiline'],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    '@typescript-eslint/member-delimiter-style': ['error', {
      'multiline': {
        delimiter: 'none',
      },
      'singleline': {
        delimiter: 'comma',
      },
    }],
    // '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/member-ordering': ['error', {
      'default': [
        // Index signature
        'signature',

        // Fields
        'private-static-field',
        'protected-static-field',
        'public-static-field',
        'private-decorated-field',
        'protected-decorated-field',
        'public-decorated-field',
        'private-instance-field',
        'protected-instance-field',
        'public-instance-field',
        'private-abstract-field',
        'protected-abstract-field',
        'public-abstract-field',

        // Constructors
        'public-constructor',
        'protected-constructor',
        'private-constructor',

        // Methods
        'private-static-method',
        'protected-static-method',
        'public-static-method',
        'private-decorated-method',
        'protected-decorated-method',
        'public-decorated-method',
        'private-instance-method',
        'protected-instance-method',
        'public-instance-method',
        'private-abstract-method',
        'protected-abstract-method',
        'public-abstract-method',
      ],
    }],
  },
}