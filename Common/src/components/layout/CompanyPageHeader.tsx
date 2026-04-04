import React from 'react';
import { twMerge } from 'tailwind-merge';

// 型のインポートはルール 5 に従って一番下に！
import type { ReactNode } from 'react';

/**
 * 各ページの最上部に表示するヘッダーコンポーネント。
 * タイトル、補足説明、および右側のアクションエリア（ボタンなど）を配置します。
 */
export interface CompanyPageHeaderProps {
  /** ページの大見出し */
  title: string;
  /** タイトルの下に表示する補足テキスト */
  description?: string;
  /** 右側に表示する操作要素（Buttonなど） */
  children?: ReactNode;
  /** 追加のスタイルクラス */
  className?: string;
}

export const CompanyPageHeader = React.memo(({
  title,
  description,
  children,
  className
}: CompanyPageHeaderProps) => {
  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-gray-200',
        className
      )}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 items-center">
          {children}
        </div>
      )}
    </div>
  );
});

CompanyPageHeader.displayName = 'CompanyPageHeader';