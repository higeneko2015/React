/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { CompanyPageHeader, CompanyTextField } from 'common'

export const Route = createFileRoute('/employees/departments')({
  component: DepartmentsComponent,
})

function DepartmentsComponent() {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <CompanyPageHeader 
        title="部署管理" 
        description="部署情報の追加・編集を行います（テスト用画面）"
      />
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <CompanyTextField 
          label="部署名" 
          placeholder="新しい部署名を入力してください"
        />
      </div>
    </div>
  )
}
