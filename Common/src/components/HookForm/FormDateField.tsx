import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyDateField } from '../CompanyDateField';

// 型のインポートは一番下に！
import type { CompanyDateFieldProps } from '../CompanyDateField';

/**
 * react-hook-form 連携用の日付入力コンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormDateFieldProps extends CompanyDateFieldProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormDateField = React.memo(forwardRef<HTMLInputElement, FormDateFieldProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyDateField
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

FormDateField.displayName = 'FormDateField';