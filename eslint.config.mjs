import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from "eslint-plugin-unused-imports";

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
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': 'error',
            "unused-imports/no-unused-imports": "error",
        },
    }
]; 