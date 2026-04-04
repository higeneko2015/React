import { createContext, useContext } from 'react';

/**
 * グリッド内（InGrid）かどうかを保持するためのContext。
 * デフォルト値は false（グリッド外）。
 */
export const InGridContext = createContext<boolean>(false);

/**
 * 現在のコンポーネントがグリッド内（CompanyDataGrid等）で
 * レンダリングされているかどうかを取得するカスタムフック。
 */
export const useInGrid = () => useContext(InGridContext);