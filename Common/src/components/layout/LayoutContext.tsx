import React, { useState, useCallback, useMemo } from 'react';
import { LayoutContext } from './useLayout';

// 型のインポートはルール 5 に従って一番下に！
import type { ReactNode } from 'react';

/**
 * レイアウトに関する状態（サイドバーの開閉など）を提供するProps。
 */
export interface LayoutProviderProps {
  /** Provider でラップする子要素 */
  children: ReactNode;
  /** サイドバーの初期開閉状態（デフォルト: false） */
  defaultCollapsed?: boolean;
}

/**
 * アプリケーション全体のレイアウト状態を管理する Provider。
 * サイドバーの折りたたみ状態などを、配下のコンポーネントに共有します。
 */
export const LayoutProvider = React.memo(({
  children,
  defaultCollapsed = false
}: LayoutProviderProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

  /** サイドバーの開閉状態を反転させる関数 */
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  /** Contextに渡す値をメモ化して、不要な再レンダリングを防止 */
  const contextValue = useMemo(() => ({
    isSidebarCollapsed,
    toggleSidebar
  }), [isSidebarCollapsed, toggleSidebar]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
});

LayoutProvider.displayName = 'LayoutProvider';