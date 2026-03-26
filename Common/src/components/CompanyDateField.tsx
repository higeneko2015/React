import React, { useState, forwardRef, useRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { TextField, Label, Group, Input, Button, Popover, Dialog, Calendar, Heading, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, CalendarCell, Text, FieldError, DialogTrigger } from 'react-aria-components';
import { CalendarDate } from '@internationalized/date';
import { useEnterFocus } from '../hooks/useEnterFocus';
import { useFocusSelect } from '../hooks/useFocusSelect';
import { containerStyles, inputStyles, groupStyles, labelCommonStyles, descriptionStyles, errorMessageStyles, clearButtonStyles } from './companyTextFieldStyles';
import { useInGrid } from './InGridContext';
import { useMessage } from '../hooks/useMessage';

export interface CompanyDateFieldProps {
  label: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  formatType?: 'YYYY/MM/DD' | 'YYYY/MM' | 'MM/DD';
  width?: 'full' | 'auto' | number | string;
  textAlign?: 'left' | 'center' | 'right'; // 💥 textAlign を追加して他と合わせる
  isReadOnly?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
  placeholder?: string;
  isClearable?: boolean;
}

// 1. スラッシュを強制的に挿入するだけの関数
const blindFormatDate = (raw: string, type: 'YYYY/MM/DD' | 'YYYY/MM' | 'MM/DD') => {
  const d = raw.replace(/\D/g, '');
  if (!d) return raw;

  if (type === 'YYYY/MM/DD') {
    let str = d;
    if (str.length === 6) str = '20' + str;
    if (str.length >= 8) return `${str.slice(0, 4)}/${str.slice(4, 6)}/${str.slice(6, 8)}`;
  } else if (type === 'YYYY/MM') {
    let str = d;
    if (str.length === 4) str = '20' + str;
    if (str.length >= 6) return `${str.slice(0, 4)}/${str.slice(4, 6)}`;
  } else if (type === 'MM/DD') {
    if (d.length >= 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}`;
  }
  return raw;
};

// 2. 整形された文字列が「実在する日付か」を厳密にチェックする関数
const isValidDateStr = (str: string, type: 'YYYY/MM/DD' | 'YYYY/MM' | 'MM/DD') => {
  if (!str) return true;
  const parts = str.split('/');

  if (type === 'YYYY/MM/DD' && parts.length === 3) {
    const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  } else if (type === 'YYYY/MM' && parts.length === 2) {
    const m = parseInt(parts[1], 10);
    return m >= 1 && m <= 12;
  } else if (type === 'MM/DD' && parts.length === 2) {
    const m = parseInt(parts[0], 10), d = parseInt(parts[1], 10);
    const dt = new Date(2024, m - 1, d);
    return dt.getMonth() === m - 1 && dt.getDate() === d;
  }
  return false;
};

const getCalendarDate = (str: string) => {
  try {
    const parts = str.split('/');
    if (parts.length === 3) {
      const y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
      const dt = new Date(y, m - 1, d);
      if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
        return new CalendarDate(y, m, d);
      }
    }
  } catch (e) { }
  return undefined;
};

export const CompanyDateField = React.memo(forwardRef<HTMLInputElement, CompanyDateFieldProps>((props, ref) => {
  const {
    label, value = "", onChange, formatType = 'YYYY/MM/DD', width = "full", textAlign = "left",
    isReadOnly, isInvalid, errorMessage, description, placeholder,
    isClearable = false,
  } = props;

  const isInGrid = useInGrid();
  const { t } = useMessage();

  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const handleKeyDown = useEnterFocus(isComposing);

  const [isOpen, setIsOpen] = useState(false);
  const [internalError, setInternalError] = useState(false);

  useEffect(() => {
    // 💥 追加: 自分がアクティブ（フォーカス中）なら、入力中の値を上書きしない！
    if (document.activeElement === innerRef.current) return;

    const safeValue = value || "";
    setInputValue(safeValue);

    // ※以下は各ファイルに合わせてください（DateFieldならisValidDateStr、TimeFieldならisValidTimeStr）
    if (isValidDateStr(safeValue, formatType)) setInternalError(false);
  }, [value, formatType]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
    if (internalError) setInternalError(false);
  }, [internalError]);

  const handleFocus = useFocusSelect(isReadOnly, useCallback(() => {
    setIsFocused(true);
    setInputValue(prev => (prev || "").replace(/\//g, ''));
  }, []));

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (!inputValue) {
      setInternalError(false);
      onChange?.(null); // 空の時は null を返す
      return;
    }

    const formatted = blindFormatDate(inputValue, formatType);
    setInputValue(formatted);
    const isValid = isValidDateStr(formatted, formatType);

    if (!isValid) {
      setInternalError(true);
      onChange?.(formatted);
    } else {
      setInternalError(false);
      if (formatted !== value) onChange?.(formatted);
    }
  }, [inputValue, formatType, value, onChange]);

  const handleCalendarChange = useCallback((date: CalendarDate) => {
    const yyyy = date.year;
    const mm = String(date.month).padStart(2, '0');
    const dd = String(date.day).padStart(2, '0');
    const formatted = `${yyyy}/${mm}/${dd}`;
    setInputValue(formatted);
    setInternalError(false);
    onChange?.(formatted);
    setIsOpen(false);
  }, [onChange]);

  const styleWidth = typeof width === 'number' ? `${width}ch` : (width !== 'full' && width !== 'auto' ? width : undefined);
  const containerWidthProp = (width === 'full' || width === 'auto') ? width : 'auto';

  const effectiveIsInvalid = isInvalid || internalError;
  const effectiveErrorMessage = internalError ? "有効な日付を入力してください" : errorMessage;

  const hasClearButton = isClearable && !isReadOnly && Boolean(inputValue);

  return (
    <TextField
      className={containerStyles({ width: containerWidthProp })}
      style={{ width: styleWidth }}
      isReadOnly={isReadOnly}
      isInvalid={effectiveIsInvalid}
    >
      {/* 💥 修正2: Label は消さずに sr-only で隠す */}
      <Label className={labelCommonStyles({ isInGrid })}>
        {label}
      </Label>

      <Group className={groupStyles({ isFocused, isInvalid: effectiveIsInvalid, isReadOnly, isInGrid })}>
        <Input
          ref={innerRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder || (formatType === 'YYYY/MM/DD' ? "YYYY/MM/DD" : formatType)}
          maxLength={formatType === 'YYYY/MM/DD' ? 8 : formatType === 'YYYY/MM' ? 6 : 4}
          inputMode="numeric"
          // 💥 修正3: inputStyles を使用して美しく適用！ (カレンダーと×ボタンはflex要素なので hasClearButton は false でOK)
          className={inputStyles({ textAlign, hasClearButton: false })}
        />

        {/* クリアボタン（Flexアイテムとして配置） */}
        {hasClearButton && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => { setInputValue(""); setInternalError(false); onChange?.(null); innerRef.current?.focus(); }}
            className={clearButtonStyles({ className: "relative right-0" })}
          >✕</button>
        )}

        {/* カレンダーボタン */}
        {formatType === 'YYYY/MM/DD' && (
          <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
              isDisabled={isReadOnly}
              onKeyDown={handleKeyDown}
              className={`px-2 h-full flex items-center justify-center border-solid outline-none cursor-pointer shrink-0 transition-colors
                ${isInGrid ? 'border-none bg-transparent' : 'border-0 border-l border-gray-300 bg-gray-50'}
                ${effectiveIsInvalid ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              📅
            </Button>
            <Popover placement="bottom end" className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 z-50 outline-none">
              <Dialog className="outline-none">
                {/* カレンダー本体は省略せずそのまま */}
                <Calendar value={getCalendarDate(inputValue)} onChange={handleCalendarChange}>
                  <header className="flex w-full items-center gap-1 pb-2 border-b border-gray-100 mb-2">
                    <Button slot="previous" className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer outline-none">◀</Button>
                    <Heading className="flex-1 text-center font-bold text-gray-800 text-sm" />
                    <Button slot="next" className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer outline-none">▶</Button>
                  </header>
                  <CalendarGrid className="border-collapse">
                    <CalendarGridHeader>
                      {(day) => <CalendarHeaderCell className="text-xs text-gray-500 pb-2">{day}</CalendarHeaderCell>}
                    </CalendarGridHeader>
                    <CalendarGridBody>
                      {(date) => (
                        <CalendarCell
                          date={date}
                          className={({ isSelected, isOutsideVisibleRange }) => `
                            w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer outline-none
                            ${isOutsideVisibleRange ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                            ${isSelected ? 'bg-blue-600 text-white font-bold shadow-sm' : ''}
                            focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                          `}
                        />
                      )}
                    </CalendarGridBody>
                  </CalendarGrid>
                </Calendar>
              </Dialog>
            </Popover>
          </DialogTrigger>
        )}
      </Group>

      {/* 💥 修正4: エラーメッセージ等も isInGrid を見て非表示にする */}
      {!isInGrid && description && !effectiveIsInvalid && <Text slot="description" className={descriptionStyles}>{description}</Text>}
      {!isInGrid && effectiveIsInvalid && <FieldError className={errorMessageStyles}>{t(effectiveErrorMessage)}</FieldError>}
    </TextField>
  );
}));

CompanyDateField.displayName = "CompanyDateField";