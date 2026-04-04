import { createContext, useContext } from 'react';

/**
 * レイアウトに関する状態と操作の型定義。
 */
export interface LayoutContextType {
  /** サイドバーが折りたたまれているかどうか */
  isSidebarCollapsed: boolean;
  /** サイドバーの開閉状態を切り替える関数 */
  toggleSidebar: () => void;
}

/**
 * レイアウト状態を共有するための Context。
 * 初期値は undefined とし、Provider 忘れを検知できるようにします。
 */
export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * 現在のレイアウト状態（サイドバーの開閉など）にアクセスするためのカスタムフック。
 * * @example
 * const { isSidebarCollapsed, toggleSidebar } = useLayout();
 * * @throws {Error} LayoutProvider（通常は CompanyAppShell）の外側で使用された場合にスローされます。
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error(
      'useLayout must be used within a LayoutProvider. ' +
      'Check if your component is wrapped by CompanyAppShell.'
    );
  }
  return context;
};