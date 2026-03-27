import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Checkbox, FieldError, Text, type CheckboxProps } from 'react-aria-components';

import { useInGrid } from './InGridContext';
import { useEnterFocus } from '../hooks/useEnterFocus';
import { descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';
import { useMessage } from '../hooks/useMessage';

export interface CompanyCheckboxProps extends Omit<CheckboxProps, 'children'> {
  label: string;
  description?: string;
  errorMessage?: string;
  width?: 'full' | 'auto' | number | string;
}

export const CompanyCheckbox = React.memo(forwardRef<HTMLLabelElement, CompanyCheckboxProps>((props, ref) => {
  const { label, description, errorMessage, isInvalid, isReadOnly, width = "full", ...rest } = props;
  
  const isInGrid = useInGrid(); // 💥 グリッド判定を取得
  const { t } = useMessage();
  const innerRef = useRef<HTMLLabelElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);
  
  const handleEnterFocus = useEnterFocus(false);

  // Enterキー入力をインターセプトしてフォーカス移動に変換
  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleEnterFocus({
        key: e.key,
        target: e.target,
        currentTarget: e.currentTarget,
        shiftKey: e.shiftKey,
        preventDefault: () => {},
        stopPropagation: () => {},
      } as any);
    }
  };

  return (
    // 💥 修正2: 大外の div に onKeyDownCapture を追加し、Enterキーを完全に横取りする
    <div 
      onKeyDownCapture={handleKeyDownCapture}
      className={`flex flex-col ${width === 'full' ? 'w-full' : ''}`}
    >
      <Checkbox
        ref={innerRef}
        {...rest}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        className={({ isReadOnly }) => `
          group flex items-center gap-2 text-sm outline-none cursor-pointer
          ${isReadOnly ? 'opacity-50 cursor-default' : ''}
          ${isInGrid ? 'h-[32px] px-3' : 'py-1.5'}
        `}
      >
        {({ isSelected, isFocusVisible, isInvalid }) => (
          <>
            <div className={`
              w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-200 border
              ${isFocusVisible ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${isSelected && !isInvalid ? 'bg-blue-600 border-transparent' : 'bg-white border-gray-300'}
              ${isInvalid ? 'border-red-500 border-2' : ''}
              ${!isSelected && !isInvalid ? 'group-hover:border-gray-400' : ''}
            `}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {/* 💥 修正3: グリッド内ではラベルを非表示にする */}
            <span className={`text-gray-900 select-none ${isInGrid ? 'sr-only' : ''}`}>
              {label}
            </span>
          </>
        )}
      </Checkbox>

      {/* 💥 修正4: 共通のエラー・説明スタイルを適用 */}
      {!isInGrid && description && !isInvalid && (
        <Text slot="description" className={descriptionStyles}>
          {description}
        </Text>
      )}
      {!isInGrid && isInvalid && (
        <FieldError className={errorMessageStyles}>
          {t(errorMessage)}
        </FieldError>
      )}
    </div>
  );
}));

CompanyCheckbox.displayName = "CompanyCheckbox";