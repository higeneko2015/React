/**
 * 社内共通コンポーネントライブラリ 公開エントリポイント
 * * UIコンポーネント、レイアウト、フォーム連携、API基盤、および
 * 主要な外部ライブラリ（RHF, Zod, TanStack Query）へのアクセスを提供します。
 */

// --- UI Components ---
export { CompanyTextField } from './components/CompanyTextField';
export { CompanyNumberField } from './components/CompanyNumberField';
export { CompanyDateField } from './components/CompanyDateField';
export { CompanyTimeField } from './components/CompanyTimeField';
export { CompanyCheckbox } from './components/CompanyCheckbox';
export { CompanyRadioGroup } from './components/CompanyRadioGroup';
export { CompanyDisplayField } from './components/CompanyDisplayField';
export { CompanyComboBox } from './components/CompanyComboBox';
export { CompanyPostalField } from './components/CompanyPostalField';
export { CompanyPhoneField } from './components/CompanyPhoneField';
export { CompanyButton } from './components/CompanyButton';
export { CompanySpinner } from './components/CompanySpinner';
export { CompanyLoadingOverlay } from './components/CompanyLoadingOverlay';
export { CompanyTabs } from './components/CompanyTabs';
export { CompanyDataGrid, EditableCell } from './components/CompanyDataGrid';

// --- Layout Components ---
export { CompanyAppShell } from './components/layout/CompanyAppShell';
export { CompanyHeader } from './components/layout/CompanyHeader';
export { CompanySidebar } from './components/layout/CompanySidebar';
export { CompanyPageHeader } from './components/layout/CompanyPageHeader';

// --- Providers & Hooks ---
export { MessageProvider } from './providers/MessageProvider';
export { DialogProvider } from './providers/DialogProvider';
export { useMessage } from './hooks/useMessage';
export { useDialog } from './hooks/useDialog';

// --- React Hook Form & Zod ---
/** フォームバリデーションと状態管理のための再エクスポート */
export * from 'react-hook-form';
export * as z from 'zod';
export { zodResolver } from '@hookform/resolvers/zod';

// --- Hook Form Wrappers ---
export * from './components/HookForm/FormTextField';
export * from './components/HookForm/FormNumberField';
export * from './components/HookForm/FormDateField';
export * from './components/HookForm/FormTimeField';
export * from './components/HookForm/FormCheckbox';
export * from './components/HookForm/FormRadioGroup';
export * from './components/HookForm/FormComboBox';
export * from './components/HookForm/FormPostalField';
export * from './components/HookForm/FormPhoneField';

// --- API & Infrastructure ---
export * as ApiClient from './api';

// --- TanStack Query ---
/** データフェッチングライブラリの再エクスポート（疎結合維持のため） */
export {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from '@tanstack/react-query';