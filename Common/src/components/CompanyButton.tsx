import React, { forwardRef } from 'react';
import { Button, type ButtonProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

// 💥 修正1: グリッド判定とEnter移動フックをインポート
import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './InGridContext';

// 💥 修正2: buttonStyles に isInGrid バリアントを追加！
const buttonStyles = tv({
  base: "inline-flex items-center justify-center outline-none transition-colors font-bold text-sm cursor-pointer select-none",
  variants: {
    variant: {
      // 青：保存や登録などメインのアクション
      primary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent disabled:bg-gray-300 disabled:text-gray-500",
      // 白：キャンセルや戻るなどサブのアクション
      secondary: "bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 border-gray-300",
      // 赤：削除など危険なアクション
      danger: "bg-red-600 text-white hover:bg-red-700 border-transparent disabled:bg-gray-300 disabled:text-gray-500",
    },
    width: {
      auto: "w-auto",
      full: "w-full",
    },
    // フォーカス時の青いリング
    isFocusVisible: {
      // 💥 修正3: z-10 relative を追加し、グリッド内でもフォーカスリングが欠けないようにする
      true: "ring-2 ring-blue-500 ring-offset-1 z-10 relative",
      false: ""
    },
    isDisabled: {
      true: "cursor-not-allowed",
      false: ""
    },
    // 💥 修正4: グリッド内外でのレイアウト切り替え
    isInGrid: {
      true: "h-full w-full rounded-none px-2 border-0", // グリッド内：枠・角丸なしでセルに完全同化
      false: "h-[38px] px-6 rounded border" // 通常時：高さ38px固定、角丸あり
    }
  },
  compoundVariants: [
    {
      isInGrid: true,
      isFocusVisible: true,
      class: "!ring-0 !ring-offset-0 z-auto" // グリッド内ではボタン自身の青枠を強制無効化し、親のdivに任せる
    }
  ],
  defaultVariants: {
    variant: "secondary",
    width: "auto",
    isInGrid: false // デフォルトは通常フォーム用
  }
});

export interface CompanyButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  width?: 'auto' | 'full';
  className?: string;
}

export const CompanyButton = React.memo(forwardRef<HTMLButtonElement, CompanyButtonProps>((props, ref) => {
  const { variant, width, className, onKeyDown, ...rest } = props;
  
  const handleEnterFocus = useEnterFocus(false);
  const isInGrid = useInGrid(); // 💥 グリッド判定を取得

  // 💥 追加: 直前のキー入力を記憶して onPress で判定する
  const lastKeyRef = React.useRef<string | null>(null);

  // Enterキーの挙動をハックして次の項目へ移動
  const handleKeyDown: NonNullable<ButtonProps['onKeyDown']> = (e) => {
    lastKeyRef.current = e.key;
    if (e.key === 'Enter') {
      e.preventDefault();
      // そのまま、スパンッ！と次のコントロールへフォーカスを飛ばす
      handleEnterFocus(e as any);
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleKeyUp: NonNullable<ButtonProps['onKeyUp']> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    if (rest.onKeyUp) rest.onKeyUp(e);
  };

  const handlePress: NonNullable<ButtonProps['onPress']> = (e) => {
    // 💥 キーボード操作かつ Enter キーが由来の onPress は完全に弾く！
    if (e.pointerType === 'keyboard' && lastKeyRef.current === 'Enter') {
      return;
    }
    if (rest.onPress) rest.onPress(e);
  };

  return (
    <Button
      ref={ref}
      {...rest}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPress={handlePress}
      className={({ isFocusVisible, isDisabled }) => 
        // 💥 修正5: buttonStyles に isInGrid を渡す
        buttonStyles({ variant, width, isFocusVisible, isDisabled, isInGrid }) + (className ? ` ${className}` : '')
      }
    >
      {props.children}
    </Button>
  );
}));

CompanyButton.displayName = "CompanyButton";