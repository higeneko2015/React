import React, { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { CompanyRadioGroup } from '../CompanyRadioGroup';

// 型のインポートはルール 5 に従って一番下に！
import type { CompanyRadioGroupProps } from '../CompanyRadioGroup';

/**
 * react-hook-form 連携用のラジオボタングループコンポーネント。
 * FormContext から control を取得し、自動で状態をバインドします。
 */
export interface FormRadioGroupProps extends CompanyRadioGroupProps {
  /** RHFで管理するためのフィールド名 */
  name: string;
}

const FormRadioGroupBase = React.memo(forwardRef<HTMLDivElement, FormRadioGroupProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyRadioGroup
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

const FormRadioGroupComponent = FormRadioGroupBase as typeof FormRadioGroupBase & {
  Radio: typeof CompanyRadioGroup.Radio;
};
FormRadioGroupComponent.Radio = CompanyRadioGroup.Radio;

export { FormRadioGroupComponent as FormRadioGroup };
FormRadioGroupComponent.displayName = 'FormRadioGroup';