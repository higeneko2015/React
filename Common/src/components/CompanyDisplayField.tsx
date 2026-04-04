import React from 'react';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

import { containerStyles } from './companyTextFieldStyles';
// グリッド判定を取得するためのプロバイダ
import { useInGrid } from './useInGrid';

const displayValueStyles = tv({
  base: "flex items-center text-[13px] truncate px-3 min-h-[32px]",
  variants: {
    isInGrid: {
      true: "h-[32px] text-gray-900 border-none bg-transparent",
      false: "text-gray-900 border border-transparent"
    },
    variant: {
      text: "",
      box: "bg-gray-50 border border-gray-200 rounded text-gray-700"
    }
  },
  compoundVariants: [
    { isInGrid: false, variant: 'box', class: "bg-gray-50 border-gray-200 rounded text-gray-700" },
    { isInGrid: true, variant: 'box', class: "!bg-transparent !border-none !rounded-none !text-gray-900" }
  ],
  defaultVariants: {
    isInGrid: false,
    variant: 'text'
  }
});

/**
 * 社内システム用共通表示専用フィールド。
 * フォーム内やデータグリッド内で、読み取り専用のテキストや要素を表示するために使用します。
 * グリッド内（isInGrid）で呼ばれた場合は、ラベルを隠してセルにフィットするよう最適化されます。
 */
export interface CompanyDisplayFieldProps {
  /** フィールドのラベル（グリッド外でのみ表示） */
  label: string;
  /** 表示する値（テキストやReact要素） */
  value?: React.ReactNode;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** 補足説明文 */
  description?: string;
  /** 見た目のバリエーション（デフォルト: 'text'） */
  variant?: 'text' | 'box';
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyDisplayField = React.memo((props: CompanyDisplayFieldProps) => {
  const { label, value, width = "full", description, variant = 'text', className } = props;
  const isInGrid = useInGrid();

  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);

  const isEmpty = value === undefined || value === null || value === '';

  return (
    <div
      className={twMerge(containerStyles({ width: containerWidthProp }), className)}
      style={{ width: styleWidth }}
    >
      {/* グリッド内ではラベルを表示しない */}
      {!isInGrid && (
        <div className="text-[length:var(--font-size-label,12px)] font-bold text-gray-700 mb-1">
          {label}
        </div>
      )}

      {/* グリッド内では高さを 32px に固定 */}
      <div className={displayValueStyles({ isInGrid, variant })}>
        {isEmpty ? (!isInGrid ? <span className="text-gray-400">-</span> : null) : value}
      </div>

      {!isInGrid && description && (
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      )}
    </div>
  );
});

CompanyDisplayField.displayName = "CompanyDisplayField";