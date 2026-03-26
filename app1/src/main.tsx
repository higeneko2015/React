import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { DialogProvider, ApiClient } from 'common';

// アプリ独自のモックや追加不要。MSW起動判定はCommon側に委譲！
ApiClient.bootstrapApp({
  isDev: import.meta.env.DEV,
  // 三項演算子で書くことで、Vite のビルド時に false ? ... : undefined となり
  // 関数の中身ごと本番の JavaScript ファイルから跡形もなく消滅（Tree-shaking）します！
  enableMocking: import.meta.env.DEV ? async () => {
    const { worker } = await import('./mocks/browser');
    // base 設定に合わせ、Service Worker のパスを動的に指定！っ😤
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`
      }
    });
  } : undefined,
  renderApp: () => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        {/* API通信キャッシュのプロバイダーを根っこに配置 */}
        <ApiClient.QueryClientProvider client={ApiClient.queryClient}>
          <DialogProvider>
            <App />
          </DialogProvider>
        </ApiClient.QueryClientProvider>
      </StrictMode>
    );
  }
});
