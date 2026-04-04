import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Checkbox, FieldError, Text } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useInGrid } from './useInGrid';
import { useEnterFocus } from '../hooks/useEnterFocus';
import { descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';
import { useMessage } from '../hooks/useMessage';

// 型のみのインポートは一番下に！
import type { CheckboxProps } from 'react-aria-components';

/**
 * 社内システム用共通チェックボックスコンポーネント。
 * 単一のチェック状態を管理し、エラー表示や説明文の表示に対応しています。
 * グリッド内（isInGrid）で呼ばれた場合は、ラベルやエラーを隠してコンパクトに表示します。
 */
export interface CompanyCheckboxProps extends Omit<CheckboxProps, 'children'> {
  /** チェックボックスの横に表示するラベルテキスト */
  label: string;
  /** 補足説明文 */
  description?: string;
  /** エラー時のメッセージキー */
  errorMessage?: string;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyCheckbox = React.memo(forwardRef<HTMLLabelElement, CompanyCheckboxProps>((props, ref) => {
  const { label, description, errorMessage, isInvalid, isReadOnly, width = "full", className, ...rest } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLLabelElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLLabelElement);

  const handleEnterFocus = useEnterFocus(false);

  // Enterキー入力をインターセプトしてフォーカス移動に変換
  const handleKeyDownCapture = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleEnterFocus(e);
    }
  }, [handleEnterFocus]);

  return (
    // ルート要素に twMerge を使って className を安全に結合！
    <div
      onKeyDownCapture={handleKeyDownCapture}
      className={twMerge(
        'flex flex-col',
        width === 'full' ? 'w-full' : '',
        className
      )}
    >
      <Checkbox
        ref={innerRef}
        {...rest}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        className={({ isReadOnly: ro }) => twMerge(
          'group flex items-center gap-2 text-sm outline-none cursor-pointer',
          ro ? 'opacity-50 cursor-default' : '',
          isInGrid ? 'h-[32px] px-3' : 'py-1.5'
        )}
      >
        {({ isSelected, isFocusVisible, isInvalid: invalid }) => (
          <>
            <div className={twMerge(
              'w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-200 border',
              isFocusVisible ? 'ring-2 ring-blue-500 ring-offset-2' : '',
              isSelected && !invalid ? 'bg-blue-600 border-transparent' : 'bg-white border-gray-300',
              invalid ? 'border-red-500 border-2' : '',
              !isSelected && !invalid ? 'group-hover:border-gray-400' : ''
            )}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {/* グリッド内ではラベルを非表示にする */}
            <span className={twMerge('text-gray-900 select-none', isInGrid ? 'sr-only' : '')}>
              {label}
            </span>
          </>
        )}
      </Checkbox>

      {/* 共通のエラー・説明スタイルを適用 */}
      {!isInGrid && description && !isInvalid && (
        <Text slot="description" className={descriptionStyles}>
          {description}
        </Text>
      )}
      {!isInGrid && isInvalid && (
        <FieldError className={errorMessageStyles}>
          {t(errorMessage ?? '')}
        </FieldError>
      )}
    </div>
  );
}));

CompanyCheckbox.displayName = "CompanyCheckbox";