/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { CompanyPageHeader, CompanyTextField } from 'common'

export const Route = createFileRoute('/employees/register')({
  component: RegisterComponent,
})

function RegisterComponent() {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <CompanyPageHeader 
        title="新規員登録" 
        description="新しい社員の情報を登録します（テスト用画面）"
      />
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <CompanyTextField 
          label="社員名" 
          placeholder="氏名を入力してください"
        />
      </div>
    </div>
  )
}
