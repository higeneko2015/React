import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

/**
 * 権限判定用カスタムフック。
 * AuthProvider の配下で使用し、ユーザーの権限をチェックする。
 *
 * @throws {Error} AuthProvider の外側で使用された場合にスローされる
 *
 * @example
 * // 単一の権限チェック
 * const { hasPermission } = usePermission();
 * if (hasPermission('employee:edit')) {
 *   // 編集処理
 * }
 *
 * @example
 * // 複数の権限のいずれかをチェック
 * const { hasAnyPermission } = usePermission();
 * const canManage = hasAnyPermission(['employee:edit', 'employee:delete']);
 */
export const usePermission = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('usePermission must be used within an AuthProvider.');
  }
  return {
    /** 指定した権限を持っているか */
    hasPermission: context.hasPermission,
    /** 指定した権限のうち、いずれかを持っているか */
    hasAnyPermission: context.hasAnyPermission,
    /** 現在のログインユーザー */
    user: context.user,
    /** 認証済みかどうか */
    isAuthenticated: context.isAuthenticated,
  };
};
