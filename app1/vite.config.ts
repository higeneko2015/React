import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: '/app1/',
  plugins: [
    react(),
    tailwindcss(),
    // 開発環境でも /common/favicon.svg を見られるようにするプラグイン！
    {
      name: 'serve-common-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/common/')) {
            const assetPath = req.url.replace('/common/', '');
            const filePath = path.resolve(__dirname, '../Common/public', assetPath);
            if (fs.existsSync(filePath)) {
              // 簡単なMIMEタイプの判別（SVGのみでもOKですが念のため）
              if (filePath.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: '../dist/app1',
    emptyOutDir: true,
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