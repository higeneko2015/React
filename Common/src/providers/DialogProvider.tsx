import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ModalOverlay, Modal, Dialog, Heading } from 'react-aria-components';
import { DialogContext, type DialogOptions } from '../hooks/useDialog';
import { CompanyButton } from '../components/CompanyButton';
import { setGlobalErrorHandler, clearGlobalErrorHandler } from '../api/client';
import { useMessage } from '../hooks/useMessage';

const iconMap = {
  info: (
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  confirm: (
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  warning: (
    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  ),
  error: (
    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
};

interface DialogState extends DialogOptions {
  isOpen: boolean;
  type: 'confirm' | 'alert';
}

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    variant: 'confirm'
  });

  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const { t } = useMessage();

  const confirm = useCallback((options: DialogOptions | string) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      const opts = typeof options === 'string' ? { message: options } : options;
      setState({
        ...opts,
        type: 'confirm',
        variant: opts.variant || 'confirm',
        isOpen: true,
        title: opts.title || '確認',
        message: opts.message,
      });
    });
  }, []);

  const alert = useCallback((options: DialogOptions | string) => {
    return new Promise<void>((resolve) => {
      resolveRef.current = resolve as any;
      const opts = typeof options === 'string' ? { message: options } : options;
      setState({
        ...opts,
        type: 'alert',
        variant: opts.variant || 'info',
        isOpen: true,
        title: opts.title || '通知',
        message: opts.message,
      });
    });
  }, []);

  // グローバルエラーハンドラを登録・解除する
  useEffect(() => {
    setGlobalErrorHandler((status, messageKey) => {
      let title = 'システムエラー';
      if (status === 401) title = '認証エラー';
      else if (status === null) title = '接続エラー';

      const fallbacks: Record<string, string> = {
        'E9001': 'サーバーに接続できませんでした。ネットワーク接続をご確認ください。',
        'E9002': 'サーバーエラーが発生しました。時間を置いて再度お試しください。',
        'E9003': 'セッションの有効期限が切れました。再度ログインしてください。',
      };

      // t 関数はマスタにない場合キーをそのまま返すため、
      // 翻訳された（キーと異なる）場合のみ採用し、そうでなければフォールバックを使う
      const translated = t(messageKey);
      const message = translated !== messageKey 
        ? translated 
        : (fallbacks[messageKey] || translated);

      alert({ title, message, variant: 'error' });
    });

    return () => {
      clearGlobalErrorHandler();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleClose = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }, []);

  const { isOpen, title, message, type, variant = 'confirm', confirmLabel, cancelLabel } = state;
  const icon = iconMap[variant];

  // variantに応じたOKボタンの色
  const okButtonVariant = variant === 'error' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary';

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={(open) => {
          // モーダル外クリック等で閉じた場合は false(キャンセル) 扱い
          if (!open) handleClose(false);
        }}
        isDismissable={type === 'alert'} // アラートの時は画面外クリックで閉じてOK
        className={({ isEntering, isExiting }) => `
          fixed inset-0 z-[100] flex min-h-full items-center justify-center p-4 text-center bg-black/20 backdrop-blur-[1px]
          ${isEntering ? 'animate-in fade-in duration-200 ease-out' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
        `}
      >
        <Modal
          className={({ isEntering, isExiting }) => `
            w-full max-w-md overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl
            ${isEntering ? 'animate-in zoom-in-95 duration-200 ease-out' : ''}
            ${isExiting ? 'animate-out zoom-out-95 duration-200 ease-in' : ''}
          `}
        >
          <Dialog role={type === 'alert' ? 'alertdialog' : 'dialog'} className="outline-none">
            <div className="flex items-start gap-4">
              {icon}
              <div className="flex-1">
                <Heading slot="title" className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </Heading>
                <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {message}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              {type === 'confirm' && (
                <CompanyButton
                  variant="secondary"
                  onPress={() => handleClose(false)}
                >
                  {cancelLabel || 'キャンセル'}
                </CompanyButton>
              )}
              <CompanyButton
                variant={okButtonVariant}
                onPress={() => handleClose(true)}
              >
                {confirmLabel || 'OK'}
              </CompanyButton>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogContext.Provider>
  );
};
