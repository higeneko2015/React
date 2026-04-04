import React from 'react';
import { InGridContext } from './useInGrid';

/**
 * グリッド内（InGrid）かどうかを子要素に伝えるための Context Provider。
 * CompanyDataGrid 等の内部で使用され、各種入力フィールドの表示モード（枠線の有無など）を切り替えます。
 */
export interface InGridProviderProps {
  /** Provider でラップする子要素 */
  children: React.ReactNode;
  /** グリッド内として扱うかどうかのフラグ（デフォルト: true） */
  value?: boolean;
}

export const InGridProvider = React.memo(({ children, value = true }: InGridProviderProps) => (
  <InGridContext.Provider value={value}>
    {children}
  </InGridContext.Provider>
));

InGridProvider.displayName = 'InGridProvider';