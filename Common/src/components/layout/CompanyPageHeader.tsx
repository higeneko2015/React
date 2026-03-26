import React from 'react';
import type { ReactNode } from 'react';

export interface CompanyPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // 右側のアクションボタン群（新規作成など）
  className?: string;
}

export const CompanyPageHeader: React.FC<CompanyPageHeaderProps> = ({ title, description, children, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-200 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 items-center">
          {children}
        </div>
      )}
    </div>
  );
};

CompanyPageHeader.displayName = 'CompanyPageHeader';
