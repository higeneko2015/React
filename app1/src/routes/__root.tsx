import * as React from 'react'
import { Outlet, createRootRoute, useNavigate } from '@tanstack/react-router'
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
      { id: 'search', label: '社員情報検索', to: '/employees' },
      { id: 'register', label: '新規登録', to: '/employees/register' },
      { id: 'departments', label: '部署管理', to: '/employees/departments' }
    ]
  },
  { id: 'attendance', label: '勤怠管理', icon: '⏰' },
  { id: 'payroll', label: '給与計算', icon: '💰' },
  {
    id: 'settings',
    label: 'システム設定',
    icon: '⚙️',
    children: [
      { id: 'security', label: 'セキュリティ設定' },
      { id: 'audit', label: '監査ログ' }
    ]
  }
];

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const navigate = useNavigate();
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
        <CompanyHeader appName="人事総合管理システム" userName="英行">
          <button className="relative p-2 text-gray-300 hover:text-white transition-colors outline-none rounded-full hover:bg-white/10">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
          </button>
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
