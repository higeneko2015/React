import React from 'react';
import { twMerge } from 'tailwind-merge';

import { LayoutProvider } from './LayoutContext';

// 型のインポートはルール 5 に従って一番下に！
import type { ReactNode } from 'react';

/**
 * 社内システム全体の基本レイアウトを規定するシェルコンポーネント。
 * ヘッダー、サイドバー、メインコンテンツエリアを配置し、
 * メインエリアのみをスクロール可能にする 100vh のレイアウトを提供します。
 */
export interface CompanyAppShellProps {
  /** 画面上部に固定表示するヘッダー要素 */
  header: ReactNode;
  /** 画面左側に固定表示するサイドバー要素 */
  sidebar: ReactNode;
  /** メインコンテンツエリアに表示する内容 */
  children: ReactNode;
  /** 追加のTailwindクラス名（全体の背景色変更など） */
  className?: string;
}

export const CompanyAppShell = React.memo(({
  header,
  sidebar,
  children,
  className
}: CompanyAppShellProps) => {
  return (
    <LayoutProvider>
      <div
        className={twMerge(
          'flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900',
          className
        )}
      >
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
});

CompanyAppShell.displayName = 'CompanyAppShell';