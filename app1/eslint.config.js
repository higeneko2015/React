import { baseConfig } from '../Common/eslint.config.base.js'
import { defineConfig } from 'eslint/config'
import reactRefresh from 'eslint-plugin-react-refresh'

export default defineConfig([
  ...baseConfig,
  {
    plugins: {
      'react-refresh': reactRefresh
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['Route'] }
      ]
    }
  }
])

