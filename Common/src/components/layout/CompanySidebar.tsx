import React, { useState, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useLayout } from './useLayout';

/**
 * サイドバーのメニュー項目定義。
 * 子階層（children）を持つことで無限にネスト可能です。
 */
export type MenuItem = {
  /** 項目の一意識別子 */
  id: string;
  /** 表示テキスト */
  label: string;
  /** 表示アイコン（ReactNode） */
  icon?: React.ReactNode;
  /** 子階層のメニューリスト */
  children?: MenuItem[];
};

/**
 * 社内システム用共通サイドバーコンポーネント。
 * 再帰的な階層構造、アコーディオン開閉、現在の選択項目の自動展開に対応しています。
 */
export interface CompanySidebarProps {
  /** 表示する全メニュー項目 */
  items: MenuItem[];
  /** 現在アクティブな（選択されている）項目のID */
  currentId: string;
  /** 項目選択時のコールバック */
  onSelect: (id: string) => void;
  /** 追加のスタイルクラス */
  className?: string;
}

export const CompanySidebar = React.memo(({
  items,
  currentId,
  onSelect,
  className,
}: CompanySidebarProps) => {
  // グローバルなレイアウト状態から取得
  const { isSidebarCollapsed: isCollapsed } = useLayout();

  // 指定したIDの親階層をすべて特定するユーティリティ
  const getParentPath = useCallback((targetId: string, menuItems: MenuItem[]) => {
    const pathSet = new Set<string>();
    const find = (list: MenuItem[], currentPath: string[]): boolean => {
      for (const item of list) {
        if (item.id === targetId) {
          currentPath.forEach(p => pathSet.add(p));
          return true;
        }
        if (item.children && find(item.children, [...currentPath, item.id])) {
          return true;
        }
      }
      return false;
    };
    find(menuItems, []);
    return pathSet;
  }, []);

  const [prevCurrentId, setPrevCurrentId] = useState(currentId);
  // 階層が開いている状態を保持
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getParentPath(currentId, items));

  // currentId が変更された場合に同期
  if (currentId !== prevCurrentId) {
    setPrevCurrentId(currentId);
    const parentPath = getParentPath(currentId, items);
    if (parentPath.size > 0) {
      setExpandedIds(prev => new Set([...prev, ...parentPath]));
    }
  }

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 再帰的にメニューを描画する内部関数（useCallbackで安定化）
  const renderItems = useCallback((menuList: MenuItem[], depth: number = 0) => {
    return menuList.map((item) => {
      const isSelected = item.id === currentId;
      const hasChildren = !!item.children && item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);
      const paddingLeft = `${1 + depth * 1.25}rem`;

      return (
        <React.Fragment key={item.id}>
          <div className="flex flex-col">
            <button
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(item.id);
                } else {
                  onSelect(item.id);
                }
              }}
              className={twMerge(
                'flex flex-row items-center w-full pr-4 py-2 text-sm transition-all duration-150 text-left outline-none border-r-4',
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent',
                'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500'
              )}
              style={{ paddingLeft }}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-current={isSelected ? 'page' : undefined}
            >
              {item.icon && (
                <span className={twMerge('flex-shrink-0 text-base mr-3', isSelected ? 'text-blue-600' : 'text-gray-400')}>
                  {item.icon}
                </span>
              )}
              <span className="flex-1 truncate leading-5 select-none">{item.label}</span>
              {hasChildren && (
                <span className={twMerge('text-[10px] text-gray-400 transition-transform duration-200 ml-2', isExpanded && 'rotate-180')}>
                  ▼
                </span>
              )}
            </button>
          </div>

          {hasChildren && (
            <div
              className={twMerge(
                'grid transition-[grid-template-rows] duration-200 ease-in-out',
                isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                {renderItems(item.children!, depth + 1)}
              </div>
            </div>
          )}
        </React.Fragment>
      );
    });
  }, [currentId, expandedIds, onSelect, toggleExpand]);

  return (
    <aside
      className={twMerge(
        'flex-shrink-0 h-full bg-white flex flex-col z-10 overflow-x-hidden overflow-y-auto transition-[width,opacity] duration-200 ease-in-out',
        isCollapsed ? 'w-0 opacity-0 border-r-0' : 'w-64 opacity-100 border-r border-gray-200',
        className
      )}
    >
      <nav className="flex-1 py-4 flex flex-col gap-0.5 w-64 min-w-[16rem]" aria-label="Sidebar Navigation">
        {renderItems(items)}
      </nav>
    </aside>
  );
});

CompanySidebar.displayName = 'CompanySidebar';