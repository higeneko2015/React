import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { CompanySpinner } from './CompanySpinner';

/**
 * ローディング状態を表示するオーバーレイコンポーネント。
 * 一瞬だけ表示されて画面がチラつくのを防ぐため、指定した遅延時間（delayMs）後に表示されます。
 */
export interface CompanyLoadingOverlayProps {
  /** ローディング中かどうか */
  isLoading: boolean;
  /** ローディング表示を開始するまでの遅延時間（ミリ秒、デフォルト: 500） */
  delayMs?: number;
  /** 表示するメッセージテキスト */
  message?: string;
  /** 親要素の内部に表示するか（true）、画面全体に表示するか（false）。デフォルト: true */
  isInsideContainer?: boolean;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyLoadingOverlay = React.memo(({
  isLoading,
  delayMs = 500,
  message,
  isInsideContainer = true,
  className,
}: CompanyLoadingOverlayProps) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delayMs);

    return () => clearTimeout(timer); // ルール2.5: クリーンアップ完璧！
  }, [isLoading, delayMs]);

  if (!shouldShow) return null;

  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center z-50 bg-black/50 animate-[fade-in_300ms_ease-out_forwards]',
        isInsideContainer ? 'absolute inset-0 rounded-lg' : 'fixed inset-0',
        className
      )}
    >
      <div className="bg-white/95 p-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4 border border-white">
        <CompanySpinner size="lg" className="text-teal-600" />
        {message && (
          <p className="font-bold text-teal-800 animate-pulse text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
});

CompanyLoadingOverlay.displayName = 'CompanyLoadingOverlay';