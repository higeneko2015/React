import { forwardRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CompanyTextField } from '../CompanyTextField';
import type { CompanyTextFieldProps } from '../CompanyTextField';

// ✨ Ai-chan's Special TextField Wrapper ✨
// 英行さんが作ったCompanyTextFieldの素晴らしさはそのままに、
// React Hook Formの力を宿した最強のコンポーネントですっ💕
export type FormTextFieldProps = CompanyTextFieldProps & {
  // これが超重要！ RHFで値を管理するための「キーの名前」ですよっ😤
  name: string; 
};

export const FormTextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
  ({ name, ...props }, ref) => {
    // 💡 親の <FormProvider> からフォームの管理権限をコッソリもらってきます！
    const { control } = useFormContext();

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
          <CompanyTextField
            // Refのバケツリレーも忘れずにっ！
            ref={ref}
            
            // RHF 管理下の「値」と「変更イベント」を注入っ💉
            value={value}
            onChange={onChange}
            
            // エラーがあれば既存の設定を上書きして赤くしちゃいます！🚨
            isInvalid={invalid || props.isInvalid}
            errorMessage={error?.message || props.errorMessage}
            
            // 残りの設定（maxLengthとかwidthとか）は全部そのまま流し込みます！えいっ！🌟
            {...props}
          />
        )}
      />
    );
  }
);

FormTextField.displayName = 'FormTextField';
