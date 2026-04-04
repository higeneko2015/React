import { baseConfig } from './eslint.config.base.js'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...baseConfig,
  {
    // Commonプロジェクト自身はライブラリを直接importしてラップ・再エクスポートするため特例で制限を解除
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
])

