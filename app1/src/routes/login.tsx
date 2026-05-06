import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CompanyButton, FormTextField } from 'common';
import { useAppAuth } from '../auth/AppAuthProvider';

// ログイン画面は「すでにログイン済み」ならアクセスできないようにする（ダッシュボードへ）
export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});

const loginSchema = z.object({
  id: z.string().min(1, 'ユーザーIDを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});
type LoginFormInputs = z.infer<typeof loginSchema>;

function LoginPage() {
  const { login } = useAppAuth();
  const navigate = useNavigate();

  const methods = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: '', password: '' },
  });
  const { handleSubmit, setError, formState: { isSubmitting } } = methods;

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.id, data.password);
      // ログイン成功したらダッシュボードへ
      navigate({ to: '/' });
    } catch (err: any) {
      setError('root', { type: 'manual', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">人事総合管理システム</h1>
          <p className="text-gray-500 mt-2">ログイン</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormTextField
              name="id"
              label="ユーザーID"
              placeholder="admin と入力"
            />

            <FormTextField
              name="password"
              label="パスワード"
              type="password"
              placeholder="password と入力"
            />

            <CompanyButton
              type="submit"
              variant="primary"
              width="full"
              isDisabled={isSubmitting}
              className="h-12 text-base mt-4"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </CompanyButton>
          </form>
        </FormProvider>

        <div className="mt-6 text-center text-sm text-gray-500">
          ※ テスト環境用: ID <code>admin</code> / Pass <code>password</code>
        </div>
      </div>
    </div>
  );
}
