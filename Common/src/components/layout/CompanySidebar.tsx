import React, { useState, useEffect } from 'react';
import { useLayout } from './LayoutContext';

export type MenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

export interface CompanySidebarProps {
  items: MenuItem[];
  currentId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({
  items,
  currentId,
  onSelect,
  className = '',
}) => {
  // グローバルなレイアウト状態から取得
  const { isSidebarCollapsed: isCollapsed } = useLayout();

  // 階層が開いている状態を保持
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 初期表示時：currentId を含む親階層をすべて自動展開するロジック
  useEffect(() => {
    const parentPath = new Set<string>();

    const findSelectedPath = (menuList: MenuItem[], path: string[]): boolean => {
      for (const item of menuList) {
        if (item.id === currentId) {
          path.forEach(p => parentPath.add(p));
          return true;
        }
        if (item.children) {
          if (findSelectedPath(item.children, [...path, item.id])) {
            return true;
          }
        }
      }
      return false;
    };

    findSelectedPath(items, []);
    if (parentPath.size > 0) {
      setExpandedIds(prev => new Set([...prev, ...parentPath]));
    }
  }, [items, currentId]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 再帰的にメニューを描画する関数
  const renderItems = (menuList: MenuItem[], depth: number = 0) => {
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
              className={`
                flex flex-row items-center w-full pr-4 py-2 text-sm transition-all duration-150 text-left outline-none
                ${isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-r-4 border-transparent'
                }
                focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500
              `}
              style={{ paddingLeft }}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-current={isSelected ? 'page' : undefined}
            >
              {/* アイコン */}
              {item.icon && (
                <span className={`flex-shrink-0 text-base mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
              )}

              {/* ラベル */}
              <span className="flex-1 truncate leading-5 select-none">{item.label}</span>
              {hasChildren && (
                <span className={`text-[10px] text-gray-400 transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              )}
            </button>
          </div>

          {/* 子階層の描画（アコーディオン） */}
          {hasChildren && (
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                {renderItems(item.children!, depth + 1)}
              </div>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <aside
      className={`flex-shrink-0 h-full bg-white flex flex-col z-10 overflow-x-hidden overflow-y-auto
        transition-[width,opacity] duration-200 ease-in-out
        ${isCollapsed ? 'w-0 opacity-0 border-r-0' : 'w-64 opacity-100 border-r border-gray-200'}
        ${className}
      `}
    >
      {/* 
        asideがw-0になっても、中のnavはw-64(16rem)を維持することで、
        縮小アニメーション中にテキストが改行されて崩れるのを防ぐ 
      */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 w-64 min-w-[16rem]" aria-label="Sidebar Navigation">
        {renderItems(items)}
      </nav>
    </aside>
  );
};

CompanySidebar.displayName = 'CompanySidebar';
