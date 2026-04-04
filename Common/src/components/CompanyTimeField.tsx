import React, { useState, forwardRef, useRef, useImperativeHandle, useCallback } from 'react';
import { TextField, Label, Group, Input, Text, FieldError } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';
import { useMessage } from '../hooks/useMessage';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

/**
 * 社内システム用共通時刻入力フィールド。
 * 入力時は数字のみを扱い、フォーカスアウト時に指定された形式（HH:mm等）に合わせてコロンを自動挿入します。
 */
export interface CompanyTimeFieldProps {
  /** フィールドのラベル */
  label: string;
  /** 現在の時刻（コロンあり、またはなしの文字列） */
  value?: string | null;
  /** 値が変更された際のコールバック（クリア時はnullが返ります） */
  onChange?: (value: string | null) => void;
  /** 時刻のフォーマット形式（デフォルト: 'HH:mm'） */
  formatType?: 'HH:mm:ss' | 'HH:mm' | 'HH' | 'mm:ss';
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

const blindFormatTime = (raw: string, type: 'HH:mm:ss' | 'HH:mm' | 'HH' | 'mm:ss') => {
  let d = raw.replace(/\D/g, '');
  if (!d) return raw;

  if (type === 'HH:mm:ss') {
    if (d.length === 5) d = '0' + d;
    if (d.length >= 6) return `${d.slice(0, 2)}:${d.slice(2, 4)}:${d.slice(4, 6)}`;
  } else if (type === 'HH:mm') {
    if (d.length === 3) d = '0' + d;
    if (d.length >= 4) return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
  } else if (type === 'HH') {
    if (d.length === 1) d = '0' + d;
    if (d.length >= 2) return `${d.slice(0, 2)}`;
  } else if (type === 'mm:ss') {
    if (d.length === 3) d = '0' + d;
    if (d.length >= 4) return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
  }
  return raw;
};

const isValidTimeStr = (str: string, type: 'HH:mm:ss' | 'HH:mm' | 'HH' | 'mm:ss') => {
  if (!str) return true;
  const parts = str.split(':');

  if (type === 'HH:mm:ss' && parts.length === 3) {
    const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10), s = parseInt(parts[2], 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
  } else if (type === 'HH:mm' && parts.length === 2) {
    const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  } else if (type === 'HH' && parts.length === 1) {
    const h = parseInt(parts[0], 10);
    return h >= 0 && h <= 23;
  } else if (type === 'mm:ss' && parts.length === 2) {
    const m = parseInt(parts[0], 10), s = parseInt(parts[1], 10);
    return m >= 0 && m <= 59 && s >= 0 && s <= 59;
  }
  return false;
};

const getMaxLength = (type: string) => {
  if (type === 'HH:mm:ss') return 6;
  if (type === 'HH:mm' || type === 'mm:ss') return 4;
  return 2;
};

export const CompanyTimeField = React.memo(forwardRef<HTMLInputElement, CompanyTimeFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, formatType = 'HH:mm', width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false, className
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();

  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const [isComposing, setIsComposing] = useState(false);

  const safeValue = value ?? "";
  const [prevValue, setPrevValue] = useState(safeValue);
  const [inputValue, setInputValue] = useState(safeValue);
  const [internalError, setInternalError] = useState(false);

  const handleKeyDown = useEnterFocus(isComposing);

  // Derived State: Props (value) が変化した場合に同期するパターン
  if (safeValue !== prevValue) {
    setPrevValue(safeValue);
    // 自分がアクティブ（フォーカス中）なら、入力中の値を上書きしない
    if (document.activeElement !== innerRef.current) {
      setInputValue(safeValue);
      if (isValidTimeStr(safeValue, formatType)) {
        setInternalError(false);
      }
    }
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
    if (internalError) setInternalError(false);
  }, [internalError]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    setInputValue(prev => (prev || "").replace(/:/g, ''));
  }, []));

  const handleBlur = useCallback(() => {

    if (!inputValue) {
      setInternalError(false);
      onChange?.(null); // 空の場合は null を返す
      return;
    }

    const formatted = blindFormatTime(inputValue, formatType);
    setInputValue(formatted);

    const isValid = isValidTimeStr(formatted, formatType);

    if (!isValid) {
      setInternalError(true);
      onChange?.(formatted);
    } else {
      setInternalError(false);
      if (formatted !== value) onChange?.(formatted);
    }
  }, [inputValue, formatType, value, onChange]);

  const handleClear = useCallback(() => {
    setInputValue("");
    setInternalError(false);
    onChange?.(null);
    innerRef.current?.focus();
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';

  const effectiveIsInvalid = isInvalid || internalError;
  const effectiveErrorMessage = internalError ? "有効な時刻を入力してください" : errorMessage;

  // クリアボタンの有無を判定
  const hasClearButton = isClearable && !isReadOnly && Boolean(inputValue);

  return (
    <TextField
      className={twMerge(containerStyles({ width: containerWidthProp }), className)}
      style={{ width: styleWidth }}
      isReadOnly={isReadOnly}
      isInvalid={effectiveIsInvalid}
    >
      {/* Label を sr-only で隠す */}
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      {/* groupStyles に isInGrid を渡す */}
      <Group className={groupStyles({ isInvalid: effectiveIsInvalid, isReadOnly, isInGrid })}>
        <Input
          ref={innerRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder || formatType}
          inputMode="numeric"
          maxLength={getMaxLength(formatType)}
          // inputStyles を使用して美しく適用
          className={inputStyles({ textAlign, hasClearButton })}
        />

        {/* 他のコンポーネントに合わせて absolute 配置に変更 */}
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

      {/* エラーメッセージ等をグリッド内で非表示にする */}
      {!isInGrid && description && !effectiveIsInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
      {!isInGrid && effectiveIsInvalid && <FieldError className={errorMessageStyles}>{t(effectiveErrorMessage ?? '')}</FieldError>}
    </TextField>
  );
}));

CompanyTimeField.displayName = "CompanyTimeField";