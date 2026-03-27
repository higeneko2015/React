import React from 'react';
import { tv } from 'tailwind-variants';
import { containerStyles } from './companyTextFieldStyles';
// 💥 これがないとグリッド内だと気づけません
import { useInGrid } from './InGridContext'; 

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

export interface CompanyDisplayFieldProps {
  label: string;
  value?: React.ReactNode;
  width?: 'full' | 'auto' | number | string;
  description?: string;
  variant?: 'text' | 'box';
}

export const CompanyDisplayField = React.memo((props: CompanyDisplayFieldProps) => {
  const { label, value, width = "full", description, variant = 'text' } = props;
  const isInGrid = useInGrid(); // 💥 グリッド判定を取得

  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);

  const isEmpty = value === undefined || value === null || value === '';

  return (
    <div
      className={containerStyles({ width: containerWidthProp })}
      style={{ width: styleWidth }}
    >
      {/* 💥 ここが最重要！グリッド内ではラベルを表示しない！ */}
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