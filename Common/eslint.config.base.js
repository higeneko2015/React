import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * プロジェクト全体で共有するESLintベース設定
 */
export const baseConfig = defineConfig([
  globalIgnores(['dist', 'node_modules', 'dist-ssr']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /* 厳格なガバナンスルール: 特定のライブラリは共通パッケージを経由させる */
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'zod',
              message: "zod は 'common' からインポートしてください。 import { z } from 'common'; と記述します。",
            },
            {
              name: '@tanstack/react-query',
              message: "@tanstack/react-query は 'common' からインポートしてください。",
            },
          ],
        },
      ],
    },
  },
])
