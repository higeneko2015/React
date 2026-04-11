import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // とりあえず今回は自動的に社員情報検索へ飛ばす
    navigate({ to: '/employees', replace: true });
  }, [navigate]);

  return (
    <div className="p-8">
      <h1>ダッシュボードを読み込み中...</h1>
    </div>
  )
}
