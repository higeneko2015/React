# Common - 社内共通コンポーネントライブラリ

モノレポ内の各業務アプリ（`app1` など）が共通で利用する **UIコンポーネント・認証・API基盤・フック** をまとめたパッケージです。
各アプリは `import { ... } from 'common'` で必要な機能をインポートして使用します。

## 📖 詳細仕様書

各ディレクトリの詳細なメソッド仕様（パラメータ・戻り値・処理内容）は以下のドキュメントを参照してください。

| ドキュメント | 内容 |
|---|---|
| [docs/api.md](docs/api.md) | API通信基盤（Axiosクライアント・インターセプター・TanStack Query設定） |
| [docs/auth.md](docs/auth.md) | 認証・権限管理（AuthUser型・AuthProvider・権限判定） |
| [docs/hooks.md](docs/hooks.md) | 共通カスタムフック（ダイアログ・フォーカス移動・ローディング・メッセージ・権限） |
| [docs/providers.md](docs/providers.md) | グローバルProvider（DialogProvider・MessageProvider・LoadingProvider） |
| [docs/components.md](docs/components.md) | UIコンポーネント（入力フィールド・ボタン・スピナー・タブ・グリッド・権限制御） |
| [docs/components-layout.md](docs/components-layout.md) | レイアウトコンポーネント（AppShell・Header・Sidebar・PageHeader） |
| [docs/components-hookform.md](docs/components-hookform.md) | React Hook Form連携ラッパー（Form〇〇 コンポーネント群） |

---

## ディレクトリ構成

```
Common/
├── src/
│   ├── index.ts                    # 公開エントリポイント（外部へのexport一覧）
│   ├── styles.css                  # Tailwind CSS v4 メインスタイルシート
│   ├── vite-env.d.ts               # Vite用の型定義（SVGモジュール等）
│   ├── api/                        # API通信基盤
│   ├── auth/                       # 認証・権限管理
│   ├── hooks/                      # 共通カスタムフック
│   ├── providers/                  # グローバルProvider
│   └── components/                 # UIコンポーネント
│       ├── layout/                 #   レイアウト系コンポーネント
│       └── HookForm/              #   React Hook Form連携ラッパー
├── eslint.config.base.js           # 全プロジェクト共通のESLint基本設定
├── eslint.config.js                # Common固有のESLint設定
├── tsconfig.base.json              # 全プロジェクト共通のTypeScript基本設定
├── tsconfig.json                   # Common固有のTypeScript設定
└── package.json
```

---

## src/api/ — API通信基盤

| ファイル | 役割 |
|---|---|
| `index.ts` | API層の公開エントリポイント。`client`・`queryClient`・`bootstrap` を集約してエクスポート |
| `client.ts` | Axiosベースの共通HTTPクライアント。認証トークンの自動付与（リクエストインターセプター）、システムエラーの一括ハンドリング（レスポンスインターセプター）、API通信中の自動ローディング表示を担う |
| `queryClient.ts` | TanStack Query の共通クライアントインスタンス。キャッシュ有効期限・リトライ回数などのデフォルト設定を一元管理 |
| `bootstrap.ts` | アプリケーション起動時の初期化関数。開発環境でのモック（MSW等）起動の待ち合わせを行ってからReactの描画を開始する |

---

## src/auth/ — 認証・権限管理

| ファイル | 役割 |
|---|---|
| `AuthContext.tsx` | 認証ユーザー（`AuthUser`）・権限キー（`Permission`）の型定義と、認証情報を配信するContextの作成 |
| `AuthProvider.tsx` | 認証情報をアプリ全体に配信するProvider。認証方法（ID/PW, SSO等）には関与せず、渡されたユーザー情報から権限判定機能（`hasPermission`）を提供する |

---

## src/hooks/ — 共通カスタムフック

| ファイル | 役割 |
|---|---|
| `useDialog.ts` | ダイアログ制御用のContextとカスタムフック。アプリのどこからでも `confirm()` / `alert()` を呼び出してダイアログを表示できる |
| `useEnterFocus.ts` | Enterキー押下時に次のフォーカス可能な要素へ移動するフック。IME入力中のスキップ、ダイアログ/フォーム単位のスコープ制御、遅延実行時のフォーカス泥棒防止に対応 |
| `useFocusSelect.ts` | テキスト入力フィールドへのフォーカス時にテキストを全選択するフック。タッチデバイスでは自動選択を抑制する |
| `useGlobalLoading.ts` | グローバルローディング制御用のContextとカスタムフック。`showLoading()` / `hideLoading()` でアプリ全体のスピナーを制御。複数リクエストの同時実行にも対応（タスクID管理） |
| `useMessage.ts` | メッセージカタログ（多言語対応）からコードを指定して文言を取得するフック。`{0}` 形式のプレースホルダ置換やJSON形式入力の自動パースに対応 |
| `usePermission.ts` | 現在のログインユーザーの権限チェックを行うフック。`hasPermission()` / `hasAnyPermission()` を提供する |

---

## src/providers/ — グローバルProvider

| ファイル | 役割 |
|---|---|
| `DialogProvider.tsx` | 確認・通知・警告・エラーダイアログのUI表示を管理するProvider。ダイアログのキュー管理（複数のダイアログを順番に表示）と、APIクライアントのグローバルエラーハンドラとの自動連携を持つ |
| `MessageProvider.tsx` | メッセージカタログ（JSON辞書）をアプリ全体に配信するProvider。カタログの取得方法には関与せず、渡された辞書を配下に提供する疎結合設計 |
| `LoadingProvider.tsx` | グローバルローディング（スピナー）を管理するProvider。APIクライアントのインターセプターと自動連携し、通信中は画面全体にオーバーレイを表示する |

---

## src/components/ — UIコンポーネント

### フォーム入力系

| ファイル | 役割 |
|---|---|
| `CompanyTextField.tsx` | テキスト入力フィールド。ラベル・エラー表示・クリアボタン・グリッド内モードに対応する基本コンポーネント |
| `CompanyNumberField.tsx` | 数値入力フィールド。数値フォーマット・バリデーション・右寄せ表示に対応 |
| `CompanyDateField.tsx` | 日付入力フィールド。日付フォーマットの自動変換・バリデーション・外部値との同期制御に対応 |
| `CompanyTimeField.tsx` | 時刻入力フィールド。時刻フォーマットの自動変換・バリデーション・外部値との同期制御に対応 |
| `CompanyCheckbox.tsx` | チェックボックス。ラベル付きの統一されたスタイル |
| `CompanyRadioGroup.tsx` | ラジオボタングループ。選択肢のリストからラジオボタンを生成 |
| `CompanyComboBox.tsx` | コンボボックス（ドロップダウン選択）。検索フィルタ・キーボード操作に対応 |
| `CompanyPostalField.tsx` | 郵便番号入力フィールド。ハイフン自動挿入・フォーマット制御に対応 |
| `CompanyPhoneField.tsx` | 電話番号入力フィールド。ハイフン自動挿入・フォーマット制御に対応 |
| `CompanyDisplayField.tsx` | 読み取り専用の表示フィールド。入力不可のデータ表示に使用 |

### 汎用UI系

| ファイル | 役割 |
|---|---|
| `CompanyButton.tsx` | ボタンコンポーネント。`primary` / `secondary` / `danger` などのバリアント切り替えに対応 |
| `CompanySpinner.tsx` | ローディングスピナー（アニメーション付き回転アイコン）。サイズ・色のカスタマイズに対応 |
| `CompanyLoadingOverlay.tsx` | ローディングオーバーレイ。スピナー＋メッセージを表示する半透明カバー。一瞬の表示によるチラつきを防ぐ遅延表示（`delayMs`）機能付き |
| `CompanyTabs.tsx` | タブ切り替えコンポーネント |
| `CompanyDataGrid.tsx` | データグリッド（テーブル）。仮想スクロール・インライン編集（`EditableCell`）に対応 |

### 権限制御

| ファイル | 役割 |
|---|---|
| `Authorized.tsx` | 指定した権限がある場合のみ子要素を表示する宣言的コンポーネント。権限がない場合は非表示（`hidden`）またはグレーアウト（`disabled`）を選択可能 |

### 内部ユーティリティ

| ファイル | 役割 |
|---|---|
| `companyTextFieldStyles.ts` | テキストフィールド系コンポーネントの共通スタイル定義。`tailwind-variants` を使用してコンテナ・入力欄・グループ・ラベル・エラー表示のスタイルを一元管理 |
| `InGridContext.tsx` | グリッド内（`CompanyDataGrid`）かどうかを子要素に伝えるContextのProvider。グリッド内では入力フィールドの外観（枠線なし等）を自動で切り替える |
| `useInGrid.ts` | 現在のコンポーネントがグリッド内でレンダリングされているかを取得するフック。`InGridContext` から値を読み取る |

---

## src/components/layout/ — レイアウト系コンポーネント

| ファイル | 役割 |
|---|---|
| `CompanyAppShell.tsx` | アプリケーション全体の骨格（ヘッダー＋サイドバー＋メインコンテンツ）を構成するシェルコンポーネント |
| `CompanyHeader.tsx` | 画面上部の共通ヘッダー。アプリ名・ユーザー情報などを表示 |
| `CompanySidebar.tsx` | 左サイドメニュー。階層メニュー・展開/折りたたみ・権限によるメニュー表示制御に対応 |
| `CompanyPageHeader.tsx` | ページごとのタイトルヘッダー。パンくずリスト的な役割 |
| `LayoutContext.tsx` | レイアウト状態（サイドバーの開閉など）を管理するProvider |
| `useLayout.ts` | レイアウト状態にアクセスするカスタムフック。`isSidebarCollapsed` / `toggleSidebar` を提供 |

---

## src/components/HookForm/ — React Hook Form 連携ラッパー

各UIコンポーネントを React Hook Form の `Controller` でラップしたコンポーネント群です。
フォーム内でバリデーションと連携して使用するためのラッパーで、`Form〇〇` という命名規則に従います。

| ファイル | ラップ対象 |
|---|---|
| `FormTextField.tsx` | `CompanyTextField` |
| `FormNumberField.tsx` | `CompanyNumberField` |
| `FormDateField.tsx` | `CompanyDateField` |
| `FormTimeField.tsx` | `CompanyTimeField` |
| `FormCheckbox.tsx` | `CompanyCheckbox` |
| `FormRadioGroup.tsx` | `CompanyRadioGroup` |
| `FormComboBox.tsx` | `CompanyComboBox` |
| `FormPostalField.tsx` | `CompanyPostalField` |
| `FormPhoneField.tsx` | `CompanyPhoneField` |

---

## ルートファイル

| ファイル | 役割 |
|---|---|
| `src/index.ts` | Commonパッケージの公開エントリポイント。外部（各アプリ）に公開するすべてのコンポーネント・フック・型・外部ライブラリの再エクスポートを定義 |
| `src/styles.css` | Tailwind CSS v4 のメインスタイルシート。`@source` で配下のコンポーネントからクラスを自動抽出 |
| `src/vite-env.d.ts` | Viteの型定義参照と、SVGモジュールの型宣言 |
| `eslint.config.base.js` | モノレポ全体で共有するESLintの基本ルール設定 |
| `eslint.config.js` | Commonパッケージ固有のESLint設定（基本設定を拡張） |
| `tsconfig.base.json` | モノレポ全体で共有するTypeScriptの基本コンパイラ設定 |
| `tsconfig.json` | Commonパッケージ固有のTypeScript設定（基本設定を拡張） |
