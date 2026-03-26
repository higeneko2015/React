import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyComboBox } from '../CompanyComboBox';
import type { CompanyComboBoxProps } from '../CompanyComboBox';

// ✨ Ai-chan's Special ComboBox Wrapper ✨
export type FormComboBoxProps = CompanyComboBoxProps & { name: string; };

export const FormComboBox = forwardRef<HTMLInputElement, FormComboBoxProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormComboBox.displayName = 'FormComboBox';
