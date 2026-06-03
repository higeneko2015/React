# API通信基盤 仕様書

`Common/src/api/` 配下のファイルの詳細仕様です。

---

## client.ts — Axiosベース共通HTTPクライアント

### 定数

| 定数名 | 値 | 説明 |
|---|---|---|
| `AUTH_TOKEN_KEY` | `'auth_token'` | localStorage からトークンを取得するキー |
| `DEFAULT_TIMEOUT` | `10000` | リクエストのタイムアウト時間（ミリ秒） |
| `DEFAULT_BASE_URL` | `'/api'` | APIのベースURL |

### `apiClient`

Axiosインスタンス。各アプリのエントリポイントで `apiClient.defaults.baseURL` を上書きして使用する。

#### リクエストインターセプター

1. 実行中のリクエスト数（`activeRequests`）をインクリメント
2. `activeRequests` が 0→1 になった時点で `globalLoadingHandler(true)` を発火
3. `localStorage` から認証トークンを取得し、`Authorization: Bearer <token>` ヘッダーに付与

#### レスポンスインターセプター

1. `activeRequests` をデクリメント（`Math.max(0, ...)` で負にならないようガード）
2. `activeRequests` が 0 に戻った時点で `globalLoadingHandler(false)` を発火
3. エラーレスポンスの場合、ステータスコードに応じてグローバルエラーハンドラに通知

| ステータス | 処理 | メッセージキー |
|---|---|---|
| `null`（ネットワーク到達不能） | エラー通知 | `E9001` |
| `401` | 認証エラー通知 | `E9003` |
| `404`, `500`以上 | サーバーエラー通知 | `E9002` |
| `400`, `422` | スルー（各画面で個別にハンドリング） | — |

### `setGlobalErrorHandler(handler)`

| パラメータ | 型 | 説明 |
|---|---|---|
| `handler` | `(status: number \| null, messageKey: string) => void` | エラー発生時に呼び出されるコールバック |

DialogProvider がマウント時に登録する。

### `clearGlobalErrorHandler()`

グローバルエラーハンドラを解除する。DialogProvider がアンマウント時に呼び出す。

### `setGlobalLoadingHandler(handler)`

| パラメータ | 型 | 説明 |
|---|---|---|
| `handler` | `(isLoading: boolean) => void` | ローディング状態の変化時に呼び出されるコールバック |

LoadingProvider がマウント時に登録する。

### `clearGlobalLoadingHandler()`

グローバルローディングハンドラを解除する。LoadingProvider がアンマウント時に呼び出す。

---

## queryClient.ts — TanStack Query 共通クライアント

### `queryClient`

`QueryClient` のシングルトンインスタンス。

| 設定項目 | 値 | 説明 |
|---|---|---|
| `retry` | `1` | エラー時の自動リトライ回数 |
| `staleTime` | `300000`（5分） | キャッシュの鮮度期間（この間はサーバーに再問い合わせしない） |
| `refetchOnWindowFocus` | `false` | タブ切り替え時の自動再取得を無効化 |

---

## bootstrap.ts — アプリケーション起動関数

### `bootstrapApp(options)`

アプリケーションの初期化と起動を行うエントリーポイント関数。

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `options.isDev` | `boolean` | ✅ | 開発環境かどうか |
| `options.enableMocking` | `() => Promise<unknown>` | — | モック（MSW等）の初期化を行う非同期関数 |
| `options.renderApp` | `() => void` | ✅ | ReactコンポーネントをDOMにレンダリングする関数 |

**処理フロー**: `isDev && enableMocking` が truthy の場合にモック初期化を `await` してから `renderApp()` を呼び出す。

---

## index.ts — API層の公開エントリポイント

`client.ts`, `queryClient.ts`, `bootstrap.ts` のすべてのエクスポートを集約し、TanStack Query の主要機能（`QueryClientProvider`, `useQuery`, `useMutation`, `useQueryClient`）を再エクスポートする。
