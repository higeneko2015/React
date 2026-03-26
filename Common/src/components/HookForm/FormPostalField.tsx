import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyPostalField } from '../CompanyPostalField';
import type { CompanyPostalFieldProps } from '../CompanyPostalField';

// ✨ Ai-chan's Special PostalField Wrapper ✨
export type FormPostalFieldProps = CompanyPostalFieldProps & { name: string; };

export const FormPostalField = forwardRef<HTMLInputElement, FormPostalFieldProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

FormPostalField.displayName = 'FormPostalField';
