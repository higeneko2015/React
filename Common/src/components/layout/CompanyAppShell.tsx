import React from 'react';
import type { ReactNode } from 'react';
import { LayoutProvider } from './LayoutContext';

export interface CompanyAppShellProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CompanyAppShell: React.FC<CompanyAppShellProps> = ({ header, sidebar, children, className = '' }) => {
  return (
    <LayoutProvider>
      <div className={`flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900 ${className}`}>
        {/* 画面上部に固定されるヘッダー */}
        {header}
        
        {/* ヘッダー以下のエリア（サイドバー ＋ メインコンテンツ） */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* 左側に固定されるサイドバー */}
          {sidebar}
          
          {/* メインコンテンツエリア（ここだけがスクロールする） */}
          <main className="flex-1 overflow-y-auto w-full relative">
            {children}
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
};

CompanyAppShell.displayName = 'CompanyAppShell';
