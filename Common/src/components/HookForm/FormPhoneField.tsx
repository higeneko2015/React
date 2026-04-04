import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyPhoneField } from '../CompanyPhoneField';

// 型のインポートは一番下に！
import type { CompanyPhoneFieldProps } from '../CompanyPhoneField';

/**
 * react-hook-form 連携用の電話番号入力コンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormPhoneFieldProps extends CompanyPhoneFieldProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormPhoneField = React.memo(forwardRef<HTMLInputElement, FormPhoneFieldProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyPhoneField
            ref={ref}
            value={value}
            onChange={onChange}
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message ?? props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
));

FormPhoneField.displayName = 'FormPhoneField';