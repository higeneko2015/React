import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GlobalLoadingContext } from '../hooks/useGlobalLoading';
import { setGlobalLoadingHandler, clearGlobalLoadingHandler } from '../api/client';
import { CompanyLoadingOverlay } from '../components/CompanyLoadingOverlay';

import type { ReactNode } from 'react';
import type { LoadingTask } from '../hooks/useGlobalLoading';

// シンプルなユニークIDジェネレータ
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const LoadingProvider = React.memo(({ children }: { children: ReactNode }) => {
  const [activeTasks, setActiveTasks] = useState<LoadingTask[]>([]);

  const showLoading = useCallback((message?: string) => {
    const id = generateId();
    setActiveTasks((prev) => [...prev, { id, message }]);
    return id;
  }, []);

  const hideLoading = useCallback((id: string) => {
    setActiveTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    showLoading,
    hideLoading,
    activeTasks,
  }), [showLoading, hideLoading, activeTasks]);

  // APIクライアントのグローバルローディングハンドラと接続する
  useEffect(() => {
    let loadingId: string | null = null;
    setGlobalLoadingHandler((isLoading) => {
      if (isLoading) {
        loadingId = showLoading('通信中...');
      } else if (loadingId) {
        hideLoading(loadingId);
        loadingId = null;
      }
    });

    return () => clearGlobalLoadingHandler();
  }, [showLoading, hideLoading]);

  // 複数タスクがある場合は最後に追加されたメッセージを表示する
  const currentMessage = activeTasks.length > 0 
    ? activeTasks[activeTasks.length - 1].message 
    : undefined;

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      {/* 画面全体に対するオーバーレイ表示 */}
      <CompanyLoadingOverlay 
        isLoading={activeTasks.length > 0} 
        message={currentMessage} 
        isInsideContainer={false} // 画面全体に表示するため false を指定
      />
    </GlobalLoadingContext.Provider>
  );
});

LoadingProvider.displayName = 'LoadingProvider';
