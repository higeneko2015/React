import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyTextField } from '../CompanyTextField';

// 型のインポートはルール 5 に従って一番下に！
import type { CompanyTextFieldProps } from '../CompanyTextField';

/**
 * react-hook-form 連携用のテキスト入力コンポーネント。
 * 英行さんが作った CompanyTextField を React Hook Form の Controller でラップし、
 * FormContext から自動で状態をバインドします。
 */
export interface FormTextFieldProps extends CompanyTextFieldProps {
  /** RHFで値を管理するためのフィールド名（キー） */
  name: string;
}

export const FormTextField = React.memo(forwardRef<HTMLInputElement, FormTextFieldProps>(
  ({ name, ...props }, ref) => {
    // 親の <FormProvider> から control を取得
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyTextField
            ref={ref}
            // RHF 管理下の値とイベントを接続
            value={value}
            onChange={onChange}
            // バリデーションエラーがあれば優先的に表示
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message ?? props.errorMessage}
            // その他の Props はそのまま流し込み
            {...props}
          />
        )}
      />
    );
  }
));

FormTextField.displayName = 'FormTextField';