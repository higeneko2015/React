import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyTimeField } from '../CompanyTimeField';
import type { CompanyTimeFieldProps } from '../CompanyTimeField';

// ✨ Ai-chan's Special TimeField Wrapper ✨
export type FormTimeFieldProps = CompanyTimeFieldProps & { name: string; };

export const FormTimeField = forwardRef<HTMLInputElement, FormTimeFieldProps>(
  ({ name, ...props }, ref) => {
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
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormTimeField.displayName = 'FormTimeField';
