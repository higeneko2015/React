import React, { forwardRef } from 'react';
import { RadioGroup, Radio, Label, Text, FieldError } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useInGrid } from './useInGrid';
import { useEnterFocus } from '../hooks/useEnterFocus';
import { labelCommonStyles, descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';
import { useMessage } from '../hooks/useMessage';

// 型のインポートは一番下に！
import type { RadioGroupProps, RadioProps } from 'react-aria-components';

/**
 * 社内システム用共通ラジオボタングループコンポーネント。
 * 複数の選択肢から1つを選ぶUIを提供し、グリッド内のコンパクト表示にも対応しています。
 */
export interface CompanyRadioGroupProps extends Omit<RadioGroupProps, 'children'> {
  /** グループ全体のラベルテキスト */
  label: string;
  /** Radioコンポーネントの要素 */
  children: React.ReactNode;
  /** エラー状態かどうか */
  isInvalid?: boolean;
  /** エラー時のメッセージキー */
  errorMessage?: string;
  /** 補足説明文 */
  description?: string;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

const CompanyRadioGroupBase = React.memo(forwardRef<HTMLDivElement, CompanyRadioGroupProps>((props, ref) => {
  const { label, children, isInvalid, errorMessage, description, isReadOnly, className, ...rest } = props;
  const handleKeyDown = useEnterFocus(false);

  const isInGrid = useInGrid();
  const { t } = useMessage();

  // Enterキー入力をインターセプトしてフォーカス移動に変換
  const handleKeyDownCapture = React.useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleKeyDown(e);
    }
  }, [handleKeyDown]);

  return (
    // ルート要素に twMerge を使って className を安全に結合！
    <div
      onKeyDownCapture={handleKeyDownCapture}
      className={twMerge(
        'outline-none flex w-full',
        isInGrid ? 'h-full items-center px-3' : 'flex-col gap-1',
        className
      )}
    >
      <RadioGroup
        ref={ref}
        {...rest}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        className={twMerge(
          'flex outline-none w-full',
          isInGrid ? 'flex-row h-full items-center' : 'flex-col gap-1'
        )}
      >
        <Label className={labelCommonStyles({ isInGrid })}>
          {label}
        </Label>

        <div className={twMerge(
          'flex flex-wrap items-center',
          isInGrid ? 'gap-3' : 'gap-4 mt-1',
          isReadOnly ? 'opacity-60 pointer-events-none' : ''
        )}>
          {children}
        </div>
      </RadioGroup>

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

const CompanyRadio = React.memo((props: RadioProps) => {
  return (
    <Radio
      {...props}
      className={({ isFocusVisible, isReadOnly }) => twMerge(
        'flex items-center gap-1.5 outline-none text-sm text-gray-700 shrink-0',
        isReadOnly ? 'cursor-default' : 'cursor-pointer',
        isFocusVisible ? 'ring-2 ring-blue-500 rounded ring-offset-1' : ''
      )}
    >
      {({ isSelected }) => (
        <>
          <div className={twMerge(
            'w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0',
            isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
          )}>
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          {props.children}
        </>
      )}
    </Radio>
  );
});

const CompanyRadioGroupComponent = CompanyRadioGroupBase as typeof CompanyRadioGroupBase & {
  Radio: typeof CompanyRadio;
};
CompanyRadioGroupComponent.Radio = CompanyRadio;

export { CompanyRadioGroupComponent as CompanyRadioGroup };
CompanyRadioGroupComponent.displayName = "CompanyRadioGroup";