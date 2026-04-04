/**
 * API・通信層の公開エントリポイント。
 * アプリケーションの各コンポーネントは、このモジュールを介して
 * APIクライアントやクエリフックにアクセスします。
 */

export * from './client';
export * from './queryClient';
export * from './bootstrap';

// 型の再エクスポートが必要な場合はここに集約（ルール 5 準拠）
// export type { ... } from './types';

/**
 * @tanstack/react-query の主要な機能を再エクスポートします。
 * これにより、利用側がライブラリを直接参照する箇所を減らし、
 * 将来的な非互換アップデート時の変更箇所を最小限に抑えます。
 */
export {
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';