import React, { forwardRef, useCallback, useRef } from 'react';
import { Button } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

import { useEnterFocus } from '../hooks/useEnterFocus';
import { useInGrid } from './useInGrid';

import type { ButtonProps } from 'react-aria-components';

const buttonStyles = tv({
  base: "inline-flex items-center justify-center outline-none transition-colors font-bold text-sm cursor-pointer select-none",
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 border-transparent disabled:bg-gray-300 disabled:text-gray-500",
      secondary: "bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 border-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700 border-transparent disabled:bg-gray-300 disabled:text-gray-500",
    },
    width: {
      auto: "w-auto",
      full: "w-full",
    },
    isFocusVisible: {
      true: "ring-2 ring-blue-500 ring-offset-1 z-10 relative",
      false: ""
    },
    isDisabled: {
      true: "cursor-not-allowed",
      false: ""
    },
    isInGrid: {
      true: "h-full w-full rounded-none px-2 border-0",
      false: "h-[32px] px-4 rounded border text-[13px]"
    }
  },
  defaultVariants: {
    variant: "secondary",
    width: "auto",
    isInGrid: false
  }
});

export interface CompanyButtonProps extends ButtonProps {
  /** ボタンの視覚的な種類（デフォルト: 'secondary'） */
  variant?: 'primary' | 'secondary' | 'danger';
  /** ボタンの幅（デフォルト: 'auto'） */
  width?: 'auto' | 'full';
  /** 追加のTailwindクラス名（親からのスタイル上書き用） */
  className?: string;
}

/**
 * 社内システム用共通ボタンコンポーネント
 * フォーム内やデータグリッド内でのキーボード操作（Enterでのフォーカス移動など）に最適化されています。
 */
export const CompanyButton = React.memo(forwardRef<HTMLButtonElement, CompanyButtonProps>((props, ref) => {
  const { variant, width, className, onKeyDown, onKeyUp, onPress, ...rest } = props;

  const handleEnterFocus = useEnterFocus(false);
  const isInGrid = useInGrid();

  // 直前のキー入力を記憶して onPress で判定する
  const lastKeyRef = useRef<string | null>(null);

  // Enterキーの挙動をハックして次の項目へ移動
  const handleKeyDown = useCallback<NonNullable<ButtonProps['onKeyDown']>>((e) => {
    lastKeyRef.current = e.key;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterFocus(e);
    }
    onKeyDown?.(e);
  }, [handleEnterFocus, onKeyDown]);

  const handleKeyUp = useCallback<NonNullable<ButtonProps['onKeyUp']>>((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    lastKeyRef.current = null;
    onKeyUp?.(e);
  }, [onKeyUp]);

  const handlePress = useCallback<NonNullable<ButtonProps['onPress']>>((e) => {
    // キーボード操作かつ Enter キーが由来の onPress は完全に弾く
    if (e.pointerType === 'keyboard' && lastKeyRef.current === 'Enter') {
      return;
    }
    onPress?.(e);
  }, [onPress]);

  return (
    <Button
      ref={ref}
      {...rest}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPress={handlePress}
      className={({ isFocusVisible, isDisabled }) =>
        twMerge(
          buttonStyles({ variant, width, isFocusVisible: !isInGrid && isFocusVisible, isDisabled, isInGrid }),
          className
        )
      }
    >
      {props.children}
    </Button>
  );
}));

CompanyButton.displayName = "CompanyButton";