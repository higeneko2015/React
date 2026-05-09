import { createContext, useContext } from 'react';

/**
 * ローディング要求のタスク情報
 */
export interface LoadingTask {
  id: string;
  message?: string;
}

/**
 * グローバルローディングのコンテキスト型
 */
export interface GlobalLoadingContextType {
  /**
   * ローディング表示を開始します。
   * @param message ローディング画面に表示するメッセージ（オプション）
   * @returns 発行された一意のタスクID（hideLoadingで解除する際に使用します）
   */
  showLoading: (message?: string) => string;
  /**
   * 指定したタスクIDのローディング表示を解除します。
   * @param id showLoadingから返されたタスクID
   */
  hideLoading: (id: string) => void;
  /**
   * 現在実行中のローディングタスク一覧
   */
  activeTasks: LoadingTask[];
}

export const GlobalLoadingContext = createContext<GlobalLoadingContextType | null>(null);

/**
 * アプリ全体共通のローディング表示を制御するカスタムフック。
 * 
 * @example
 * const { showLoading, hideLoading } = useGlobalLoading();
 * 
 * const handleSave = async () => {
 *   const taskId = showLoading('保存中...');
 *   try {
 *     await saveApi();
 *   } finally {
 *     hideLoading(taskId);
 *   }
 * };
 * 
 * @throws {Error} LoadingProvider の外側で使用された場合にスローされます。
 */
export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider.');
  }
  return context;
};
