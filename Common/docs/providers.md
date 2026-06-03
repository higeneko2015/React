# グローバルProvider 仕様書

`Common/src/providers/` 配下のファイルの詳細仕様です。

---

## DialogProvider.tsx — ダイアログ表示管理Provider

### `<DialogProvider>`

アプリケーション全体で共通のダイアログ（確認・通知・警告・エラー）を表示・制御するProvider。

| Props | 型 | 必須 | 説明 |
|---|---|---|---|
| `children` | `ReactNode` | ✅ | ラップする子要素 |

**内部型定義**:

#### `IconVariant`

`'info' | 'confirm' | 'warning' | 'error'` — アイコン表示のバリアント

#### `DialogType`

`'confirm' | 'alert'` — `confirm` はOK/キャンセルの2択、`alert` はOKのみ

#### `QueuedDialog`

キューで管理する「リクエスト全体」のエントリ。表示オプションと Promise の resolve 関数をセットで保持。

**主要な内部ロジック**:

| 関数 | 説明 |
|---|---|
| `confirm(options)` | 確認ダイアログをキューに追加し、未表示なら即座に表示を開始する |
| `alert(options)` | 通知ダイアログをキューに追加し、未表示なら即座に表示を開始する |
| `showNext()` | キューの先頭にあるダイアログを画面に表示する。キューが空ならダイアログを閉じる |
| `handleClose(result)` | 現在表示中のダイアログをキューから取り出して Promise を resolve し、次のダイアログがあれば表示する |

**APIクライアント連携**: `useEffect` で `setGlobalErrorHandler` を登録し、API通信でシステムエラーが発生した場合に自動でエラーダイアログを表示する。メッセージカタログ（`useMessage`）によるメッセージ翻訳にも対応。

**UIライブラリ**: React Aria Components の `ModalOverlay`, `Modal`, `Dialog` を使用。アニメーション（fade-in / zoom-in）付き。

---

## MessageProvider.tsx — メッセージカタログ配信Provider

### `<MessageProvider>`

アプリケーション全体にメッセージマスタ（多言語対応の文言辞書）を配信するProvider。
通信やキャッシュの責務は持たず、渡された辞書を配下に提供することだけに専念する疎結合設計。

| Props | 型 | 必須 | 説明 |
|---|---|---|---|
| `messages` | `MessageCatalog` | ✅ | 外部から取得したメッセージカタログ（キーと文言の辞書） |
| `children` | `ReactNode` | ✅ | ラップする子要素 |

**内部実装**: `useMemo` で context の値をメモ化。`messages` が更新されない限り、参照を維持して配下の再レンダリングを抑止する。

---

## LoadingProvider.tsx — グローバルローディング管理Provider

### `<LoadingProvider>`

グローバルなローディング（スピナー）を管理するProvider。API通信のインターセプターと自動連携し、通信中は画面全体にオーバーレイを表示する。

| Props | 型 | 必須 | 説明 |
|---|---|---|---|
| `children` | `ReactNode` | ✅ | ラップする子要素 |

**内部状態**: `activeTasks: LoadingTask[]` — 現在実行中のローディングタスクの配列

**主要な内部ロジック**:

| 関数 | 説明 |
|---|---|
| `showLoading(message?)` | 一意のタスクIDを発行し、`activeTasks` に追加する。タスクIDを返す |
| `hideLoading(id)` | 指定されたタスクIDを `activeTasks` から除外する |

**APIクライアント連携**: `useEffect` で `setGlobalLoadingHandler` を登録。APIリクエストの開始/終了に応じて自動的に `showLoading('通信中...')` / `hideLoading(id)` が呼ばれる。

**表示ルール**:
- `activeTasks.length > 0` の場合、`CompanyLoadingOverlay` を `isInsideContainer={false}`（画面全体）で表示
- 複数タスクがある場合は、最後に追加されたタスクのメッセージを表示
