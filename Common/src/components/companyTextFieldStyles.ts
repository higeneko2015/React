import { tv } from 'tailwind-variants';

// コンテナ（flex-col方向の外枠）
export const containerStyles = tv({
  base: "flex flex-col gap-1",
  variants: {
    width: { full: "w-full", auto: "w-auto" }
  },
  defaultVariants: { width: "full" }
});

/**
 * inputStyles: <Input> 要素専用
 * 背景・枠線は持たない（Group が担当）。テキスト・パディング・サイズのみ管理。
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
 * groupStyles: <Group> 要素専用（<Input> の外側の視覚コンテナ）
 * 境界線・背景・リング（フォーカス/エラー/読み取り専用/グリッド内）を一元管理。
 * isInvalid に Tailwind の ! プレフィックスを使用し、優先度問題を解消。
 */
export const groupStyles = tv({
  base: [
    "h-[32px] relative flex items-center w-full rounded outline-none transition-all",
    "border-[length:var(--input-border-width,1px)] border-gray-300 bg-white",
  ],
  variants: {
    isFocused: {
      true: "ring-2 ring-blue-500 border-blue-500 z-10",
      false: "",
    },
    isInvalid: {
      // ! プレフィックスで bg-white を確実に上書き
      true: "!border-red-600 !bg-red-50",
    },
    isReadOnly: {
      true: "!bg-gray-50 !border-gray-200 cursor-default",
    },
    isInGrid: {
      // グリッド内ではすべての装飾を消す（EditableCell が枠線を担当）
      true: "!border-transparent !bg-transparent rounded-none",
      false: "",
    },
  },
  compoundVariants: [
    { isInvalid: true, isFocused: true, isInGrid: false, class: "ring-1 ring-red-500" },
    { isInGrid: true, isFocused: true, class: "!ring-0 !border-transparent" },
  ],
  defaultVariants: {
    isFocused: false,
    isInvalid: false,
    isReadOnly: false,
    isInGrid: false,
  }
});

// 共通パーツのスタイル抽出
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

export const descriptionStyles = "text-xs text-gray-500 mt-1";
export const errorMessageStyles = "text-xs text-red-600 font-bold mt-1";

export const clearButtonStyles = tv({
  base: [
    "absolute right-1 px-2 h-full flex items-center justify-center",
    "text-gray-400 hover:text-gray-600 focus:outline-none",
    "bg-transparent border-none cursor-pointer"
  ]
});