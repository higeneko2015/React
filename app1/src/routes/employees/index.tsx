import { createFileRoute } from '@tanstack/react-router'
import {
  CompanyPageHeader,
  CompanyButton,
  MessageProvider,
  useDialog,
  ApiClient,
} from 'common'
import { useUserPage } from '../../features/employees/useUserPage'
import { useUserColumns } from '../../features/employees/userColumns'
import { UserSearchForm } from '../../features/employees/UserSearchForm'
import { UserDataGrid } from '../../features/employees/UserDataGrid'
import { UserEditForm } from '../../features/employees/UserEditForm'

export const Route = createFileRoute('/employees/')({
  component: EmployeesPageComponent,
})

function EmployeesPageComponent() {
  const dialog = useDialog();
  const { state, actions, methods } = useUserPage();

  const { columns, DEPT_OPTIONS } = useUserColumns({
    updateGridData: actions.updateGridData,
    handleEditClick: actions.handleEditClick,
  });

  const handleSave = methods.handleSubmit(async (data) => {
    const isOk = await dialog.confirm({
      title: '更新内容の確認',
      message: `${data.name} さんの情報を更新してよろしいですか？`,
      confirmLabel: '更新する',
      cancelLabel: '戻る',
    });

    if (isOk) {
      actions.setIsProcessing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await dialog.alert({
          title: '更新完了',
          message: `社員情報の更新が完了しました！`,
          variant: 'info'
        });
      } finally {
        actions.setIsProcessing(false);
      }
    }
  });

  return (
    <MessageProvider messages={state.messages}>
      <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
        <CompanyPageHeader
          title="社員情報検索"
          description="システムに登録されている全社員の情報を検索・編集できます"
        >
          <CompanyButton variant="primary">
            ＋ 新規社員登録
          </CompanyButton>
          <CompanyButton variant="secondary">
            📄 CSV出力
          </CompanyButton>
        </CompanyPageHeader>

        {/* 1. 検索エリア */}
        <UserSearchForm
          searchDraft={state.searchDraft}
          onSearchDraftChange={actions.setSearchDraft}
          onSearch={actions.handleExecuteSearch}
        />

        {/* 2. グリッドエリア */}
        <UserDataGrid
          gridData={state.gridData}
          columns={columns}
          isLoading={state.isLoading}
          isProcessing={state.isProcessing}
        />

        {/* 3. 詳細編集エリア */}
        {state.selectedRow && (
          <UserEditForm
            selectedRow={state.selectedRow}
            methods={methods}
            onSave={handleSave}
            deptOptions={DEPT_OPTIONS}
          />
        )}

        {/* デバッグ用パネル */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 p-4 bg-white/90 backdrop-blur-md border border-red-200 rounded-lg shadow-2xl z-[100] border-t-4 border-t-red-500">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
            <span className="animate-pulse">🚨</span> Error Test Panel
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => ApiClient.apiClient.get('/test/error/500')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-all active:scale-95 text-left"
            >
              🔥 Simulate 500 Error
            </button>
            <button
              onClick={() => ApiClient.apiClient.get('/test/error/401')}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 transition-all active:scale-95 text-left"
            >
              🔑 Simulate 401 Error
            </button>
            <button
              onClick={() => ApiClient.apiClient.get('/test/error/network')}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-all active:scale-95 text-left"
            >
              🌐 Simulate Network Error
            </button>
          </div>
          <p className="text-[9px] text-gray-400 mt-1 italic text-center">Click to test Common's interceptor</p>
        </div>

      </div>
    </MessageProvider>
  )
}
