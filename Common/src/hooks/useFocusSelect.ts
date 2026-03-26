import { useCallback } from 'react';

/**
 * タッチデバイスであるかを判定します。
 */
export const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * テキスト入力フィールドなどにおいて、フォーカスが当たった際に
 * タッチデバイスでなく、かつ読み取り専用でない場合に
 * 入力されているテキストを全選択する関数を返すフックです。
 * 
 * @param isReadOnly 読み取り専用かどうか
 * @param onAdditionalFocus （オプション）全選択以外に行いたい追加のフォーカス処理
 */
export const useFocusSelect = (
  isReadOnly?: boolean,
  onAdditionalFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
) => {
  return useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // 呼び出し元の追加処理があれば実行
    if (onAdditionalFocus) {
      onAdditionalFocus(e);
    }

    // タッチデバイスでなく読取専用でもないなら、内容を全選択する
    if (!isTouchDevice && !isReadOnly) {
      const target = e.target;
      requestAnimationFrame(() => {
        if (document.activeElement === target) {
          target.select();
        }
      });
    }
  }, [isReadOnly, onAdditionalFocus]);
};
