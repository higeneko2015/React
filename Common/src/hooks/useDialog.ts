import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface DialogOptions {
  title?: string;
  message: string | ReactNode;
  variant?: 'info' | 'confirm' | 'warning' | 'error';
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface DialogContextType {
  confirm: (options: DialogOptions | string) => Promise<boolean>;
  alert: (options: DialogOptions | string) => Promise<void>;
}

export const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog は DialogProvider の内側で使用してください！');
  }
  return context;
};
