# カスタムフック 仕様書

`Common/src/hooks/` 配下のファイルの詳細仕様です。

---

## useDialog.ts — ダイアログ制御フック

### 型: `DialogOptions`

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | `string` | — | ダイアログのタイトル |
| `message` | `string \| ReactNode` | ✅ | 表示するメッセージ内容 |
| `variant` | `'info' \| 'confirm' \| 'warning' \| 'error'` | — | ダイアログの種類（アイコン切り替え用） |
| `confirmLabel` | `string` | — | 確認ボタンのラベル |
| `cancelLabel` | `string` | — | キャンセルボタンのラベル |

### `useDialog()`

**戻り値**: `DialogContextType`

| メソッド | 型 | 説明 |
|---|---|---|
| `confirm(options)` | `(options: DialogOptions \| string) => Promise<boolean>` | 確認ダイアログを表示。OKなら `true`、キャンセルなら `false` |
| `alert(options)` | `(options: DialogOptions \| string) => Promise<void>` | 通知ダイアログを表示。閉じられたら resolve |

- `DialogProvider` の外側で使用すると `Error` をスローする
- `options` に `string` を渡した場合はメッセージとして扱われる

```tsx
const { confirm } = useDialog();
if (await confirm("本当に削除しますか？")) {
  // 削除処理
}
```

---

## useEnterFocus.ts — Enter キーによるフォーカス移動

### 型: `EnterKeyEvent`

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `key` | `string` | ✅ | キー名 |
| `shiftKey` | `boolean` | ✅ | Shiftキーが押されているか |
| `preventDefault` | `() => void` | ✅ | デフォルト動作の抑止 |
| `stopPropagation` | `() => void` | ✅ | イベントのバブリング抑止 |
| `fromElement` | `HTMLElement \| null` | — | フォーカス移動の起点要素（遅延実行時にキー押下時点の要素をキャプチャして渡す） |

### `useEnterFocus(isComposing)`

| パラメータ | 型 | 説明 |
|---|---|---|
| `isComposing` | `boolean` | IME入力中かどうか（`true` なら移動処理をスキップ） |

**戻り値**: `(e: React.KeyboardEvent<HTMLElement> | EnterKeyEvent) => void`

**処理内容**:
1. IME入力中（`isComposing`）または Enter キー以外の場合は何もしない
2. `fromElement` が渡されていればそちらを起点、なければ `document.activeElement` を使用
3. 起点要素から `resolveFocusRoot()` でフォーカス探索のルート要素を解決（dialog > form > body の優先順位）
4. ルート内のフォーカス可能な要素を取得し、**Shift+Enter なら前へ、Enter なら次へ**移動
5. 移動直前にユーザーが別の場所にフォーカスを移していた場合は自動移動をキャンセル（フォーカス泥棒防止）

**内部定数**: `FOCUSABLE_SELECTORS` — `input`, `select`, `textarea`, `button`, `[tabindex]` のうち、`disabled` や `tabindex="-1"` でないもの

---

## useFocusSelect.ts — フォーカス時テキスト全選択

### `isTouchDevice`

```typescript
export const isTouchDevice: boolean
```

実行環境がタッチデバイスかどうかの判定結果。

### `useFocusSelect(isReadOnly?, onAdditionalFocus?)`

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `isReadOnly` | `boolean` | — | 読み取り専用の場合は全選択をスキップ |
| `onAdditionalFocus` | `(e: React.FocusEvent<T>) => void` | — | フォーカス時に追加で実行するコールバック |

**型パラメータ**: `T extends HTMLInputElement | HTMLTextAreaElement`

**戻り値**: `(e: React.FocusEvent<T>) => void`

**処理内容**: タッチデバイスでなく、かつ読み取り専用でない場合に、`requestAnimationFrame` でフォーカスが維持されていることを確認してから `target.select()` を実行

---

## useGlobalLoading.ts — グローバルローディング制御

### 型: `LoadingTask`

| プロパティ | 型 | 説明 |
|---|---|---|
| `id` | `string` | 一意のタスク識別子 |
| `message` | `string` | ローディング画面に表示するメッセージ |

### `useGlobalLoading()`

**戻り値**: `GlobalLoadingContextType`

| メソッド/プロパティ | 型 | 説明 |
|---|---|---|
| `showLoading(message?)` | `(message?: string) => string` | ローディング表示を開始し、一意のタスクIDを返す |
| `hideLoading(id)` | `(id: string) => void` | 指定したタスクIDのローディングを解除する |
| `activeTasks` | `LoadingTask[]` | 現在実行中のローディングタスク一覧 |

- `LoadingProvider` の外側で使用すると `Error` をスローする
- 複数回 `showLoading()` を呼んだ場合、すべて `hideLoading()` されるまでスピナーが消えない

```tsx
const { showLoading, hideLoading } = useGlobalLoading();
const taskId = showLoading('保存中...');
try {
  await saveApi();
} finally {
  hideLoading(taskId);
}
```

---

## useMessage.ts — メッセージカタログ翻訳フック

### 型: `MessageCatalog`

```typescript
type MessageCatalog = Record<string, string>;
```

キーにメッセージコード、値にメッセージ本文（プレースホルダ込）を保持する辞書。

### `useMessage()`

**戻り値**: `{ t }`

### `t(codeOrMessage, ...args)`

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `codeOrMessage` | `string \| undefined \| null` | ✅ | メッセージコード、JSON形式の文字列、または生のメッセージ |
| `...args` | `unknown[]` | — | `{0}`, `{1}` 形式のプレースホルダ置換用引数 |

**戻り値**: `string`

**処理内容**:
1. `null` / `undefined` の場合は空文字を返す
2. `{` で始まる文字列はJSONとしてパースを試み、`{ code, args }` 形式なら展開する
3. メッセージカタログから `code` に一致する文言を取得（なければコードをそのまま返す）
4. `{0}`, `{1}` ... のプレースホルダを引数で一括置換

```tsx
const { t } = useMessage();
t('E0001', '氏名');                              // => "氏名は必須入力です"
t('{"code":"E0001","args":["住所"]}');            // => "住所は必須入力です"
```

---

## usePermission.ts — 権限チェックフック

### `usePermission()`

**戻り値**:

| プロパティ | 型 | 説明 |
|---|---|---|
| `hasPermission` | `(permission: Permission) => boolean` | 指定した権限を持っているか |
| `hasAnyPermission` | `(permissions: Permission[]) => boolean` | 指定した権限のうちいずれかを持っているか |
| `user` | `AuthUser \| null` | 現在のログインユーザー |
| `isAuthenticated` | `boolean` | 認証済みかどうか |

- `AuthProvider` の外側で使用すると `Error` をスローする

```tsx
const { hasPermission } = usePermission();
if (hasPermission('employee:edit')) {
  // 編集処理
}
```
