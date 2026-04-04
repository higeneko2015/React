import { createContext, useContext } from 'react';

/**
 * ダイアログを表示する際のオプション設定。
 */
export interface DialogOptions {
  /** ダイアログのタイトル */
  title?: string;
  /** 表示するメッセージ内容（文字列またはReact要素） */
  message: string | ReactNode;
  /** ダイアログの種類（外観やアイコンの切り替えに使用） */
  variant?: 'info' | 'confirm' | 'warning' | 'error';
  /** 確認ボタンのラベル */
  confirmLabel?: string;
  /** キャンセルボタンのラベル */
  cancelLabel?: string;
}

/**
 * ダイアログ操作を提供するためのコンテキスト型定義。
 */
export interface DialogContextType {
  /** * 確認ダイアログを表示します。
   * @returns OKなら true、キャンセルなら false を返す Promise
   */
  confirm: (options: DialogOptions | string) => Promise<boolean>;
  /** * アラートダイアログを表示します。
   * @returns ダイアログが閉じられたときに解決される Promise
   */
  alert: (options: DialogOptions | string) => Promise<void>;
}

// 型のインポートはルール 5 に従って一番下に！
import type { ReactNode } from 'react';

/**
 * ダイアログ制御用の Context。
 */
export const DialogContext = createContext<DialogContextType | null>(null);

/**
 * アプリケーション内のどこからでもダイアログを呼び出すためのカスタムフック。
 * * @example
 * const { confirm } = useDialog();
 * if (await confirm("本当に削除しますか？")) {
 * // 削除処理
 * }
 * * @throws {Error} DialogProvider の外側で使用された場合にスローされます。
 */
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider.');
  }
  return context;
};