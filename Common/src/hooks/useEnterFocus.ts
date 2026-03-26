// useEnterFocus.ts （綺麗で真っ当な状態に戻す）
import { useCallback } from 'react';

export const useEnterFocus = (isComposing: boolean) => {
  return useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (isComposing || e.key !== 'Enter') return;

    // React AriaのEnterに対するデフォルト動作（ポップオーバーを開く等）を完全に防ぐ
    e.preventDefault();
    e.stopPropagation();

    const focusableSelectors = [
      'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const isVisible = (element: HTMLElement) => element.offsetWidth > 0 && element.offsetHeight > 0;
    
    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(isVisible);

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex > -1) {
      let nextElement: HTMLElement | undefined;
      if (e.shiftKey) {
        nextElement = focusableElements[currentIndex - 1];
      } else {
        nextElement = focusableElements[currentIndex + 1];
      }

      if (nextElement) {
        nextElement.focus();
      }
    }
  }, [isComposing]);
};