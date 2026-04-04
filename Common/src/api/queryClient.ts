import { QueryClient } from '@tanstack/react-query';

/** * クエリのキャッシュ有効期限（デフォルト: 5分）
 * この期間内は、サーバーへの再問い合わせを行わずキャッシュを利用します。
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

/** エラー時の自動リトライ回数 */
const DEFAULT_RETRY_COUNT = 1;

/**
 * アプリケーション全体で共有する TanStack Query のクライアントインスタンス。
 * データの取得、キャッシュ、同期の状態を管理します。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 通信エラー時のリトライ回数を制限（無限リトライによる負荷を防止）
      retry: DEFAULT_RETRY_COUNT,

      // キャッシュの鮮度を定義。頻繁に更新されないマスターデータ等に最適化
      staleTime: DEFAULT_STALE_TIME,

      // ウィンドウフォーカス時の自動再取得をオフ
      // ユーザーがタブを切り替えるたびにリクエストが走るのを防ぎ、UXと負荷のバランスを取ります
      refetchOnWindowFocus: false,

      // エラー発生時にグローバルエラーハンドラ（Dialog等）と連携したい場合は、
      // ここに共通の onError 処理を追加することも検討してください。
    },
  },
});