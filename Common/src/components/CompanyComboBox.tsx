import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect, useMemo } from 'react';
import { ComboBox, Label, Group, Input, Button, Popover, ListBox, ListBoxItem, Text, FieldError } from 'react-aria-components';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './InGridContext';
import { useMessage } from '../hooks/useMessage';
import { useFocusSelect, isTouchDevice } from '../hooks/useFocusSelect';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';

export interface CompanyComboBoxProps {
  label: string;
  options: { label: string; value: string }[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  width?: 'full' | 'auto' | number | string;
  textAlign?: 'left' | 'center' | 'right';
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  isClearable?: boolean;
}

export const CompanyComboBox = React.memo(forwardRef<HTMLInputElement, CompanyComboBoxProps>((props, ref) => {
  const {
    label, options, value, onChange, width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const [isComposing, setIsComposing] = useState(false);
  const handleEnterFocus = useEnterFocus(isComposing);
  const [isFocused, setIsFocused] = useState(false);

  const safeValue = value || null;
  const [localSelectedKey, setLocalSelectedKey] = useState<string | null>(safeValue);
  const [localInputValue, setLocalInputValue] = useState("");

  const lastValidValue = useRef(safeValue);
  useEffect(() => {
    if (safeValue !== null) lastValidValue.current = safeValue;
  }, [safeValue]);

  useEffect(() => {
    if (isFocused) return;
    setLocalSelectedKey(safeValue);
    const selectedOption = options.find(o => o.value === safeValue);
    setLocalInputValue(selectedOption ? selectedOption.label : "");
  }, [safeValue, options, isFocused]);

  const commitLocalValue = useCallback(() => {
    if (localInputValue === '') {
      if (safeValue !== null) onChange?.(null);
      setLocalSelectedKey(null);
      setLocalInputValue('');
      return;
    }

    const exactMatch = options.find(o => o.label === localInputValue);
    if (exactMatch) {
      if (exactMatch.value !== safeValue) onChange?.(exactMatch.value);
      setLocalSelectedKey(exactMatch.value);
      setLocalInputValue(exactMatch.label);
    } else {
      const currentOption = options.find(o => o.value === safeValue);
      if (currentOption) {
        setLocalSelectedKey(safeValue);
        setLocalInputValue(currentOption.label);
      } else {
        if (safeValue !== null) onChange?.(null);
        setLocalSelectedKey(null);
        setLocalInputValue('');
      }
    }
  }, [localInputValue, options, safeValue, onChange]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (!isTouchDevice) window.getSelection()?.removeAllRanges();
    commitLocalValue();
  }, [commitLocalValue]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    setIsFocused(true);
  }, []));

  const hasClearButton = isClearable && !isReadOnly && Boolean(safeValue);
  const ariaItems = useMemo(() => options.map(opt => ({ ...opt, id: opt.value })), [options]);
  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';

  return (
    <ComboBox
      className={`${containerStyles({ width: containerWidthProp })} outline-none`}
      style={{ width: styleWidth }}
      allowsCustomValue={true} 
      items={ariaItems}
      selectedKey={localSelectedKey}
      
      onSelectionChange={(key) => {
        const strKey = key ? String(key) : null;
        setLocalSelectedKey(strKey);
        if (strKey) {
          onChange?.(strKey);
          const opt = options.find(o => o.value === strKey);
          if (opt) setLocalInputValue(opt.label);
        } else {
          onChange?.(null);
          setLocalInputValue('');
        }
      }}
      
      inputValue={localInputValue}
      onInputChange={(text) => {
        setLocalInputValue(text);
        const opt = options.find(o => o.value === localSelectedKey);
        if (opt && opt.label !== text) {
          setLocalSelectedKey(null);
        }
      }}
      
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      {({ isOpen }) => (
        <>
          <Label className={labelCommonStyles({ isInGrid })}>
            {label}
          </Label>

          {/* Group は元の通り、groupStyles にすべてを任せる */}
          <Group className={groupStyles({ isFocused, isInvalid, isReadOnly, isInGrid })}>
            <Input
              ref={innerRef}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              
              className={inputStyles({ textAlign, hasClearButton: false })}
              
              onKeyDownCapture={(e) => {
                if (e.key === 'Backspace' && !isComposing) {
                  e.stopPropagation(); 
                }
              }}
              
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isComposing) return;
                  
                  const target = e.currentTarget;
                  const activeDescendant = target.getAttribute('aria-activedescendant');

                  const syntheticEvent = {
                    key: e.key,
                    target: target,
                    currentTarget: target,
                    shiftKey: e.shiftKey,
                    preventDefault: () => {}, 
                    stopPropagation: () => e.stopPropagation(),
                  };

                  if (isOpen && activeDescendant) {
                    setTimeout(() => {
                      handleEnterFocus(syntheticEvent as any);
                    }, 10);
                  } else {
                    e.preventDefault(); 
                    commitLocalValue();
                    handleEnterFocus(syntheticEvent as any);
                  }
                }
              }}
            />

            {hasClearButton && (
              <Button
                onPress={() => { 
                  onChange?.(null); 
                  setLocalSelectedKey(null);
                  setLocalInputValue(""); 
                  innerRef.current?.focus(); 
                }}
                className="px-2 shrink-0 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 outline-none cursor-pointer bg-transparent border-none"
              >
                ✕
              </Button>
            )}

            <Button className={`px-2 shrink-0 h-full flex items-center justify-center outline-none ring-0 cursor-pointer transition-colors
              ${isInGrid ? 'border-none bg-transparent hover:bg-gray-100' : 'bg-gray-50 border-0 border-l border-solid border-gray-300 hover:bg-gray-100 text-gray-600'}
            `}>
              ▼
            </Button>
          </Group>

          {!isInGrid && description && !isInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
          {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage)}</FieldError>}
          
          <Popover className="max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 outline-none z-50">
            <ListBox className="p-1 outline-none">
              {(option: any) => (
                <ListBoxItem
                  id={option.id}
                  textValue={option.label}
                  className={({ isFocused, isSelected }) => `
                    cursor-pointer select-none relative py-2 pl-3 pr-9 rounded-sm outline-none text-sm
                    ${isFocused ? 'bg-blue-600 text-white' : 'text-gray-900'}
                    ${isSelected ? 'font-bold' : 'font-normal'}
                  `}
                >
                  {option.label}
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </>
      )}
    </ComboBox>
  );
}));

CompanyComboBox.displayName = "CompanyComboBox";