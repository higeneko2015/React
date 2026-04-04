import axios from 'axios';

/**
 * 共通で利用する定数定義
 */
const AUTH_TOKEN_KEY = 'auth_token';
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_BASE_URL = '/api';

/**
 * システムエラー通知を受け取るリスナーの型定義。
 * @param status - HTTP ステータスコード（ネットワークエラー時は null）
 * @param messageKey - メッセージカタログのキー（E9001 など）
 */
type GlobalErrorHandler = (status: number | null, messageKey: string) => void;

/** モジュールスコープでリスナーを保持（シングルトン） */
let globalErrorHandler: GlobalErrorHandler | null = null;

/**
 * グローバルエラーハンドラを登録します。
 * 通常、DialogProvider がマウント時に自身のダイアログ表示関数を登録します。
 */
export const setGlobalErrorHandler = (handler: GlobalErrorHandler) => {
  globalErrorHandler = handler;
};

/**
 * グローバルエラーハンドラを解除します。
 * DialogProvider がアンマウント時に呼び出してクリーンアップを行います。
 */
export const clearGlobalErrorHandler = () => {
  globalErrorHandler = null;
};

/**
 * アプリケーション共通の Axios インスタンス。
 * 各業務アプリのエントリポイントで `apiClient.defaults.baseURL` を上書きして使用してください。
 */
export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * リクエストインターセプター：
 * ストレージから認証トークンを取得し、Authorization ヘッダーに付与します。
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * レスポンスインターセプター：
 * 共通のシステムエラー（500系、認証切れ、ネットワークエラー等）を検知し、
 * 登録されたグローバルハンドラに通知します。
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | null = error.response?.status ?? null;

    // 業務エラー（400: Bad Request / 422: Unprocessable Entity）は、
    // 各画面（呼び出し元）のバリデーションロジックで個別に扱うため、ここではスルーします。
    if (status === 400 || status === 422) {
      return Promise.reject(error);
    }

    // システム全体で一律に通知すべきエラーをハンドラに送る
    if (globalErrorHandler) {
      if (status === null) {
        // ネットワーク到達不能・通信遮断
        globalErrorHandler(null, 'E9001');
      } else if (status === 401) {
        // 認証切れ・未ログイン
        globalErrorHandler(401, 'E9003');
      } else if (status === 404 || status >= 500) {
        // サーバーエラー、またはAPIエンドポイント自体の不在
        globalErrorHandler(status, 'E9002');
      }
    }

    return Promise.reject(error);
  }
);