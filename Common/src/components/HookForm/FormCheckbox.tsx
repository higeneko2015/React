import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyCheckbox } from '../CompanyCheckbox';

// 型のインポートは一番下に！
import type { CompanyCheckboxProps } from '../CompanyCheckbox';

/**
 * react-hook-form 連携用のチェックボックスコンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormCheckboxProps extends CompanyCheckboxProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

export const FormCheckbox = React.memo(forwardRef<HTMLLabelElement, FormCheckboxProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyCheckbox
            ref={ref}
            // 💡 RHFは単一の真偽値を扱う場合 value に true/false が入るため、
            // それを isSelected プロパティにマッピングします！
            isSelected={!!value}
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

FormCheckbox.displayName = 'FormCheckbox';