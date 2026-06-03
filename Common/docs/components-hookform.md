# React Hook Form 連携ラッパー 仕様書

`Common/src/components/HookForm/` 配下のファイルの詳細仕様です。

---

## 概要

各UIコンポーネントを React Hook Form の `Controller` でラップしたコンポーネント群です。
`<FormProvider>` 配下で使用することで、バリデーション状態の自動バインドとエラーメッセージの自動表示が行われます。

### 共通の動作

すべての `Form〇〇` コンポーネントは以下の共通ロジックを持ちます:

1. `useFormContext()` から `control` を取得
2. `Controller` の `render` 内で、対応する `Company〇〇` コンポーネントに `value`, `onChange`, `isInvalid`, `errorMessage` をバインド
3. RHF 側のバリデーションエラーがあれば、Props で渡された `isInvalid` / `errorMessage` よりも優先して表示

### 共通の追加 Props

すべての `Form〇〇` コンポーネントは、対応する `Company〇〇Props` を継承し、以下のプロパティが追加されます:

| プロパティ | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | `string` | ✅ | RHFで値を管理するためのフィールド名（キー） |

---

## コンポーネント一覧

| ファイル | ラップ対象 | ref 型 |
|---|---|---|
| `FormTextField.tsx` | `CompanyTextField` | `HTMLInputElement` |
| `FormNumberField.tsx` | `CompanyNumberField` | `HTMLInputElement` |
| `FormDateField.tsx` | `CompanyDateField` | `HTMLInputElement` |
| `FormTimeField.tsx` | `CompanyTimeField` | `HTMLInputElement` |
| `FormCheckbox.tsx` | `CompanyCheckbox` | `HTMLLabelElement` |
| `FormRadioGroup.tsx` | `CompanyRadioGroup` | `HTMLDivElement` |
| `FormComboBox.tsx` | `CompanyComboBox` | `HTMLInputElement` |
| `FormPostalField.tsx` | `CompanyPostalField` | `HTMLInputElement` |
| `FormPhoneField.tsx` | `CompanyPhoneField` | `HTMLInputElement` |

---

## 使用例

```tsx
import { useForm, FormProvider } from 'common';
import { FormTextField, FormNumberField, FormDateField } from 'common';

function EmployeeForm() {
  const methods = useForm({
    defaultValues: { name: '', age: null, birthDate: '' }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormTextField name="name" label="氏名" />
        <FormNumberField name="age" label="年齢" />
        <FormDateField name="birthDate" label="生年月日" />
      </form>
    </FormProvider>
  );
}
```
