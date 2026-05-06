import * as React from 'react'
import { Outlet, createRootRouteWithContext, useNavigate, redirect } from '@tanstack/react-router'
import { useAppAuth } from '../auth/AppAuthProvider'
import type { AppAuthContextType } from '../auth/AppAuthProvider'
import {
  CompanyAppShell,
  CompanyHeader,
  CompanySidebar,
  type MenuItem,
} from 'common'

const SIDEBAR_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: '📊', to: '/' },
  {
    id: 'employees',
    label: '社員管理',
    icon: '👥',
    children: [
      { id: 'search', label: '社員情報検索', to: '/employees', permission: 'employee:read' },
      { id: 'register', label: '新規登録', to: '/employees/register', permission: 'employee:create' },
      { id: 'departments', label: '部署管理', to: '/employees/departments', permission: 'department:manage' }
    ]
  },
  { id: 'attendance', label: '勤怠管理', icon: '⏰', permission: 'attendance:read' },
  { id: 'payroll', label: '給与計算', icon: '💰', permission: 'payroll:read' },
  {
    id: 'settings',
    label: 'システム設定',
    icon: '⚙️',
    permission: 'settings:manage',
    children: [
      { id: 'security', label: 'セキュリティ設定' },
      { id: 'audit', label: '監査ログ' }
    ]
  }
];

interface MyRouterContext {
  auth: AppAuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  beforeLoad: ({ context, location }) => {
    // ログイン済みでない、かつ現在のパスが /login ではない場合は /login にリダイレクト
    if (!context.auth.isAuthenticated && location.pathname !== '/login') {
      throw redirect({ to: '/login' });
    }
  },
})

function RootComponent() {
  const navigate = useNavigate();
  const { logout, user } = useAppAuth();
  const [currentMenuId, setCurrentMenuId] = React.useState('search');

  // 本来はルーティング側で解決するが、今回はメニューのHighlight用に残す
  const handleMenuSelect = (id: string) => {
    setCurrentMenuId(id);
    
    // 選択されたIDから 'to' で指定されたURLを探して遷移する
    let targetPath = '';
    for (const item of SIDEBAR_MENU) {
      if (item.id === id && item.to) targetPath = item.to;
      if (item.children) {
        for (const child of item.children) {
           if (child.id === id && child.to) targetPath = child.to;
        }
      }
    }
    
    if (targetPath) {
      navigate({ to: targetPath });
    }
  };

  return (
    <CompanyAppShell
      header={
        <CompanyHeader appName="人事総合管理システム" userName={user?.name || 'ゲスト'}>
          <button className="relative p-2 text-gray-300 hover:text-white transition-colors outline-none rounded-full hover:bg-white/10 mr-2">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
          </button>
          {user && (
            <button
              onClick={() => {
                logout();
                navigate({ to: '/login' });
              }}
              className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors"
            >
              ログアウト
            </button>
          )}
        </CompanyHeader>
      }
      sidebar={
        <CompanySidebar
          items={SIDEBAR_MENU}
          currentId={currentMenuId}
          onSelect={handleMenuSelect}
        />
      }
    >
      <Outlet />
    </CompanyAppShell>
  )
}
