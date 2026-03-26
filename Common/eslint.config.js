import { baseConfig } from './eslint.config.base.js'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...baseConfig,
  /* Commonプロジェクト固有のルールがあればここに追加 */
])

