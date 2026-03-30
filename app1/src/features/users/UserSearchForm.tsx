import { CompanyTextField, CompanyButton } from 'common';

interface UserSearchFormProps {
  searchDraft: { name: string; phone: string };
  onSearchDraftChange: (val: { name: string; phone: string }) => void;
  onSearch: () => void;
}

export function UserSearchForm({ searchDraft, onSearchDraftChange, onSearch }: UserSearchFormProps) {
  return (
    <div className="max-w-[1400px] mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row items-end gap-4">
        <div className="w-64">
          <CompanyTextField
            label="氏名（前方一致）"
            value={searchDraft.name}
            onChange={(val) => onSearchDraftChange({ ...searchDraft, name: val })}
          />
        </div>
        <div className="w-64">
          <CompanyTextField
            label="電話番号（あいまい）"
            value={searchDraft.phone}
            onChange={(val) => onSearchDraftChange({ ...searchDraft, phone: val })}
          />
        </div>
        <CompanyButton
          variant="primary"
          onPress={onSearch}
          className="mb-1 shrink-0"
        >
          検索を実行する
        </CompanyButton>
      </div>
    </div>
  );
}
