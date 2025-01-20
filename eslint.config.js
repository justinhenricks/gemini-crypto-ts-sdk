import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    {
        files: ['src/**/*.ts'],
        ignores: [
            'dist/**/*',
            'coverage/**/*',
            'node_modules/**/*',
            '.git/**/*',
            'build/**/*'
        ],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        ...tseslint.config(
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
        )[0],
        rules: {
            'no-console': 'off',
        },
    }
]; 