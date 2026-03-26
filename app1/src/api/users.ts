import { ApiClient } from 'common';

export type User = {
  id: number;
  name: string;
  salary: number | null;
  department: string;
  isActive: boolean;
  employmentType: string;
  birthDate: string | null;
  startTime: string | null;
  postalCode: string;
  phoneNumber: string;
};

export interface SearchUsersParams {
  name?: string;
  phone?: string;
}

// 共通基盤（CommonのAxios）を用いてデータをフェッチする（業務ロジック）
export const fetchUsers = async (params?: SearchUsersParams): Promise<User[]> => {
  const { data } = await ApiClient.apiClient.get<User[]>('/users', { params });
  return data;
};

// コンポーネントから呼び出される検索用カスタムフック（業務ロジック）
export const useSearchUsers = (params?: SearchUsersParams, enabled: boolean = true) => {
  return ApiClient.useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    enabled,
  });
};
