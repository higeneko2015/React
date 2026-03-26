import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyCheckbox } from '../CompanyCheckbox';
import type { CompanyCheckboxProps } from '../CompanyCheckbox';

// ✨ Ai-chan's Special Checkbox Wrapper ✨
export type FormCheckboxProps = CompanyCheckboxProps & { name: string; };

export const FormCheckbox = forwardRef<HTMLLabelElement, FormCheckboxProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
