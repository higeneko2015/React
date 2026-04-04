import React, { useState, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { TextField, Label, Input, Text, FieldError, Group } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

/**
 * 社内システム用汎用テキスト入力コンポーネント。
 * 通常のテキスト入力に加え、入力文字の制限やフォーマット表示に対応しています。
 * allowedChars を使用する場合、安定した正規表現リファレンスを渡すことが推奨されます。
 */
export interface CompanyTextFieldProps {
  /** フィールドのラベル */
  label: string;
  /** 現在の値 */
  value?: string | null;
  /** 値が変更された際のコールバック */
  onChange?: (value: string) => void;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** テキストの配置（デフォルト: 'left'） */
  textAlign?: 'left' | 'center' | 'right';
  /** 最大入力文字数 */
  maxLength?: number;
  /** 許可する文字の正規表現（例: /^[a-zA-Z0-9]+$/） */
  allowedChars?: RegExp;
  /** フォーカスが外れた際の表示用フォーマット関数 */
  format?: (val: string) => string;
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
  /** モバイル端末等でのキーボードタイプ */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  /** モバイル端末等でのEnterキーのラベル（デフォルト: 'next'） */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  /** クリア（✕）ボタンを表示するかどうか（デフォルト: false） */
  isClearable?: boolean;
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

export const CompanyTextField = React.memo(forwardRef<HTMLInputElement, CompanyTextFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, width = "full", textAlign = "left",
    maxLength, allowedChars, format,
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    inputMode = "text", enterKeyHint = "next",
    isClearable = false, className,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const [isComposing, setIsComposing] = useState(false);

  const safeValue = value ?? "";
  const [isFocusedInner, setIsFocusedInner] = useState(false);
  const displayValue = (!isFocusedInner && format) ? format(safeValue) : safeValue;
  const handleKeyDown = useEnterFocus(isComposing);

  const cleanupRegex = useMemo(() => {
    if (!allowedChars) return null;
    return new RegExp(`[^${allowedChars.source}]`, 'g');
  }, [allowedChars]);

  const handleChange = useCallback((val: string) => {
    let nextVal = val;
    if (cleanupRegex) nextVal = nextVal.replace(cleanupRegex, '');
    if (maxLength && nextVal.length > maxLength) nextVal = nextVal.substring(0, maxLength);
    onChange?.(nextVal);
  }, [cleanupRegex, maxLength, onChange]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    if (!isReadOnly) {
      setIsFocusedInner(true);
    }
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
      value={displayValue}
      onChange={handleChange}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      <Group className={groupStyles({ isInvalid, isReadOnly, isInGrid })}>
        <Input
          ref={innerRef}
          placeholder={placeholder}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          className={inputStyles({ textAlign, hasClearButton })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
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

CompanyTextField.displayName = "CompanyTextField";