import React from 'react';
import { usePermission } from '../hooks/usePermission';

import type { Permission } from '../auth/AuthContext';

/**
 * Authorized コンポーネントのプロパティ定義。
 */
export interface AuthorizedProps {
  /** 必要な権限キー（例: "employee:delete"） */
  permission: Permission;
  /**
   * 権限がないときの振る舞い。
   * - "hidden" (デフォルト): 子要素を描画しない（非表示）
   * - "disabled": 子要素を disabled 状態で描画する（グレーアウト）
   */
  fallback?: 'hidden' | 'disabled';
  /** 権限がある場合に表示する子要素 */
  children: React.ReactNode;
}

/**
 * 指定された権限をユーザーが持っている場合のみ、子要素を表示するコンポーネント。
 * 宣言的に権限制御を行うことで、JSXの可読性を保つ。
 *
 * @example
 * // 権限がなければボタンを非表示
 * <Authorized permission="employee:delete">
 *   <CompanyButton variant="danger">削除</CompanyButton>
 * </Authorized>
 *
 * @example
 * // 権限がなければボタンを無効化（グレーアウト）
 * <Authorized permission="employee:edit" fallback="disabled">
 *   <CompanyButton onPress={handleEdit}>編集</CompanyButton>
 * </Authorized>
 */
export const Authorized = React.memo(({ permission, fallback = 'hidden', children }: AuthorizedProps) => {
  const { hasPermission } = usePermission();

  // 権限あり → そのまま描画
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // 権限なし + disabled モード → 子要素に isDisabled を注入
  if (fallback === 'disabled') {
    return (
      <>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { isDisabled: true } as Record<string, unknown>)
            : child
        )}
      </>
    );
  }

  // 権限なし + hidden モード → 何も描画しない
  return null;
});

Authorized.displayName = 'Authorized';
