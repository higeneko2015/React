import React, { useState, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { TextField, Label, Input, Text, FieldError, Group } from 'react-aria-components';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './InGridContext';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

export interface CompanyTextFieldProps {
  label: string;
  value?: string | null;
  onChange?: (value: string) => void;
  width?: 'full' | 'auto' | number | string;
  textAlign?: 'left' | 'center' | 'right';
  maxLength?: number;
  allowedChars?: RegExp;
  format?: (val: string) => string;
  unformat?: (val: string) => string;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  isClearable?: boolean;
}

export const CompanyTextField = React.memo(forwardRef<HTMLInputElement, CompanyTextFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, width = "full", textAlign = "left",
    maxLength, allowedChars, format, unformat,
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    inputMode = "text", enterKeyHint = "next",
    isClearable = false,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const safeValue = value || "";
  const displayValue = (!isFocused && format) ? format(safeValue) : safeValue;
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
      setIsFocused(true);
      if (unformat) onChange?.(unformat(safeValue));
    }
  }, [isReadOnly, unformat, safeValue, onChange]));

  const handleBlur = useCallback(() => setIsFocused(false), []);

  const handleClear = useCallback(() => {
    onChange?.("");
    innerRef.current?.focus();
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const hasClearButton = isClearable && !isReadOnly && Boolean(safeValue);

  return (
    <TextField
      className={containerStyles({ width: containerWidthProp })}
      style={{ width: styleWidth }}
      value={displayValue}
      onChange={handleChange}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      <Group className={groupStyles({ isFocused, isInvalid, isReadOnly, isInGrid })}>
        <Input
          ref={innerRef}
          placeholder={placeholder}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint as any}
          maxLength={maxLength}
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
      {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage)}</FieldError>}
    </TextField>
  );
}));

CompanyTextField.displayName = "CompanyTextField";