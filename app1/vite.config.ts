import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 💥 関数形式に変更して、モジュールのパス（id）からチャンク名を振り分けます！
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // react-aria 関連
            if (id.includes('react-aria-components') || id.includes('@react-aria') || id.includes('@react-stately')) {
              return 'aria-vendor';
            }
            // TanStack 関連
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor';
            }
            // React コア
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            // その他のライブラリは 'vendor' にまとめる
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
  }
})