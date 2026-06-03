# UIコンポーネント 仕様書

`Common/src/components/` 配下のファイルの詳細仕様です。

---

## 共通仕様

以下のプロパティはほぼすべての入力コンポーネントで共通です。

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `label` | `string` | — | フィールドのラベル |
| `width` | `'full' \| 'auto' \| number \| string` | `'full'` | コンポーネント全体の幅。数値の場合は `ch` 単位 |
| `isReadOnly` | `boolean` | — | 読み取り専用かどうか |
| `isInvalid` | `boolean` | — | エラー状態かどうか |
| `errorMessage` | `string` | — | エラー時のメッセージキー（メッセージカタログから翻訳される） |
| `description` | `string` | — | 補足説明文 |
| `placeholder` | `string` | — | プレースホルダーテキスト |
| `isClearable` | `boolean` | `false` | クリア（✕）ボタンを表示するか |
| `className` | `string` | — | 追加のTailwindクラス名 |

**グリッド内自動判定**: すべてのコンポーネントは内部で `useInGrid()` を呼び出し、`CompanyDataGrid` 内でレンダリングされている場合は自動的にラベル非表示・枠線なしのコンパクトモードに切り替わる。

---

## CompanyTextField — テキスト入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `string \| null` | `""` | 現在の値 |
| `onChange` | `(value: string) => void` | — | 値変更時コールバック |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | テキストの配置 |
| `maxLength` | `number` | — | 最大入力文字数 |
| `allowedChars` | `RegExp` | — | 許可する文字の正規表現（例: `/^[a-zA-Z0-9]+$/`） |
| `format` | `(val: string) => string` | — | フォーカスアウト時の表示用フォーマット関数 |
| `type` | `'text' \| 'password' \| 'email' \| 'search' \| 'tel' \| 'url'` | `'text'` | input要素のtype属性 |
| `inputMode` | `'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search'` | `'text'` | モバイルのキーボードタイプ |
| `enterKeyHint` | `'enter' \| 'done' \| 'go' \| 'next' \| 'previous' \| 'search' \| 'send'` | `'next'` | モバイルのEnterキーラベル |

**ref**: `HTMLInputElement` に転送可能（`forwardRef`）

---

## CompanyNumberField — 数値入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `number \| null` | `null` | 現在の数値 |
| `onChange` | `(value: number \| null) => void` | — | 値変更時コールバック（空欄時は `null`） |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'right'` | テキストの配置 |
| `fractionDigits` | `number` | `0` | 小数点以下の表示桁数 |

**表示動作**: フォーカス中は生の数値を表示。フォーカスアウト時に `Intl.NumberFormat` でカンマ区切りフォーマットを適用。

---

## CompanyDateField — 日付入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `string \| null` | `""` | 現在の値（`YYYY/MM/DD` 等の文字列） |
| `onChange` | `(value: string \| null) => void` | — | 値変更時コールバック（空欄時は `null`） |
| `formatType` | `'YYYY/MM/DD' \| 'YYYY/MM' \| 'MM/DD'` | `'YYYY/MM/DD'` | 日付のフォーマット形式 |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | テキストの配置 |

**表示動作**:
- フォーカス中は数字のみの入力（スラッシュを剥がす）
- フォーカスアウト時に自動でスラッシュを補完し、日付の妥当性を検証
- 6桁入力（`260510`）は `2026/05/10` のように年を補完
- `YYYY/MM/DD` 形式の場合、📅カレンダーピッカーが利用可能

---

## CompanyTimeField — 時刻入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `string \| null` | `""` | 現在の時刻 |
| `onChange` | `(value: string \| null) => void` | — | 値変更時コールバック（空欄時は `null`） |
| `formatType` | `'HH:mm:ss' \| 'HH:mm' \| 'HH' \| 'mm:ss'` | `'HH:mm'` | 時刻のフォーマット形式 |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | テキストの配置 |

**表示動作**: フォーカス中は数字のみの入力。フォーカスアウト時に自動でコロンを補完し、時刻の妥当性を検証。

---

## CompanyCheckbox — チェックボックス

### Props（`react-aria-components` の `CheckboxProps` を継承、`children` を除外）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `label` | `string` | — | チェックボックスの横に表示するラベルテキスト |
| `description` | `string` | — | 補足説明文 |
| `errorMessage` | `string` | — | エラー時のメッセージキー |
| `width` | `'full' \| 'auto' \| number \| string` | `'full'` | コンポーネント全体の幅 |
| `className` | `string` | — | 追加のTailwindクラス名 |

**ref**: `HTMLLabelElement` に転送可能

---

## CompanyRadioGroup — ラジオボタングループ

### Props（`react-aria-components` の `RadioGroupProps` を継承、`children` を除外）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `label` | `string` | — | グループ全体のラベルテキスト |
| `children` | `ReactNode` | — | `CompanyRadioGroup.Radio` コンポーネントの要素 |
| `isInvalid` | `boolean` | — | エラー状態かどうか |
| `errorMessage` | `string` | — | エラー時のメッセージキー |
| `description` | `string` | — | 補足説明文 |

**Compound Component パターン**: `CompanyRadioGroup.Radio` としてラジオボタン単体を使用する。

```tsx
<CompanyRadioGroup label="性別" value={gender} onChange={setGender}>
  <CompanyRadioGroup.Radio value="male">男性</CompanyRadioGroup.Radio>
  <CompanyRadioGroup.Radio value="female">女性</CompanyRadioGroup.Radio>
</CompanyRadioGroup>
```

---

## CompanyComboBox — コンボボックス（ドロップダウン選択）

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `options` | `{ label: string; value: string }[]` | — | 選択肢の配列 |
| `value` | `string \| null` | — | 現在の選択値（value） |
| `onChange` | `(value: string \| null) => void` | — | 値変更時コールバック（クリア時は `null`） |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | 入力テキストの配置 |

**表示動作**:
- 入力補完付きのドロップダウンリストを提供
- 自由テキスト入力を許可（`allowsCustomValue`）し、フォーカスアウト時に選択肢と照合
- 完全一致しない場合は元の値に復帰、または空欄に戻す

---

## CompanyPostalField — 郵便番号入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `string \| null` | `""` | 現在の郵便番号（ハイフンなし） |
| `onChange` | `(value: string) => void` | — | 値変更時コールバック（ハイフンなしの7桁数字文字列） |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | テキストの配置 |

**表示動作**: フォーカス中は7桁の数字のみ。フォーカスアウト時に `123-4567` 形式でハイフンを自動挿入して表示。

**静的メソッド**: `CompanyPostalField.formatView(value)` — 文字列の郵便番号をフォーマットして返すユーティリティ

---

## CompanyPhoneField — 電話番号入力

### Props（共通プロパティに加えて）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `value` | `string \| null` | `""` | 現在の電話番号（ハイフンなし） |
| `onChange` | `(value: string) => void` | — | 値変更時コールバック（ハイフンなしの数字文字列） |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | テキストの配置 |

**表示動作**:
- フォーカス中は最大11桁の数字のみ
- フォーカスアウト時にハイフンを自動挿入
  - 11桁: `090-1234-5678` 形式
  - 10桁: `03-1234-5678` 形式

**静的メソッド**: `CompanyPhoneField.formatView(value)` — 文字列の電話番号をフォーマットして返すユーティリティ

---

## CompanyDisplayField — 読み取り専用表示フィールド

### Props

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `label` | `string` | — | フィールドのラベル（グリッド外でのみ表示） |
| `value` | `ReactNode` | — | 表示する値（テキストやReact要素） |
| `width` | `'full' \| 'auto' \| number \| string` | `'full'` | コンポーネント全体の幅 |
| `description` | `string` | — | 補足説明文 |
| `variant` | `'text' \| 'box'` | `'text'` | 見た目のバリエーション（`box` はグレー背景+枠線付き） |
| `className` | `string` | — | 追加のTailwindクラス名 |

---

## CompanyButton — ボタン

### Props（`react-aria-components` の `ButtonProps` を継承）

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'secondary'` | ボタンの視覚的な種類 |
| `width` | `'auto' \| 'full'` | `'auto'` | ボタンの幅 |
| `className` | `string` | — | 追加のTailwindクラス名 |

**特殊な挙動**: フォーム内ではEnterキーの`onPress`を抑止し、代わりにフォーカス移動に変換する（`useEnterFocus` と連携）。これにより、Enterキーでフォームを送信してしまう誤操作を防止。

---

## CompanySpinner — ローディングスピナー

### Props

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | スピナーのサイズ |
| `className` | `string` | — | 追加のTailwindクラス名（色指定など） |

| サイズ | 実寸 |
|---|---|
| `sm` | 20×20px |
| `md` | 32×32px |
| `lg` | 48×48px |
| `xl` | 64×64px |

---

## CompanyLoadingOverlay — ローディングオーバーレイ

### Props

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `isLoading` | `boolean` | — | ローディング中かどうか |
| `delayMs` | `number` | `500` | 表示開始までの遅延時間（ミリ秒）。一瞬のチラつき防止用 |
| `message` | `string` | — | 表示するメッセージテキスト |
| `isInsideContainer` | `boolean` | `true` | `true`: 親要素内に表示（`absolute`）、`false`: 画面全体に表示（`fixed`） |
| `className` | `string` | — | 追加のTailwindクラス名 |

---

## CompanyTabs — タブ切り替え

**Compound Component パターン**で使用する。

| サブコンポーネント | 説明 |
|---|---|
| `CompanyTabs` | タブ全体のルートコンテナ |
| `CompanyTabs.List` | タブボタンの並ぶリスト |
| `CompanyTabs.Tab` | 個別のタブボタン |
| `CompanyTabs.Panel` | タブに対応するコンテンツパネル |

```tsx
<CompanyTabs>
  <CompanyTabs.List>
    <CompanyTabs.Tab id="basic">基本情報</CompanyTabs.Tab>
    <CompanyTabs.Tab id="detail">詳細情報</CompanyTabs.Tab>
  </CompanyTabs.List>
  <CompanyTabs.Panel id="basic">基本情報の内容...</CompanyTabs.Panel>
  <CompanyTabs.Panel id="detail">詳細情報の内容...</CompanyTabs.Panel>
</CompanyTabs>
```

---

## Authorized — 権限制御コンポーネント

### Props

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `permission` | `Permission` | — | 必要な権限キー（例: `"employee:delete"`） |
| `fallback` | `'hidden' \| 'disabled'` | `'hidden'` | 権限がないときの振る舞い |
| `children` | `ReactNode` | — | 権限がある場合に表示する子要素 |

**動作**:
- `hidden`: 権限がない場合、何も描画しない
- `disabled`: 権限がない場合、子要素に `isDisabled: true` を注入してグレーアウト表示

```tsx
<Authorized permission="employee:delete">
  <CompanyButton variant="danger">削除</CompanyButton>
</Authorized>
```

---

## 内部ユーティリティ

### companyTextFieldStyles.ts — 共通スタイル定義

`tailwind-variants` を使用して定義されたスタイル関数群。

| 関数/定数 | 用途 |
|---|---|
| `containerStyles({ width })` | テキストフィールド系のコンテナ外枠 |
| `inputStyles({ textAlign, hasClearButton })` | `<Input>` 要素のスタイル |
| `groupStyles({ isInvalid, isReadOnly, isInGrid })` | `<Group>` 要素（入力欄の視覚コンテナ）のスタイル |
| `labelCommonStyles({ isInGrid })` | ラベルの共通スタイル（グリッド内では `sr-only`） |
| `descriptionStyles` | 補足説明文のスタイル（定数） |
| `errorMessageStyles` | エラーメッセージのスタイル（定数） |
| `clearButtonStyles()` | クリアボタンのスタイル |

### InGridContext.tsx / useInGrid.ts — グリッド内判定

| エクスポート | 説明 |
|---|---|
| `InGridContext` | グリッド内かどうかを保持する `Context<boolean>`（デフォルト: `false`） |
| `InGridProvider` | グリッド内であることを子要素に伝える Provider |
| `useInGrid()` | 現在のコンポーネントがグリッド内かを返すフック |
