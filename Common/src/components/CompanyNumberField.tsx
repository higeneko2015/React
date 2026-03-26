import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { Label, Input, Text, FieldError, Group, TextField } from 'react-aria-components';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './InGridContext';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { useMessage } from '../hooks/useMessage';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';

export interface CompanyNumberFieldProps {
  label: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  width?: 'full' | 'auto' | number | string;
  textAlign?: 'left' | 'center' | 'right';
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  fractionDigits?: number;
  isClearable?: boolean;
}

export const CompanyNumberField = React.memo(forwardRef<HTMLInputElement, CompanyNumberFieldProps>((props, ref) => {
  const {
    label, value = null, onChange, width = "full", textAlign = "right",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    fractionDigits = 0, isClearable = false,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const [isFocused, setIsFocused] = useState(false);
  // 小数点入力中の「100.」などを維持するためのローカルステート
  const [localString, setLocalString] = useState<string>("");

  const handleKeyDown = useEnterFocus(false);

  const displayValue = useMemo(() => {
    if (isFocused && !isReadOnly) return localString;
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }, [value, isFocused, isReadOnly, fractionDigits, localString]);

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
      setIsFocused(true);
      setLocalString(value !== null && value !== undefined ? value.toString() : "");
    }
  }, [isReadOnly, value]));

  const handleBlur = useCallback(() => setIsFocused(false), []);

  const handleClear = useCallback(() => {
    onChange?.(null);
    setLocalString("");
    innerRef.current?.focus();
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';
  const hasClearButton = isClearable && !isReadOnly && value !== null && value !== undefined;

  return (
    <TextField className={containerStyles({ width: containerWidthProp })} style={{ width: styleWidth }}>
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
      {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage)}</FieldError>}
    </TextField>
  );
}));

CompanyNumberField.displayName = "CompanyNumberField";