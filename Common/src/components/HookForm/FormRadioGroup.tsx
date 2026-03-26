import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyRadioGroup } from '../CompanyRadioGroup';
import type { CompanyRadioGroupProps } from '../CompanyRadioGroup';

// ✨ Ai-chan's Special RadioGroup Wrapper ✨
export type FormRadioGroupProps = CompanyRadioGroupProps & { name: string; };

const FormRadioGroupBase = forwardRef<HTMLDivElement, FormRadioGroupProps>(
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
            errorMessage={error?.message || props.errorMessage}
            {...props}
          />
        )}
      />
    );
  }
);

export const FormRadioGroup = Object.assign(FormRadioGroupBase, {
  Radio: CompanyRadioGroup.Radio
});

FormRadioGroup.displayName = 'FormRadioGroup';
