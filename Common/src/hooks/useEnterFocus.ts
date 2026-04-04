import { useCallback } from 'react';

/**
 * フォーカス可能な要素を特定するためのセレクタ。
 * 無効化されているものや、タブインデックスが -1 のものは除外します。
 */
const FOCUSABLE_SELECTORS = [
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'select:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'textarea:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'button:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])'
].join(', ');

/** useEnterFocus に渡せるキーイベントの最小インターフェース */
export interface EnterKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
}

/**
 * Enterキー押下時に、次のフォーカス可能な要素へ移動するためのカスタムフック。
 * * @param isComposing - IME入力（漢字変換など）の最中かどうか。true の場合は移動処理をスキップします。
 * @returns キーボードイベントハンドラ
 * * @example
 * const handleKeyDown = useEnterFocus(isComposing);
 * <input onKeyDown={handleKeyDown} />
 */
export const useEnterFocus = (isComposing: boolean) => {
  return useCallback((e: React.KeyboardEvent<HTMLElement> | EnterKeyEvent) => {
    // IME入力中、またはEnterキー以外の場合は何もしない
    if (isComposing || e.key !== 'Enter') return;

    // React Ariaのデフォルト動作（ポップオーバーを開く等）を完全に防ぐ
    e.preventDefault();
    e.stopPropagation();

    // 要素が表示されている（高さと幅がある）かチェックする関数
    const isVisible = (element: HTMLElement) => element.offsetWidth > 0 && element.offsetHeight > 0;

    // ダイアログ内であればその範囲で、そうでなければ body 全体から探す
    const root = (
      (document.activeElement?.closest('[role="dialog"], [aria-modal="true"]') as HTMLElement)
      ?? document.body
    );

    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(isVisible);

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex > -1) {
      // Shift + Enter なら前へ、Enter なら次へ
      const direction = e.shiftKey ? -1 : 1;
      const nextElement = focusableElements[currentIndex + direction];

      if (nextElement) {
        nextElement.focus();
      }
    }
  }, [isComposing]);
};