import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyDateField } from '../CompanyDateField';
import type { CompanyDateFieldProps } from '../CompanyDateField';

// ✨ Ai-chan's Special DateField Wrapper ✨
export type FormDateFieldProps = CompanyDateFieldProps & { name: string; };

export const FormDateField = forwardRef<HTMLInputElement, FormDateFieldProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormDateField.displayName = 'FormDateField';
