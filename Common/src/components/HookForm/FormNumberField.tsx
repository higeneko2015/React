import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyNumberField } from '../CompanyNumberField';

// 型のインポートは一番下に！
import type { CompanyNumberFieldProps } from '../CompanyNumberField';

/**
 * react-hook-form 連携用の数値入力コンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormNumberFieldProps extends CompanyNumberFieldProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormNumberField = React.memo(forwardRef<HTMLInputElement, FormNumberFieldProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyNumberField
            ref={ref}
            value={value ?? null}
            onChange={(val) => {
              onChange(Number.isNaN(val) ? null : val);
            }}
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message ?? props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
));

FormNumberField.displayName = 'FormNumberField';