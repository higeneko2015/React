import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyNumberField } from '../CompanyNumberField';
import type { CompanyNumberFieldProps } from '../CompanyNumberField';

// ✨ Ai-chan's Special NumberField Wrapper ✨
export type FormNumberFieldProps = CompanyNumberFieldProps & { name: string; };

export const FormNumberField = forwardRef<HTMLInputElement, FormNumberFieldProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormNumberField.displayName = 'FormNumberField';
