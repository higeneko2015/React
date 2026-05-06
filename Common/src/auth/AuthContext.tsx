import { createContext } from 'react';

// ─────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────

/**
 * 権限キーの型。
 * 「リソース:操作」形式で命名する（例: "employee:read", "payroll:edit"）。
 */
export type Permission = string;

/**
 * 認証済みユーザーの最小情報。
 * ログインAPIのレスポンスからマッピングして使用する。
 */
export interface AuthUser {
  /** ユーザーの一意識別子 */
  id: string;
  /** 表示名 */
  name: string;
  /** 所属ロール（管理者、一般など） */
  roles: string[];
  /** 許可された操作の一覧（権限キー） */
  permissions: Permission[];
}

/**
 * 認証・権限コンテキストが配信する値の型定義。
 */
export interface AuthContextValue {
  /** 現在のログインユーザー（未認証時は null） */
  user: AuthUser | null;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** 指定した権限を持っているか判定する */
  hasPermission: (permission: Permission) => boolean;
  /** 指定した権限のうち、いずれか1つでも持っているか判定する */
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

/**
 * 認証・権限情報を配信するための Context。
 * AuthProvider の外側で使用された場合は null となる。
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
