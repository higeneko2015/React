import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { DialogProvider, ApiClient, favicon } from 'common';

// faviconを動的に設定。Commonプロジェクトから配信されるアセットを参照！
const link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/svg+xml';
link.href = favicon;
document.head.appendChild(link);

// アプリ独自のモックや追加不要。MSW起動判定はCommon側に委譲！
ApiClient.bootstrapApp({
  isDev: import.meta.env.DEV,
  // 三項演算子で書くことで、Vite のビルド時に false ? ... : undefined となり
  // 関数の中身ごと本番の JavaScript ファイルから跡形もなく消滅（Tree-shaking）します！
  enableMocking: import.meta.env.DEV ? async () => {
    const { worker } = await import('./mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
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
