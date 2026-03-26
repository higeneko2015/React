import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { TextField, Label, Input, Text, FieldError, Group } from 'react-aria-components';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './InGridContext';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

export interface CompanyPhoneFieldProps {
  label: string;
  value?: string | null;
  onChange?: (value: string) => void;
  width?: 'full' | 'auto' | number | string;
  textAlign?: 'left' | 'center' | 'right';
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  isClearable?: boolean;
}

export const CompanyPhoneField = React.memo(forwardRef<HTMLInputElement, CompanyPhoneFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const handleKeyDown = useEnterFocus(isComposing);
  const safeValue = value || "";

  const displayValue = useMemo(() => {
    if (!safeValue) return "";
    if (isFocused && !isReadOnly) return safeValue;
    if (safeValue.length === 11) return `${safeValue.slice(0, 3)}-${safeValue.slice(3, 7)}-${safeValue.slice(7)}`;
    if (safeValue.length === 10) return `${safeValue.slice(0, 2)}-${safeValue.slice(2, 6)}-${safeValue.slice(6)}`;
    return safeValue;
  }, [safeValue, isFocused, isReadOnly]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value.replace(/[^0-9]/g, '').slice(0, 11));
  }, [onChange]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    if (!isReadOnly) setIsFocused(true);
  }, [isReadOnly]));

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
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      <Group className={groupStyles({ isFocused, isInvalid, isReadOnly, isInGrid })}>
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
          inputMode="tel"
          maxLength={11}
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
      {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage)}</FieldError>}
    </TextField>
  );
}));

CompanyPhoneField.displayName = "CompanyPhoneField";

export const formatPhoneView = (value: string | null) => {
  if (!value) return "";
  if (value.length === 11) return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
  if (value.length === 10) return `${value.slice(0, 2)}-${value.slice(2, 6)}-${value.slice(6)}`;
  return value;
};

(CompanyPhoneField as any).formatView = formatPhoneView;
