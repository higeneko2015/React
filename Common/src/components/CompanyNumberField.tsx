import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { Label, Input, Text, FieldError, Group, TextField } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

/**
 * 社内システム用共通数値入力フィールド。
 * フォーカス時は生の数値を扱い、フォーカスアウト時に指定された桁数でカンマ区切りフォーマットを行います。
 */
export interface CompanyNumberFieldProps {
  /** フィールドのラベル */
  label: string;
  /** 現在の数値 */
  value?: number | null;
  /** 値が変更された際のコールバック */
  onChange?: (value: number | null) => void;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** テキストの配置（デフォルト: 'right'） */
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
  /** 小数点以下の表示桁数（デフォルト: 0） */
  fractionDigits?: number;
  /** クリア（✕）ボタンを表示するかどうか（デフォルト: false） */
  isClearable?: boolean;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyNumberField = React.memo(forwardRef<HTMLInputElement, CompanyNumberFieldProps>((props, ref) => {
  const {
    label, value = null, onChange, width = "full", textAlign = "right",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    fractionDigits = 0, isClearable = false, className,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const [isFocusedInner, setIsFocusedInner] = useState(false);
  // 小数点入力中の「100.」などを維持するためのローカルステート
  const [localString, setLocalString] = useState<string>("");

  const handleKeyDown = useEnterFocus(false);

  const displayValue = useMemo(() => {
    if (isFocusedInner && !isReadOnly) return localString;
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }, [value, isFocusedInner, isReadOnly, fractionDigits, localString]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d.-]/g, '');
    setLocalString(rawValue);
    if (rawValue === '' || rawValue === '-') {
      onChange?.(null);
    } else {
      const parsed = parseFloat(rawValue);
      if (!isNaN(parsed)) onChange?.(parsed);
    }
  }, [onChange]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    if (!isReadOnly) {
      setIsFocusedInner(true);
      setLocalString(value !== null && value !== undefined ? value.toString() : "");
    }
  }, [isReadOnly, value]));

  const handleBlur = useCallback(() => setIsFocusedInner(false), []);

  const handleClear = useCallback(() => {
    onChange?.(null);
    setLocalString("");
    innerRef.current?.focus();
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const hasClearButton = isClearable && !isReadOnly && value !== null && value !== undefined;

  return (
    <TextField className={twMerge(containerStyles({ width: containerWidthProp }), className)} style={{ width: styleWidth }}>
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
          readOnly={isReadOnly}
          placeholder={placeholder}
          inputMode={fractionDigits > 0 ? "decimal" : "numeric"}
          className={inputStyles({ textAlign, hasClearButton })}
        />

        {hasClearButton && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className={clearButtonStyles()}
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </Group>

      {!isInGrid && description && !isInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
      {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage ?? '')}</FieldError>}
    </TextField>
  );
}));

CompanyNumberField.displayName = "CompanyNumberField";