import React, { useMemo } from 'react';
import { AuthContext } from './AuthContext';

import type { AuthUser, AuthContextValue, Permission } from './AuthContext';
import type { ReactNode } from 'react';

/**
 * AuthProvider のプロパティ定義。
 */
export interface AuthProviderProps {
  /**
   * 認証済みユーザー情報。
   * ログインAPIから取得した情報をここに渡す。未ログインの場合は null を指定。
   */
  user: AuthUser | null;
  /** ラップする子要素 */
  children: ReactNode;
}

/**
 * アプリケーション全体に認証・権限情報を配信する Provider。
 *
 * 認証の「方法」（ID/PW、SSO、OAuth等）には関与せず、
 * 渡されたユーザー情報をもとに権限判定機能を提供することに専念する。
 *
 * @example
 * <AuthProvider user={currentUser}>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = React.memo(({ user, children }: AuthProviderProps) => {
  const contextValue = useMemo<AuthContextValue>(() => {
    // Set で保持することで hasPermission の判定を O(1) にする
    const permissionSet = new Set(user?.permissions ?? []);

    return {
      user,
      isAuthenticated: user !== null,
      hasPermission: (p: Permission) => permissionSet.has(p),
      hasAnyPermission: (ps: Permission[]) => ps.some(p => permissionSet.has(p)),
    };
  }, [user]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
});

AuthProvider.displayName = 'AuthProvider';
