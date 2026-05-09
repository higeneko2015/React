import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ 
  routeTree,
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/app1',
  context: {
    auth: undefined! // 後から InnerApp で注入される
  }
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
import { DialogProvider, LoadingProvider, AuthProvider, ApiClient } from 'common';
import { AppAuthProvider, useAppAuth } from './auth/AppAuthProvider';

// TanStack Router と Common AuthProvider をつなぐブリッジコンポーネント
function InnerApp() {
  const auth = useAppAuth();
  
  return (
    // Common パッケージの AuthProvider にアプリ側のユーザー状態を流し込む
    <AuthProvider user={auth.user}>
      <DialogProvider>
        <LoadingProvider>
          <RouterProvider router={router} context={{ auth }} />
        </LoadingProvider>
      </DialogProvider>
    </AuthProvider>
  );
}

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
          {/* アプリ全体の認証状態（モック）を管理するプロバイダー */}
          <AppAuthProvider>
            <InnerApp />
          </AppAuthProvider>
        </ApiClient.QueryClientProvider>
      </StrictMode>
    );
  }
});
