import React, { forwardRef } from 'react';
import { RadioGroup, Radio, Label, type RadioGroupProps, type RadioProps, Text, FieldError } from 'react-aria-components';

import { useInGrid } from './InGridContext';
import { useEnterFocus } from '../hooks/useEnterFocus';
import { labelCommonStyles, descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';
import { useMessage } from '../hooks/useMessage';

export interface CompanyRadioGroupProps extends Omit<RadioGroupProps, 'children'> {
  label: string;
  children: React.ReactNode;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
}

const CompanyRadioGroupBase = React.memo(forwardRef<HTMLDivElement, CompanyRadioGroupProps>((props, ref) => {
  const { label, children, isInvalid, errorMessage, description, isReadOnly, ...rest } = props;
  const handleKeyDown = useEnterFocus(false);
  
  const isInGrid = useInGrid(); // 💥 グリッド判定を取得
  const { t } = useMessage();

  // Enterキー入力をインターセプトしてフォーカス移動に変換
  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleKeyDown({
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
    // 💥 修正2: onKeyDown を onKeyDownCapture に変更し、Enterの挙動を完全に制御
    <div 
      onKeyDownCapture={handleKeyDownCapture}
      className={`outline-none flex w-full ${isInGrid ? 'h-full items-center px-3' : 'flex-col gap-1'}`}
    >
      <RadioGroup 
        ref={ref} 
        {...rest} 
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        className={`flex outline-none w-full ${isInGrid ? 'flex-row h-full items-center' : 'flex-col gap-1'}`}
      >
        {/* 💥 修正3: 共通のラベルスタイルを適用 */}
        <Label className={labelCommonStyles({ isInGrid })}>
          {label}
        </Label>
        
        {/* 💥 修正4: グリッド内では mt-1 などの余白をなくす */}
        <div className={`flex flex-wrap items-center ${isInGrid ? 'gap-3' : 'gap-4 mt-1'} ${isReadOnly ? 'opacity-60 pointer-events-none' : ''}`}>
          {children}
        </div>
      </RadioGroup>
      
      {/* 💥 修正5: 共通のエラー・説明スタイルを適用 */}
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

const CompanyRadio = React.memo((props: RadioProps) => {
  return (
    <Radio 
      {...props} 
      className={({ isFocusVisible, isReadOnly }) => `
        flex items-center gap-1.5 outline-none text-sm text-gray-700 shrink-0
        ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}
        ${isFocusVisible ? 'ring-2 ring-blue-500 rounded ring-offset-1' : ''}
      `}
    >
      {({ isSelected }) => (
        <>
          <div className={`
            w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0
            ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}
          `}>
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          {props.children}
        </>
      )}
    </Radio>
  );
});

export const CompanyRadioGroup = Object.assign(CompanyRadioGroupBase, {
  Radio: CompanyRadio
});
CompanyRadioGroup.displayName = "CompanyRadioGroup";