import { CompanyLoadingOverlay, CompanyDataGrid, useMessage } from 'common';
import type { User } from '../../api/users';

interface UserDataGridProps {
  gridData: User[];
  columns: any[];
  isLoading: boolean;
  isProcessing: boolean;
}

export function UserDataGrid({ gridData, columns, isLoading, isProcessing }: UserDataGridProps) {
  const { t } = useMessage();

  return (
    <div className="relative space-y-8 max-w-[1400px] mx-auto w-full min-h-[400px]">
      <CompanyLoadingOverlay 
        isLoading={isLoading || isProcessing} 
        message={isProcessing ? t('I0002') || "データを保存しています..." : t('I0001') || "社員情報を検索しています..."} 
        isInsideContainer={false} 
      />

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-700 px-6 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">検索結果（直接編集可能）</h2>
        </div>
        <div className="p-1 bg-gray-100 overflow-x-auto min-h-[300px]">
          <CompanyDataGrid data={gridData} columns={columns} />
        </div>
      </div>
    </div>
  );
}
