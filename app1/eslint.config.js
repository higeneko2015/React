import { baseConfig } from '../Common/eslint.config.base.js'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...baseConfig,
  /* アプリ固有のルールがあればここに追加 */
])

