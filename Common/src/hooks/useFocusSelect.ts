import { useCallback } from 'react';

/**
 * 実行環境がタッチデバイスであるかを判定します。
 * (内部的な定数だけど、利用時の自然さを優先して小文字にしますね！)
 */
export const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * テキスト入力フィールドにおいて、フォーカス時にテキストを全選択するためのカスタムフック。
 */
export const useFocusSelect = <T extends HTMLInputElement | HTMLTextAreaElement>(
  isReadOnly?: boolean,
  onAdditionalFocus?: (e: React.FocusEvent<T>) => void
) => {
  return useCallback((e: React.FocusEvent<T>) => {
    if (onAdditionalFocus) {
      onAdditionalFocus(e);
    }

    // ✨ ほら！これなら統一感があってスッキリ！
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