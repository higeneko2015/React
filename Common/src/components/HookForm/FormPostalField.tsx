import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyPostalField } from '../CompanyPostalField';

// 型のインポートは一番下に！
import type { CompanyPostalFieldProps } from '../CompanyPostalField';

/**
 * react-hook-form 連携用の郵便番号入力コンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormPostalFieldProps extends CompanyPostalFieldProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormPostalField = React.memo(forwardRef<HTMLInputElement, FormPostalFieldProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyPostalField
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

FormPostalField.displayName = 'FormPostalField';