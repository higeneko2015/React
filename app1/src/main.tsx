import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ 
  routeTree,
  basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/app1' 
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
import { DialogProvider, AuthProvider, ApiClient } from 'common';
import type { AuthUser } from 'common';

// 本来はログインAPIから取得する。今はテスト用にハードコード
const mockUser: AuthUser = {
  id: 'hideyuki',
  name: '英行',
  roles: ['admin'],
  permissions: [
    'employee:read',
    'employee:create',
    'employee:edit',
    'employee:delete',
    'department:manage',
    'attendance:read',
    'payroll:read',
    'settings:manage',
  ],
};

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
          <AuthProvider user={mockUser}>
            <DialogProvider>
              <RouterProvider router={router} />
            </DialogProvider>
          </AuthProvider>
        </ApiClient.QueryClientProvider>
      </StrictMode>
    );
  }
});
