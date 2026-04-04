import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { ComboBox, Label, Group, Input, Button, Popover, ListBox, ListBoxItem, Text, FieldError } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';
import { useMessage } from '../hooks/useMessage';
import { useFocusSelect, isTouchDevice } from '../hooks/useFocusSelect';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles } from './companyTextFieldStyles';

/**
 * 社内システム用共通コンボボックスコンポーネント。
 * 入力補完付きのドロップダウンリストを提供し、グリッド内のコンパクト表示にも対応しています。
 */
export interface CompanyComboBoxProps {
  /** コンボボックスのラベルテキスト */
  label: string;
  /** 選択肢の配列（labelとvalueのペア） */
  options: { label: string; value: string }[];
  /** 現在の選択値（value） */
  value?: string | null;
  /** 値が変更された際のコールバック */
  onChange?: (value: string | null) => void;
  /** コンポーネント全体の幅（デフォルト: 'full'） */
  width?: 'full' | 'auto' | number | string;
  /** 入力テキストの配置（デフォルト: 'left'） */
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

export const CompanyComboBox = React.memo(forwardRef<HTMLInputElement, CompanyComboBoxProps>((props, ref) => {
  const {
    label, options, value, onChange, width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false, className,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const [isComposing, setIsComposing] = useState(false);
  const handleEnterFocus = useEnterFocus(isComposing);
  const [isFocusedInner, setIsFocusedInner] = useState(false);

  const safeValue = value ?? null;
  const [prevValue, setPrevValue] = useState<string | null>(safeValue);
  const [localSelectedKey, setLocalSelectedKey] = useState<string | null>(safeValue);
  const [localInputValue, setLocalInputValue] = useState(() => {
    const selectedOption = options.find(o => o.value === safeValue);
    return selectedOption ? selectedOption.label : "";
  });

  const lastValidValue = useRef(safeValue);
  if (safeValue !== null) {
    lastValidValue.current = safeValue;
  }

  // Props (safeValue) が変化した場合に同期するパターン
  if (safeValue !== prevValue) {
    setPrevValue(safeValue);
    if (!isFocusedInner) {
      setLocalSelectedKey(safeValue);
      const selectedOption = options.find(o => o.value === safeValue);
      setLocalInputValue(selectedOption ? selectedOption.label : "");
    }
  }

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
    setIsFocusedInner(false);
    if (!isTouchDevice) window.getSelection()?.removeAllRanges();
    commitLocalValue();
  }, [commitLocalValue]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    setIsFocusedInner(true);
  }, []));

  // JSXの可読性向上のためコールバックを分離
  const handleSelectionChange = useCallback((key: React.Key | null) => {
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
  }, [onChange, options]);

  const handleInputChange = useCallback((text: string) => {
    setLocalInputValue(text);
    const opt = options.find(o => o.value === localSelectedKey);
    if (opt && opt.label !== text) {
      setLocalSelectedKey(null);
    }
  }, [localSelectedKey, options]);

  const hasClearButton = isClearable && !isReadOnly && Boolean(safeValue);
  const ariaItems = useMemo(() => options.map(opt => ({ ...opt, id: opt.value })), [options]);
  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';

  return (
    <ComboBox
      className={twMerge(containerStyles({ width: containerWidthProp }), 'outline-none', className)}
      style={{ width: styleWidth }}
      allowsCustomValue={true}
      items={ariaItems}
      selectedKey={localSelectedKey}
      onSelectionChange={handleSelectionChange}
      inputValue={localInputValue}
      onInputChange={handleInputChange}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      {({ isOpen }) => (
        <>
          <Label className={labelCommonStyles({ isInGrid })}>
            {label}
          </Label>

          <Group className={groupStyles({ isInvalid, isReadOnly, isInGrid })}>
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
                    fromElement: target,
                    shiftKey: e.shiftKey,
                    preventDefault: () => { },
                    stopPropagation: () => e.stopPropagation(),
                  };

                  if (isOpen && activeDescendant) {
                    // ✨ 修正箇所: setTimeout(10ms) を排除し、rAFの二重ネストで安全に待機
                    // Reactの再レンダリングとDOMの更新を確実に待ってからフォーカス移動を実行します
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        handleEnterFocus(syntheticEvent);
                      });
                    });
                  } else {
                    e.preventDefault();
                    commitLocalValue();
                    handleEnterFocus(syntheticEvent);
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

            <Button className={twMerge(
              'px-2 shrink-0 h-full flex items-center justify-center outline-none ring-0 cursor-pointer transition-colors',
              isInGrid ? 'border-none bg-transparent hover:bg-gray-100' : 'bg-gray-50 border-0 border-l border-solid border-gray-300 hover:bg-gray-100 text-gray-600'
            )}>
              ▼
            </Button>
          </Group>

          {!isInGrid && description && !isInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
          {!isInGrid && isInvalid && <FieldError className={errorMessageStyles}>{t(errorMessage ?? '')}</FieldError>}

          <Popover className="max-h-60 w-[var(--trigger-width)] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 outline-none z-50">
            <ListBox className="p-1 outline-none">
              {(option: { id: string; label: string; value: string }) => (
                <ListBoxItem
                  id={option.id}
                  textValue={option.label}
                  className={({ isFocused, isSelected }) => twMerge(
                    'cursor-pointer select-none relative py-2 pl-3 pr-9 rounded-sm outline-none text-sm',
                    isFocused ? 'bg-blue-600 text-white' : 'text-gray-900',
                    isSelected ? 'font-bold' : 'font-normal'
                  )}
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