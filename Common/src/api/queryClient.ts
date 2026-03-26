import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // エラー時のリトライ回数
      staleTime: 5 * 60 * 1000, // 5分間はフレッシュと見なすキャッシュ戦略
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得をオフに
    },
  },
});
