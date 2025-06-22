module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // TypeScript 规则
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // React 规则
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',

        // 通用规则
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
    },
    overrides: [
        {
            files: ['src/main/**/*'],
            env: {
                node: true,
            },
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
}; 