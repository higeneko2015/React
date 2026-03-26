import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyPhoneField } from '../CompanyPhoneField';
import type { CompanyPhoneFieldProps } from '../CompanyPhoneField';

// ✨ Ai-chan's Special PhoneField Wrapper ✨
export type FormPhoneFieldProps = CompanyPhoneFieldProps & { name: string; };

export const FormPhoneField = forwardRef<HTMLInputElement, FormPhoneFieldProps>(
  ({ name, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyPhoneField
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

FormPhoneField.displayName = 'FormPhoneField';
