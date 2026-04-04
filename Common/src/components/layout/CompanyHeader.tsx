import React from 'react';
import { useLayout } from './useLayout';

// 型のインポートはルール 5 に従って一番下に！
import type { ReactNode } from 'react';

/**
 * 社内システム全体の最上部に表示される共通ヘッダーコンポーネント。
 * アプリ名、サイドバー開閉ボタン、ユーザー情報、およびカスタムアクションを表示します。
 */
export interface CompanyHeaderProps {
  /** アプリケーションの名前 */
  appName: string;
  /** ログイン中のユーザー名 */
  userName: string;
  /** 右端のアクションエリアに表示するカスタム要素（通知アイコンなど） */
  children?: ReactNode;
}

export const CompanyHeader = React.memo(({
  appName,
  userName,
  children
}: CompanyHeaderProps) => {
  const { toggleSidebar } = useLayout();

  return (
    <header className="flex-shrink-0 h-12 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-20 relative">
      <div className="flex items-center gap-2">
        {/* サイドバー開閉ボタン */}
        <button
          type="button" // 念のため type 指定を追加
          onClick={toggleSidebar}
          className="p-1.5 -ml-2 mr-1 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          title="メニューを開閉"
          aria-label="メニューを開閉"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* アプリロゴのプレースホルダー */}
        <div className="w-7 h-7 bg-teal-500 rounded flex items-center justify-center font-bold text-white shadow-sm text-sm">
          {appName.charAt(0)}
        </div>
        <h1 className="text-base font-bold tracking-tight">{appName}</h1>
      </div>

      <div className="flex items-center gap-4">
        {children}

        {/* ユーザープロフィールエリア */}
        <div className="flex items-center gap-2 border-l border-white/20 pl-4 cursor-pointer hover:bg-white/5 py-1 px-1.5 rounded transition-colors">
          <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden border border-slate-700 flex items-center justify-center">
            {/* デフォルトのアバターアイコン表現 */}
            <div className="w-full h-full flex flex-col items-center justify-end bg-gray-400 pt-0.5">
              <div className="w-2.5 h-2.5 bg-gray-200 rounded-full mb-0.5"></div>
              <div className="w-5 h-2.5 bg-gray-200 rounded-t-full"></div>
            </div>
          </div>
          <span className="text-xs font-medium">{userName}</span>
        </div>
      </div>
    </header>
  );
});

CompanyHeader.displayName = 'CompanyHeader';