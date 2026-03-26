import React, { useState, useCallback, memo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type Row,
  type Cell,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { InGridProvider } from './InGridContext';
import * as z from 'zod';

// ==========================================
// 💥 EditableCell: グリッド内の編集可能セル
// ==========================================
export interface EditableCellProps {
  value: any;
  onChange: (val: any) => void;
  component: React.ElementType;
  formatView?: (val: any) => React.ReactNode;
  textAlign?: 'left' | 'center' | 'right';
  options?: { label: string; value: string }[];
  isReadOnly?: boolean;
  schema?: z.ZodType<any>; // 💥 Zodスキーマを受け取る
  [key: string]: any;
}

export const EditableCell = memo<EditableCellProps>(({
  value, onChange, component: Component, formatView, textAlign = 'left', options, children, isReadOnly = false, schema, ...rest
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 💥 Zod による手動バリデーション（スキーマが渡されていれば実行）
  // ただし value が null/undefined（初期表示状態）のときはスキップする
  React.useEffect(() => {
    if (!schema) {
      setErrorMsg(null);
      return;
    }
    // value が null/undefined のときは「まだ編集されていない初期状態」とみなしてバリデーションしない
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

  const isCombobox = (Component as any).displayName === 'CompanyComboBox';
  const isCheckbox = (Component as any).displayName === 'CompanyCheckbox';
  const isRadio = (Component as any).displayName === 'CompanyRadioGroup';
  const isButton = (Component as any).displayName === 'CompanyButton';

  const renderValue = () => {
    if (formatView) return formatView(value);
    if (options && value != null) {
      const opt = options.find(o => o.value === String(value));
      if (opt) return opt.label;
    }
    const componentFormat = (Component as any).formatView;
    if (typeof componentFormat === 'function') return componentFormat(value);
    return value || '';
  };

  const justifyClass = textAlign === 'right' ? 'justify-end' : textAlign === 'center' ? 'justify-center' : 'justify-start';

  if (isButton || isCheckbox || isRadio) {
    return (
      <div
        tabIndex={0}
        data-view-mode="true"
        onClick={(e) => e.currentTarget.focus()}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            if (isReadOnly) return;
            if (isButton) {
              (e.currentTarget.querySelector('button') as HTMLElement)?.click();
            } else if (isCheckbox) {
              onChange(!value);
            } else if (isRadio) {
              let values: any[] = [];
              if (options) {
                values = options.map(o => o.value);
              } else if (children) {
                const kids = React.Children.toArray(children) as React.ReactElement<any>[];
                values = kids.map(k => k.props.value).filter(v => v != null);
              }
              if (values.length > 0) {
                const currentIndex = values.indexOf(value);
                const nextIndex = (currentIndex + 1) % values.length;
                onChange(values[nextIndex]);
              }
            }
          }
        }}
        title={errorMsg || undefined}
        style={errorMsg ? { backgroundColor: 'rgb(254 226 226)', outline: '2px solid rgb(239 68 68)', outlineOffset: '-1px' } : undefined}
        className={`group relative w-full h-[38px] ${isButton ? 'px-0' : 'px-3'} flex items-center ${justifyClass} bg-transparent outline-none cursor-cell`}
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
        onKeyDown={(e) => {
          if (isReadOnly) return;
          if (e.key === 'F2' || (e.altKey && e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsEditing(true);
          } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            onChange?.(null);
            setIsEditing(true);
          } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            setIsEditing(true);
          }
        }}
        title={errorMsg || undefined}
        style={errorMsg ? { backgroundColor: 'rgb(254 226 226)', outline: '2px solid rgb(239 68 68)', outlineOffset: '-1px' } : undefined}
        className={`group relative w-full h-[38px] flex items-center ${isCombobox ? 'justify-between' : justifyClass} outline-none cursor-cell bg-transparent select-none ${errorMsg ? 'text-red-700 font-bold' : 'text-gray-900'}`}
      >
        <div className={`truncate flex-1 h-full flex items-center px-[var(--input-px,8px)] font-[family-name:var(--font-family-base,sans-serif)] text-[length:var(--font-size-input,14px)] leading-normal ${textAlign === 'right' ? 'justify-end' : textAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
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
      className="w-full h-[38px] relative group"
      onBlur={(e) => {
        const isClickingPopup = e.relatedTarget?.closest('[role="dialog"], [role="listbox"], .react-aria-Popover');
        if (!e.currentTarget.contains(e.relatedTarget) && !isClickingPopup) setIsEditing(false);
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false); }}
      ref={(el) => {
        if (el) {
          const input = el.querySelector('input');
          if (input) input.focus();
        }
      }}
    >
      <Component label="" value={value} onChange={onChange} width="full" textAlign={textAlign} options={options} isInvalid={!!errorMsg} errorMessage={errorMsg || ''} {...rest} />
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-focus-within:border-blue-500 z-20 transition-colors" />
    </div>
  );
});

EditableCell.displayName = 'EditableCell';

const GridCell = memo(({ cell }: { cell: Cell<any, any> }) => {
  return (
    <td
      data-row-index={cell.row.index}
      data-col-index={cell.column.getIndex()}
      className="border-b border-r border-gray-200 p-0 h-[38px] last:border-r-0 overflow-hidden"
    >
      <div className="h-[38px] w-full relative">
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </td>
  );
});
GridCell.displayName = 'GridCell';

const GridRow = memo(({ row }: { row: Row<any> }) => {
  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      {row.getVisibleCells().map(cell => (
        <GridCell key={cell.id} cell={cell} />
      ))}
    </tr>
  );
});
GridRow.displayName = 'GridRow';

// ==========================================
// 💥 メインのグリッドコンポーネント
// ==========================================
export interface CompanyDataGridProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
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
  const rowVirtualizer = useVirtualizer({
    count: maxRows,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 38,
    overscan: 20, // 画面外の先読み行数を増やして高速スクロール時の白飛びを軽減
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  // 💥 【修正】キーボードナビゲーションのロジックを強化！
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

    // 💥 行き先を計算する関数に分離
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

    let { r, c } = step(currentRow, currentCol);

    if (r >= 0 && r < maxRows && c >= 0 && c < maxCols) {
      // まずは目的の行へスクロール！
      rowVirtualizer.scrollToIndex(r);

      // スクロールでDOMが生成されるのを待つ
      setTimeout(() => {
        let currentR = r;
        let currentC = c;
        let foundTarget: HTMLElement | null = null;

        // 💥 ここで「表示専用セル（ID列など）をスキップするループ」を復活！
        while (currentR >= 0 && currentR < maxRows && currentC >= 0 && currentC < maxCols) {
          const nextTd = document.querySelector(`td[data-row-index="${currentR}"][data-col-index="${currentC}"]`);

          if (nextTd) {
            const target = nextTd.querySelector('[data-view-mode="true"]') as HTMLElement;
            if (target) {
              foundTarget = target;
              break;
            }
          } else {
            // DOMが見つからなかった場合（スクロールが届いていない等）は再度スクロールして諦める
            rowVirtualizer.scrollToIndex(currentR);
            break;
          }

          // 表示専用セルだったら、さらに次のセルへ進める
          const nextPos = step(currentR, currentC);
          currentR = nextPos.r;
          currentC = nextPos.c;
        }

        if (foundTarget) foundTarget.focus();
      }, 10);
    }
  }, [maxRows, maxCols, rowVirtualizer]);

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
        <tbody onKeyDown={handleGridKeyDown} tabIndex={-1} className="outline-none">
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

import { createColumnHelper } from '@tanstack/react-table';
export { createColumnHelper };