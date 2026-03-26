import axios from 'axios';

// システムエラー通知を受け取るリスナーの型
type GlobalErrorHandler = (status: number | null, message: string) => void;

// モジュールスコープでリスナーを保持（シングルトン）
let globalErrorHandler: GlobalErrorHandler | null = null;

/**
 * グローバルエラーハンドラを登録する。
 * DialogProvider がマウント時に呼び出して自身のダイアログ関数を登録する。
 */
export const setGlobalErrorHandler = (handler: GlobalErrorHandler) => {
  globalErrorHandler = handler;
};

/**
 * グローバルエラーハンドラを解除する。
 * DialogProvider がアンマウント時に呼び出してクリーンアップする。
 */
export const clearGlobalErrorHandler = () => {
  globalErrorHandler = null;
};

// 基本のAxiosインスタンスを作成
export const apiClient = axios.create({
  // 共通ライブラリのため、baseURL はデフォルト値のみ設定します。
  // 各業務アプリ（app1等）のエントリポイントで apiClient.defaults.baseURL = '...' と上書きしてください。
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター：localStorageからトークンを取得して付与
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター：グローバルなシステムエラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | null = error.response?.status ?? null;

    // 業務エラー（バリデーション系）は呼び出し元に委譲する
    if (status === 400 || status === 422) {
      return Promise.reject(error);
    }

    // システムエラーをリスナーに通知する
    if (globalErrorHandler) {
      if (status === null) {
        // ネットワーク到達不能・受信中断など
        globalErrorHandler(null, 'E9001');
      } else if (status === 401) {
        globalErrorHandler(401, 'E9003');
      } else if (status === 404) {
        // 業務的な「存在しない」ではなく、APIエンドポイント自体が見つからない場合
        globalErrorHandler(404, 'E9002');
      } else if (status >= 500) {
        globalErrorHandler(status, 'E9002');
      }
    }

    return Promise.reject(error);
  }
);
