# レイアウトコンポーネント 仕様書

`Common/src/components/layout/` 配下のファイルの詳細仕様です。

---

## CompanyAppShell — アプリケーションシェル

アプリケーション全体の骨格（ヘッダー＋サイドバー＋メインコンテンツ）を構成するシェルコンポーネント。
内部で `LayoutProvider` を配置し、配下のコンポーネントにレイアウト状態を自動提供する。

### Props

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `header` | `ReactNode` | ✅ | 画面上部に固定表示するヘッダー要素 |
| `sidebar` | `ReactNode` | ✅ | 画面左側に固定表示するサイドバー要素 |
| `children` | `ReactNode` | ✅ | メインコンテンツエリアに表示する内容 |
| `className` | `string` | — | 追加のTailwindクラス名 |

**レイアウト構造**: `100vh` の固定レイアウト。メインコンテンツエリアのみ `overflow-y-auto` でスクロール可能。

```tsx
<CompanyAppShell
  header={<CompanyHeader appName="人事管理" userName="山田太郎" />}
  sidebar={<CompanySidebar menuItems={[...]} />}
>
  <ページの内容 />
</CompanyAppShell>
```

---

## CompanyHeader — 共通ヘッダー

画面最上部に表示されるアプリケーション共通ヘッダー。

### Props

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `appName` | `string` | ✅ | アプリケーションの名前 |
| `userName` | `string` | ✅ | ログイン中のユーザー名 |
| `children` | `ReactNode` | — | 右端のアクションエリアに表示するカスタム要素（通知アイコンなど） |

**内部動作**: `useLayout()` から `toggleSidebar` を取得し、ハンバーガーメニューボタンのクリックでサイドバーの開閉を切り替える。

---

## CompanySidebar — サイドバーメニュー

画面左側に固定表示されるナビゲーションメニュー。

### Props

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `menuItems` | `MenuItem[]` | ✅ | メニュー項目の配列（階層構造対応） |
| `currentId` | `string` | — | 現在選択中のメニューID |
| `onSelect` | `(id: string) => void` | — | メニュー項目選択時のコールバック |

### 型: `MenuItem`

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | ✅ | メニューの一意識別子 |
| `label` | `string` | ✅ | 表示ラベル |
| `icon` | `ReactNode` | — | メニューの左側に表示するアイコン |
| `children` | `MenuItem[]` | — | サブメニュー（階層構造） |
| `permission` | `Permission` | — | 表示に必要な権限キー |

**特徴**:
- 再帰的にメニューを描画し、階層メニューの展開/折りたたみに対応
- `permission` が指定されたメニューは、ユーザーが該当権限を持たない場合に非表示
- `useLayout()` と連携し、サイドバーの折りたたみ状態に応じて幅を変更

---

## CompanyPageHeader — ページヘッダー

各ページの最上部に表示するタイトル＋アクションエリアのヘッダー。

### Props

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | `string` | ✅ | ページの大見出し |
| `description` | `string` | — | タイトルの下に表示する補足テキスト |
| `children` | `ReactNode` | — | 右側に表示する操作要素（ボタンなど） |
| `className` | `string` | — | 追加のスタイルクラス |

```tsx
<CompanyPageHeader title="社員マスタ" description="社員情報の検索・登録・編集を行います">
  <CompanyButton variant="primary">新規登録</CompanyButton>
</CompanyPageHeader>
```

---

## LayoutContext.tsx / useLayout.ts — レイアウト状態管理

### `<LayoutProvider>`

| Props | 型 | 必須 | 説明 |
|---|---|---|---|
| `children` | `ReactNode` | ✅ | ラップする子要素 |
| `defaultCollapsed` | `boolean` | — | サイドバーの初期開閉状態（デフォルト: `false`） |

### `useLayout()`

**戻り値**: `LayoutContextType`

| プロパティ | 型 | 説明 |
|---|---|---|
| `isSidebarCollapsed` | `boolean` | サイドバーが折りたたまれているかどうか |
| `toggleSidebar` | `() => void` | サイドバーの開閉状態を切り替える関数 |

- `LayoutProvider`（通常は `CompanyAppShell`）の外側で使用すると `Error` をスローする
