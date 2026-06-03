# 認証・権限管理 仕様書

`Common/src/auth/` 配下のファイルの詳細仕様です。

---

## AuthContext.tsx — 認証コンテキストと型定義

### 型: `Permission`

```typescript
type Permission = string;
```

権限キーの型。「リソース:操作」形式で命名する（例: `"employee:read"`, `"payroll:edit"`）。

### 型: `AuthUser`

認証済みユーザーの最小情報。

| プロパティ | 型 | 説明 |
|---|---|---|
| `id` | `string` | ユーザーの一意識別子 |
| `name` | `string` | 表示名 |
| `roles` | `string[]` | 所属ロール（管理者、一般など） |
| `permissions` | `Permission[]` | 許可された操作の一覧（権限キー） |

### 型: `AuthContextValue`

| プロパティ | 型 | 説明 |
|---|---|---|
| `user` | `AuthUser \| null` | 現在のログインユーザー（未認証時は null） |
| `isAuthenticated` | `boolean` | 認証済みかどうか |
| `hasPermission` | `(permission: Permission) => boolean` | 指定した権限を持っているか判定する |
| `hasAnyPermission` | `(permissions: Permission[]) => boolean` | 指定した権限のうちいずれか1つでも持っているか判定する |

### `AuthContext`

`createContext<AuthContextValue | null>(null)` で作成されたContext。AuthProvider の外側では `null` となる。

---

## AuthProvider.tsx — 認証情報配信Provider

### `<AuthProvider>`

アプリケーション全体に認証・権限情報を配信するProvider。
認証の「方法」（ID/PW、SSO、OAuth等）には関与せず、渡されたユーザー情報をもとに権限判定機能を提供する。

| Props | 型 | 必須 | 説明 |
|---|---|---|---|
| `user` | `AuthUser \| null` | ✅ | ログインAPIから取得した認証済みユーザー情報。未ログインの場合は `null` |
| `children` | `ReactNode` | ✅ | ラップする子要素 |

**内部実装の特徴**:
- `permissions` を `Set` で保持することで、`hasPermission` の判定を **O(1)** にしている
- `useMemo` で contextValue をメモ化し、`user` が変わらない限り再レンダリングを抑止

```tsx
<AuthProvider user={currentUser}>
  <App />
</AuthProvider>
```
