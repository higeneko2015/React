import {
  FormProvider,
  FormTextField,
  FormNumberField,
  FormComboBox,
  FormCheckbox,
  FormRadioGroup,
  FormDateField,
  FormTimeField,
  FormPostalField,
  FormPhoneField,
  CompanyButton,
  CompanyTabs,
} from 'common';
import type { UseFormReturn } from 'common';
import type { User } from '../../api/users';
import type { FormDataState } from './useUserPage';

interface UserEditFormProps {
  selectedRow: User;
  methods: UseFormReturn<FormDataState>;
  onSave: () => void;
  deptOptions: { label: string; value: string }[];
}

export function UserEditForm({ selectedRow, methods, onSave, deptOptions }: UserEditFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-teal-500 overflow-hidden border-2 max-w-[1400px] mx-auto">
      <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">社員情報 詳細編集 ({selectedRow.name})</h1>
        <CompanyButton
          onPress={onSave}
          className="bg-white text-teal-600 font-bold hover:bg-gray-100 px-4 py-1.5 rounded"
        >
          更新を保存
        </CompanyButton>
      </div>

      <FormProvider {...methods}>
        <form className="p-6" onSubmit={(e) => e.preventDefault()}>
          <CompanyTabs defaultSelectedKey="basic">
            <CompanyTabs.List className="mb-5">
              <CompanyTabs.Tab id="basic">基本情報</CompanyTabs.Tab>
              <CompanyTabs.Tab id="work">勤務情報</CompanyTabs.Tab>
            </CompanyTabs.List>

            {/* 基本情報タブ */}
            <CompanyTabs.Panel id="basic" className="space-y-5">
              <FormTextField label="氏名" name="name" />
              <div className="grid grid-cols-2 gap-4">
                <FormPostalField label="郵便番号" name="postalCode" />
                <FormPhoneField label="電話番号" name="phoneNumber" />
              </div>
              <FormDateField label="生年月日" name="birthDate" />
            </CompanyTabs.Panel>

            {/* 勤務情報タブ */}
            <CompanyTabs.Panel id="work" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormTimeField label="始業時刻" name="startTime" />
                <FormNumberField label="基本給" name="salary" />
              </div>
              <FormComboBox label="配属部署" options={deptOptions} name="department" />
              <FormRadioGroup label="雇用形態" name="employmentType">
                <FormRadioGroup.Radio value="full_time">正社員</FormRadioGroup.Radio>
                <FormRadioGroup.Radio value="contract">契約社員</FormRadioGroup.Radio>
              </FormRadioGroup>
              <FormCheckbox label="現在就業中" name="isActive" />
            </CompanyTabs.Panel>
          </CompanyTabs>
        </form>
      </FormProvider>
    </div>
  );
}
