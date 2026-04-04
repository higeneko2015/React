import { tv } from 'tailwind-variants';

/**
 * テキストフィールド系のコンテナ（flex-col方向の外枠）スタイル。
 */
export const containerStyles = tv({
  base: "flex flex-col gap-1",
  variants: {
    width: { full: "w-full", auto: "w-auto" }
  },
  defaultVariants: { width: "full" }
});

/**
 * <Input> 要素専用のスタイル。
 * 背景・枠線は持たず（Group が担当）、テキスト・パディング・サイズのみを管理します。
 */
export const inputStyles = tv({
  base: [
    "h-[32px] w-full outline-none bg-transparent border-none",
    "font-[family-name:var(--font-family-base,sans-serif)]",
    "text-[length:var(--font-size-input,13px)]",
    "py-[var(--input-py,2px)]",
    "px-[var(--input-px,8px)]",
    "leading-normal",
  ],
  variants: {
    textAlign: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    hasClearButton: {
      true: "pr-8",
      false: ""
    },
  },
  defaultVariants: {
    textAlign: "left",
    hasClearButton: false,
  }
});

/**
 * <Group> 要素専用のスタイル（<Input> の外側の視覚コンテナ）。
 * 境界線・背景・リング（フォーカス/エラー/読み取り専用/グリッド内）を一元管理します。
 * isInvalid に Tailwind の ! プレフィックスを使用し、優先度問題を解消しています。
 */
export const groupStyles = tv({
  base: [
    "h-[32px] relative flex items-center w-full rounded outline-none transition-all",
    "border-[length:var(--input-border-width,1px)] border-gray-300 bg-white",
    "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:z-10",
  ],
  variants: {
    isInvalid: {
      // ! プレフィックスで bg-white を確実に上書きし、focus-within 時のリングも赤にする
      true: "!border-red-600 !bg-red-50 focus-within:!ring-1 focus-within:!ring-red-500",
    },
    isReadOnly: {
      true: "!bg-gray-50 !border-gray-200 cursor-default focus-within:!ring-0",
    },
    isInGrid: {
      // グリッド内ではすべての装飾を消す（EditableCell が枠線を担当）
      true: "!border-transparent !bg-transparent rounded-none focus-within:!ring-0",
      false: "",
    },
  },
  defaultVariants: {
    isInvalid: false,
    isReadOnly: false,
    isInGrid: false,
  }
});

/**
 * ラベルの共通スタイル。
 * グリッド内（isInGrid）では視覚的に隠し（sr-only）、それ以外では標準のラベルとして表示します。
 */
export const labelCommonStyles = tv({
  base: "font-bold text-gray-700",
  variants: {
    isInGrid: {
      true: "sr-only",
      false: "block text-[length:var(--font-size-label,12px)] mb-1",
    }
  },
  defaultVariants: { isInGrid: false }
});

/** 補足説明文用の共通テキストスタイル */
export const descriptionStyles = "text-xs text-gray-500 mt-1";

/** エラーメッセージ用の共通テキストスタイル */
export const errorMessageStyles = "text-xs text-red-600 font-bold mt-1";

/**
 * 入力クリア（✕）ボタンの共通スタイル。
 */
export const clearButtonStyles = tv({
  base: [
    "absolute right-1 px-2 h-full flex items-center justify-center",
    "text-gray-400 hover:text-gray-600 focus:outline-none",
    "bg-transparent border-none cursor-pointer"
  ]
});