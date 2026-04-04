import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyComboBox } from '../CompanyComboBox';

// 型のインポートは一番下に！
import type { CompanyComboBoxProps } from '../CompanyComboBox';

/**
 * react-hook-form 連携用のコンボボックスコンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormComboBoxProps extends CompanyComboBoxProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormComboBox = React.memo(forwardRef<HTMLInputElement, FormComboBoxProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyComboBox
            ref={ref}
            value={value ?? null}
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

FormComboBox.displayName = 'FormComboBox';