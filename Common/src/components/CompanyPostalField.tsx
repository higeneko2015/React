import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { TextField, Label, Input, Text, FieldError, Group } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

/**
 * 社内システム用共通郵便番号入力フィールド。
 * 入力時は数字のみを扱い、フォーカスアウト時に7桁の郵便番号に合わせてハイフンを自動挿入します。
 */
export interface CompanyPostalFieldProps {
  /** フィールドのラベル */
  label: string;
  /** 現在の郵便番号（ハイフンなし、またはハイフンありの文字列） */
  value?: string | null;
  /** 値が変更された際のコールバック（ハイフンなしの7桁の数字文字列が返ります） */
  onChange?: (value: string) => void;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** テキストの配置（デフォルト: 'left'） */
  textAlign?: 'left' | 'center' | 'right';
  /** 読み取り専用かどうか */
  isReadOnly?: boolean;
  /** エラー状態かどうか */
  isInvalid?: boolean;
  /** エラー時のメッセージキー */
  errorMessage?: string;
  /** 補足説明文 */
  description?: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** クリア（✕）ボタンを表示するかどうか（デフォルト: false） */
  isClearable?: boolean;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyPostalField = React.memo(forwardRef<HTMLInputElement, CompanyPostalFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false, className,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const [isFocusedInner, setIsFocusedInner] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const handleKeyDown = useEnterFocus(isComposing);
  const safeValue = value ?? "";

  const displayValue = useMemo(() => {
    if (!safeValue) return "";
    if (isFocusedInner && !isReadOnly) return safeValue;
    if (safeValue.length === 7) return `${safeValue.slice(0, 3)}-${safeValue.slice(3)}`;
    return safeValue;
  }, [safeValue, isFocusedInner, isReadOnly]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value.replace(/[^0-9]/g, '').slice(0, 7));
  }, [onChange]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    if (!isReadOnly) setIsFocusedInner(true);
  }, [isReadOnly]));

  const handleBlur = useCallback(() => setIsFocusedInner(false), []);

  const handleClear = useCallback(() => {
    onChange?.("");
    innerRef.current?.focus();
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const hasClearButton = isClearable && !isReadOnly && Boolean(safeValue);

  return (
    <TextField
      className={twMerge(containerStyles({ width: containerWidthProp }), className)}
      style={{ width: styleWidth }}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      <Group className={groupStyles({ isInvalid, isReadOnly, isInGrid })}>
        <Input
          ref={innerRef}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          inputMode="numeric"
          maxLength={7}
          className={inputStyles({ textAlign, hasClearButton })}
        />

        {hasClearButton && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className={clearButtonStyles()}
            aria-label="クリア"
          >✕</button>
        )}
      </Group>

      {!isInGrid && description && !isInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
      {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage ?? '')}</FieldError>}
    </TextField>
  );
}));

CompanyPostalField.displayName = "CompanyPostalField";

const formatPostalView = (value: string | null) => {
  if (!value) return "";
  const v = value.replace(/\D/g, '');
  if (v.length === 7) return `${v.slice(0, 3)}-${v.slice(3)}`;
  return v;
};

(CompanyPostalField as unknown as { formatView: (value: string | null) => string }).formatView = formatPostalView;