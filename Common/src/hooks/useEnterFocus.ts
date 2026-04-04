import { useCallback, useEffect, useRef } from 'react';

/**
 * フォーカス可能な要素を特定するためのセレクタ。
 * 無効化されているものや、タブインデックスが -1 のものは除外します。
 */
const FOCUSABLE_SELECTORS = [
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'select:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'textarea:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  'button:not([disabled]):not([tabindex="-1"]):not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
].join(', ');

/** useEnterFocus に渡せるキーイベントの最小インターフェース */
export interface EnterKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  /**
   * フォーカス移動の起点となる要素。
   * rAF / setTimeout 経由で遅延実行する場合は、キー押下時点の
   * `document.activeElement` をキャプチャしてここに渡すこと。
   *
   * 省略した場合は実行時点の `document.activeElement` を使用するが、
   * 遅延実行時にはフォーカス泥棒が発生しうるため原則として渡すこと。
   *
   * @example
   * const capturedElement = document.activeElement as HTMLElement;
   * requestAnimationFrame(() => {
   * handleEnterFocus({ ..., fromElement: capturedElement });
   * });
   */
  fromElement?: HTMLElement | null;
}

/**
 * 要素が視覚的に表示されているかを判定する。
 *
 * offsetWidth/Height でレイアウト上のサイズを確認し、
 * さらに getComputedStyle で visibility/display も検査することで
 * visibility: hidden の要素を候補から除外する。
 */
const isVisible = (element: HTMLElement): boolean => {
  if (element.offsetWidth === 0 || element.offsetHeight === 0) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none';
};

/**
 * フォーカス探索のルート要素を解決する。
 * 優先順位: dialog / aria-modal → form / data-focus-scope → document.body
 *
 * 複数フォームが同一ページに混在するケースでは、
 * ルート要素に `data-focus-scope` 属性を付与することで
 * フォーカス移動の範囲を明示的に限定できる。
 *
 * @example
 * <form data-focus-scope>...</form>
 */
const resolveFocusRoot = (activeElement: Element): HTMLElement => {
  return (
    activeElement.closest<HTMLElement>('[role="dialog"], [aria-modal="true"]') ??
    activeElement.closest<HTMLElement>('form, [data-focus-scope]') ??
    document.body
  );
};

/**
 * Enterキー押下時に、次のフォーカス可能な要素へ移動するためのカスタムフック。
 *
 * ### 遅延実行時の注意（フォーカス泥棒の防止）
 * rAF や setTimeout 経由で呼び出す場合、実行時点の `document.activeElement` は
 * ユーザーのマウス操作によって既に別の要素に移っている可能性があります。
 * その場合は `EnterKeyEvent.fromElement` にキー押下時点の要素をキャプチャして渡してください。
 *
 * @param isComposing - IME入力（漢字変換など）の最中かどうか。
 * true の場合は移動処理をスキップします。
 * @returns キーボードイベントハンドラ
 *
 * @example
 * // 即時実行（通常ケース）
 * const handleKeyDown = useEnterFocus(isComposing);
 * <input onKeyDown={handleKeyDown} />
 *
 * @example
 * // 遅延実行（ComboBox 等でポップオーバーの閉幕を待つケース）
 * const capturedElement = document.activeElement as HTMLElement;
 * requestAnimationFrame(() => {
 * handleEnterFocus({
 * key: 'Enter', shiftKey: false,
 * preventDefault: () => {}, stopPropagation: () => {},
 * fromElement: capturedElement, // キー押下時点の要素を渡す
 * });
 * });
 */
export const useEnterFocus = (isComposing: boolean) => {
  // isComposing を ref で管理することで IME 確定タイミングのラグを防ぐ。
  // useCallback の依存配列から外れるため不要な関数再生成も防止できる。
  const isComposingRef = useRef(isComposing);
  useEffect(() => {
    isComposingRef.current = isComposing;
  }, [isComposing]);

  return useCallback((e: React.KeyboardEvent<HTMLElement> | EnterKeyEvent) => {
    // IME入力中、またはEnterキー以外の場合は何もしない
    if (isComposingRef.current || e.key !== 'Enter') return;

    // SSR 環境（Next.js 等）でのクラッシュを防ぐガード
    if (typeof document === 'undefined') return;

    // React Aria のデフォルト動作（ポップオーバーを開く等）を完全に防ぐ
    e.preventDefault();
    e.stopPropagation();

    // fromElement が渡されていればそちらを優先して使用する。
    // 遅延実行ケースでは document.activeElement がすでに別要素に移っている可能性があるため、
    // キー押下時点にキャプチャした要素を呼び出し元から渡してもらう設計にしている。
    const baseElement: Element | null =
      ('fromElement' in e && e.fromElement) ? e.fromElement : document.activeElement;

    if (!baseElement) return;

    const root = resolveFocusRoot(baseElement);

    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(isVisible);

    const currentIndex = focusableElements.indexOf(baseElement as HTMLElement);
    if (currentIndex === -1) return;

    // Shift + Enter なら前へ、Enter なら次へ
    const direction = e.shiftKey ? -1 : 1;
    const nextElement = focusableElements[currentIndex + direction];

    if (nextElement) {
      // ✨ 修正箇所: フォーカス移動直前の「空気を読む」安全装置
      // 遅延実行された場合、この時点でユーザーがすでにマウス等で別の場所に
      // フォーカスを移していたら、ユーザーの操作を優先して自動移動をキャンセルする。
      // （body にフォーカスが落ちている場合は安全とみなして移動させる）
      if (
        document.activeElement === baseElement ||
        document.activeElement === document.body
      ) {
        nextElement.focus();
      }
    }
  }, []); // isComposingRef 経由で参照するため依存配列は空
};