import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyTimeField } from '../CompanyTimeField';

// 型のインポートはルール 5 に従って一番下に！
import type { CompanyTimeFieldProps } from '../CompanyTimeField';

/**
 * react-hook-form 連携用の時刻入力コンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormTimeFieldProps extends CompanyTimeFieldProps {
  /** RHFで値を管理するためのフィールド名 */
  name: string;
}

export const FormTimeField = React.memo(forwardRef<HTMLInputElement, FormTimeFieldProps>(
  ({ name, ...props }, ref) => {
    // 親の <FormProvider> から control を取得
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyTimeField
            ref={ref}
            value={value}
            onChange={onChange}
            // バリデーションエラーを優先的に表示
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message ?? props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
));

FormTimeField.displayName = 'FormTimeField';