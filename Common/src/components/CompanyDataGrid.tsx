import React, { useState, useCallback, memo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import * as z from 'zod';

import { InGridProvider } from './InGridContext';

// 型のインポートはルール通り一番下に！
import type { ColumnDef, Row, Cell } from '@tanstack/react-table';

/**
 * 編集可能セルのプロパティ
 */
export interface EditableCellProps<TValue = unknown> {
  /** セルの現在の値 */
  value: TValue;
  /** 値が変更されたときのコールバック */
  onChange: (val: TValue | null) => void;
  /** レンダリングに使用するコンポーネント（CompanyButton, CompanyComboBoxなど） */
  component: React.ElementType;
  /** 表示用のフォーマット関数 */
  formatView?: (val: TValue) => React.ReactNode;
  /** テキストの配置（デフォルト: 'left'） */
  textAlign?: 'left' | 'center' | 'right';
  /** セレクトボックスやラジオボタンの選択肢 */
  options?: { label: string; value: string }[];
  /** 読み取り専用かどうか */
  isReadOnly?: boolean;
  /** Zodスキーマ（入力値のリアルタイムバリデーション用） */
  schema?: z.ZodTypeAny;
}

const EditableCellInner = <TValue,>({
  value, onChange, component: Component, formatView, textAlign = 'left', options, children, isReadOnly = false, schema, ...rest
}: EditableCellProps<TValue> & Record<string, unknown> & { children?: React.ReactNode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isEditing && containerRef.current) {
      const input = containerRef.current.querySelector('input');
      if (input) input.focus();
    }
  }, [isEditing]);

  React.useEffect(() => {
    if (!schema) {
      setErrorMsg(null);
      return;
    }
    if (value === null || value === undefined || value === '') {
      setErrorMsg(null);
      return;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
    } else {
      setErrorMsg(null);
    }
  }, [value, schema]);

  const ComponentInfo = Component as { displayName?: string; formatView?: (val: unknown) => React.ReactNode };
  const isCombobox = ComponentInfo.displayName === 'CompanyComboBox';
  const isCheckbox = ComponentInfo.displayName === 'CompanyCheckbox';
  const isRadio = ComponentInfo.displayName === 'CompanyRadioGroup';
  const isButton = ComponentInfo.displayName === 'CompanyButton';

  const renderValue = () => {
    if (formatView) return formatView(value);
    if (options && value != null) {
      const opt = options.find(o => o.value === String(value));
      if (opt) return opt.label;
    }
    const componentFormat = ComponentInfo.formatView;
    if (typeof componentFormat === 'function') return componentFormat(value);
    return value != null ? String(value) : '';
  };

  // ルール9.1: インライン関数が長すぎたので分離！
  const handleActionKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (isReadOnly) return;
      if (isButton) {
        (e.currentTarget.querySelector('button') as HTMLElement)?.click();
      } else if (isCheckbox) {
        onChange((!value) as TValue | null);
      } else if (isRadio) {
        let values: unknown[] = [];
        if (options) {
          values = options.map(o => o.value);
        } else if (children) {
          const kids = React.Children.toArray(children) as React.ReactElement<{ value?: unknown }>[];
          values = kids.map(k => k.props.value).filter(v => v != null);
        }
        if (values.length > 0) {
          const currentIndex = values.indexOf(value);
          const nextIndex = (currentIndex + 1) % values.length;
          onChange(values[nextIndex] as TValue | null);
        }
      }
    }
  }, [isReadOnly, isButton, isCheckbox, isRadio, onChange, value, options, children]);

  // ルール9.1: こちらも分離してスッキリ！
  const handleViewKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    if (e.key === 'F2' || (e.altKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onChange(null);
      setIsEditing(true);
    } else if ((e.key.length === 1 || e.key === 'Process' || e.key === 'Unidentified') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      if (e.key.length === 1) {
        onChange(e.key as TValue | null);
      } else {
        onChange('' as TValue | null);
      }
      setIsEditing(true);
    }
  }, [isReadOnly, onChange]);

  const justifyClass = textAlign === 'right' ? 'justify-end' : textAlign === 'center' ? 'justify-center' : 'justify-start';

  if (isButton || isCheckbox || isRadio) {
    return (
      <div
        tabIndex={0}
        data-view-mode="true"
        onClick={(e) => e.currentTarget.focus()}
        onKeyDown={handleActionKeyDown}
        title={errorMsg || undefined}
        style={errorMsg ? { backgroundColor: 'rgb(254 226 226)', outline: '2px solid rgb(239 68 68)', outlineOffset: '-1px' } : undefined}
        className={`group relative w-full h-[32px] ${isButton ? 'px-0' : 'px-3'} flex items-center ${justifyClass} bg-transparent outline-none cursor-cell`}
      >
        {isCheckbox ? (
          <Component label="" isSelected={value} onChange={onChange} width="full" textAlign={textAlign} isReadOnly={isReadOnly} isInvalid={!!errorMsg} {...rest} />
        ) : isRadio ? (
          <Component label="" value={value} onChange={onChange} width="full" textAlign={textAlign} options={options} isReadOnly={isReadOnly} isInvalid={!!errorMsg} {...rest}>
            {children}
          </Component>
        ) : (
          <Component width="full" isDisabled={isReadOnly} {...rest}>{children}</Component>
        )}
        <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-focus:border-blue-500 group-focus-within:border-blue-500 z-20" />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div
        tabIndex={0}
        data-view-mode="true"
        onClick={(e) => e.currentTarget.focus()}
        onDoubleClick={() => { if (!isReadOnly) setIsEditing(true); }}
        onKeyDown={handleViewKeyDown}
        title={errorMsg || undefined}
        style={errorMsg ? { backgroundColor: 'rgb(254 226 226)', outline: '2px solid rgb(239 68 68)', outlineOffset: '-1px' } : undefined}
        className={`group relative w-full h-[32px] flex items-center ${isCombobox ? 'justify-between' : justifyClass} outline-none cursor-cell bg-transparent select-none ${errorMsg ? 'text-red-700 font-bold' : 'text-gray-900'}`}
      >
        <div className={`truncate flex-1 h-full flex items-center px-[var(--input-px,8px)] font-[family-name:var(--font-family-base,sans-serif)] text-[length:var(--font-size-input,13px)] leading-normal ${textAlign === 'right' ? 'justify-end' : textAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className="truncate">{renderValue()}</span>
        </div>
        {isCombobox && !isReadOnly && (
          <div className={`px-2 shrink-0 h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors ${errorMsg ? 'text-red-500' : ''}`} onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
            ▼
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-focus:border-blue-500 group-focus-within:border-blue-500 z-20" />
      </div>
    );
  }

  return (
    <div
      title={errorMsg || undefined}
      className="w-full h-[32px] relative group"
      onBlur={(e) => {
        const isClickingPopup = e.relatedTarget?.closest('[role="dialog"], [role="listbox"], .react-aria-Popover');
        if (!e.currentTarget.contains(e.relatedTarget) && !isClickingPopup) setIsEditing(false);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false); }}
      ref={containerRef}
    >
      <Component label="" value={value} onChange={onChange} width="full" textAlign={textAlign} options={options} isInvalid={!!errorMsg} errorMessage={errorMsg || ''} {...rest} />
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-focus-within:border-blue-500 z-20 transition-colors" />
    </div>
  );
};

export const EditableCell = memo(EditableCellInner) as <TValue = unknown>(
  props: EditableCellProps<TValue> & Record<string, unknown> & { children?: React.ReactNode }
) => React.ReactElement;

(EditableCell as unknown as { displayName: string }).displayName = 'EditableCell';

const GridCell = memo(({ cell }: { cell: Cell<unknown, unknown> }) => {
  return (
    <td
      data-row-index={cell.row.index}
      data-col-index={cell.column.getIndex()}
      className="border-b border-r border-gray-200 p-0 h-[32px] last:border-r-0 overflow-hidden"
    >
      <div className="h-[32px] w-full relative">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </td>
  );
});
GridCell.displayName = 'GridCell';

const GridRow = memo(({ row }: { row: Row<unknown> }) => {
  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      {row.getVisibleCells().map(cell => (
        <GridCell key={cell.id} cell={cell} />
      ))}
    </tr>
  );
}, (prev, next) => prev.row.original === next.row.original && prev.row.index === next.row.index);
GridRow.displayName = 'GridRow';

/**
 * 高速描画とキーボードナビゲーションに対応したデータグリッドコンポーネント。
 */
export interface CompanyDataGridProps<T extends object> {
  /** テーブルに表示するデータ配列 */
  data: T[];
  /** TanStack Table のカラム定義 */
  columns: ColumnDef<T, unknown>[];
  /** コンテナの最大高さ（スクロール領域） */
  maxHeight?: string;
}

export const CompanyDataGrid = <T extends object>({ data, columns, maxHeight = "600px" }: CompanyDataGridProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const maxRows = rows.length;
  const maxCols = table.getVisibleLeafColumns().length;

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const ROW_HEIGHT = 32;

  const rowVirtualizer = useVirtualizer({
    count: maxRows,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  const snapScrollPosition = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const activeEl = document.activeElement as HTMLElement;
      const td = activeEl?.closest('td[data-row-index]') as HTMLElement | null;
      if (!td) return;

      const containerRect = container.getBoundingClientRect();
      const tdRect = td.getBoundingClientRect();

      const thead = container.querySelector('thead');
      const headerHeight = thead ? thead.getBoundingClientRect().height : 0;

      const tdTopRelative = tdRect.top - containerRect.top;
      const tdBottomRelative = tdRect.bottom - containerRect.top;
      const visibleTop = headerHeight;
      const visibleBottom = container.clientHeight;

      let newScrollTop: number | null = null;

      if (tdTopRelative < visibleTop) {
        const targetScroll = container.scrollTop - (visibleTop - tdTopRelative);
        newScrollTop = Math.max(0, Math.floor(targetScroll / ROW_HEIGHT) * ROW_HEIGHT);
      } else if (tdBottomRelative > visibleBottom) {
        const targetScroll = container.scrollTop + (tdBottomRelative - visibleBottom);
        newScrollTop = Math.ceil(targetScroll / ROW_HEIGHT) * ROW_HEIGHT;
      }

      if (newScrollTop !== null && newScrollTop !== container.scrollTop) {
        container.scrollTop = newScrollTop;
      }
    });
  }, []);

  const handleGridKeyDown = useCallback((e: React.KeyboardEvent<HTMLTableSectionElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

    const activeEl = document.activeElement as HTMLElement;
    const currentTd = activeEl?.closest('td');
    if (!currentTd) return;

    const isNavMode = currentTd.querySelector('[data-view-mode="true"]') !== null;
    if (!isNavMode) return;

    e.preventDefault();
    e.stopPropagation();

    const rowIndexStr = currentTd.getAttribute('data-row-index');
    const colIndexStr = currentTd.getAttribute('data-col-index');
    if (rowIndexStr == null || colIndexStr == null) return;

    const currentRow = parseInt(rowIndexStr, 10);
    const currentCol = parseInt(colIndexStr, 10);

    const step = (r: number, c: number) => {
      let nextR = r;
      let nextC = c;
      switch (e.key) {
        case 'ArrowRight': nextC += 1; break;
        case 'ArrowLeft': nextC -= 1; break;
        case 'ArrowDown': nextR += 1; break;
        case 'ArrowUp': nextR -= 1; break;
        case 'Enter':
          if (e.shiftKey) {
            nextC -= 1;
            if (nextC < 0) { nextC = maxCols - 1; nextR -= 1; }
          } else {
            nextC += 1;
            if (nextC >= maxCols) { nextC = 0; nextR += 1; }
          }
          break;
      }
      return { r: nextR, c: nextC };
    };

    const { r, c } = step(currentRow, currentCol);

    if (r >= 0 && r < maxRows && c >= 0 && c < maxCols) {
      rowVirtualizer.scrollToIndex(r);

      setTimeout(() => {
        let currentR = r;
        let currentC = c;
        let foundTarget: HTMLElement | null = null;

        while (currentR >= 0 && currentR < maxRows && currentC >= 0 && currentC < maxCols) {
          const nextTd = document.querySelector(`td[data-row-index="${currentR}"][data-col-index="${currentC}"]`);

          if (nextTd) {
            const target = nextTd.querySelector('[data-view-mode="true"]') as HTMLElement;
            if (target) {
              foundTarget = target;
              break;
            }
          } else {
            rowVirtualizer.scrollToIndex(currentR);
            break;
          }

          const nextPos = step(currentR, currentC);
          currentR = nextPos.r;
          currentC = nextPos.c;
        }

        if (foundTarget) {
          foundTarget.focus();
          snapScrollPosition();
        }
      }, 10);
    }
  }, [maxRows, maxCols, rowVirtualizer, snapScrollPosition]);

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto shadow-sm rounded-lg border border-gray-200 bg-white"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse text-sm table-fixed">
        <thead className="bg-gray-50 text-gray-700 font-bold sticky top-0 z-20">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border-b border-r border-gray-200 px-3 py-2 text-left last:border-r-0 truncate bg-gray-50"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody onKeyDown={handleGridKeyDown} onFocus={snapScrollPosition} tabIndex={-1} className="outline-none">
          <InGridProvider value={true}>
            {paddingTop > 0 && (
              <tr><td style={{ height: `${paddingTop}px` }} colSpan={maxCols} className="p-0 border-0" /></tr>
            )}
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index];
              return <GridRow key={row.id} row={row} />;
            })}
            {paddingBottom > 0 && (
              <tr><td style={{ height: `${paddingBottom}px` }} colSpan={maxCols} className="p-0 border-0" /></tr>
            )}
          </InGridProvider>
        </tbody>
      </table>
    </div>
  );
};