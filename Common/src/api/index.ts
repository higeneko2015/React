export * from './client';
export * from './queryClient';
export * from './bootstrap';

// アプリケーション側が tanstack-query 本体を直接importしなくて済むように再エクスポート
export { 
  QueryClientProvider, 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';

