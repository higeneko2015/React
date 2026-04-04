import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ModalOverlay, Modal, Dialog, Heading } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

import { DialogContext } from '../hooks/useDialog';
import { CompanyButton } from '../components/CompanyButton';
import { setGlobalErrorHandler, clearGlobalErrorHandler } from '../api/client';
import { useMessage } from '../hooks/useMessage';

import type { ReactNode } from 'react';
import type { DialogOptions } from '../hooks/useDialog';

// ─────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────

/**
 * アイコン表示のバリアント。
 * ICON_MAP のキーと 1:1 対応する。
 */
type IconVariant = 'info' | 'confirm' | 'warning' | 'error';

/**
 * ダイアログの種別。
 * - confirm : OK / キャンセル の2択
 * - alert   : OK のみの通知
 */
type DialogType = 'confirm' | 'alert';

interface DialogState extends DialogOptions {
  isOpen: boolean;
  type: DialogType;
  variant: IconVariant;
}

/**
 * キューで管理するための「リクエスト全体」のエントリ。
 * 表示オプションと Promise の解決関数をセットにして保持します。
 */
type QueuedDialog = DialogOptions & {
  type: DialogType;
  variant: IconVariant;
} & (
    | { type: 'confirm'; resolve: (value: boolean) => void }
    | { type: 'alert'; resolve: (value: void) => void }
  );

// ─────────────────────────────────────────────
// 定数・サブコンポーネント
// ─────────────────────────────────────────────

/**
 * バリアントに応じたアイコンを表示するコンポーネント。
 * トップレベルで JSX オブジェクトを生成すると React のライフサイクル外になるため、
 * コンポーネントとして切り出している。
 */
const DialogIcon = ({ variant }: { variant: IconVariant }) => {
  const configs = {
    info: {
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    confirm: {
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      path: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      bg: 'bg-yellow-100',
      color: 'text-yellow-600',
      path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    error: {
      bg: 'bg-red-100',
      color: 'text-red-600',
      path: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  } satisfies Record<IconVariant, { bg: string; color: string; path: string }>;

  const { bg, color, path } = configs[variant];

  return (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
      <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────
// DialogProvider
// ─────────────────────────────────────────────

/**
 * アプリケーション全体で共通のダイアログ（確認・警告・エラー）を表示・制御するための Provider。
 * APIクライアントと連携し、システムエラー発生時に自動でエラーダイアログを表示する機能も持ちます。
 *
 * @param props.children - この Provider でラップする子要素
 */
export const DialogProvider = React.memo(({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    variant: 'info',
  });

  // ✨ 修正1: リクエスト全体（オプション＋resolve）をキューで管理する
  const queueRef = useRef<QueuedDialog[]>([]);

  const { t } = useMessage();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  /**
   * ✨ 新機能: キューの先頭にあるダイアログを画面に表示する。
   * キューが空ならダイアログを閉じる。
   */
  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current[0]; // 先頭を取得（まだキューからは消さない）
      setState({
        ...next,
        isOpen: true,
        title: next.title ?? (next.type === 'confirm' ? '確認' : '通知'),
        message: next.message,
      });
    } else {
      setState((prev) => ({ ...prev, isOpen: false }));
    }
  }, []);

  /** 確認ダイアログ（OK / キャンセル）を表示し、ユーザーの選択を Promise で返す */
  const confirm = useCallback((options: DialogOptions | string) => {
    return new Promise<boolean>((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;

      // キューにリクエストを追加
      queueRef.current.push({
        ...opts,
        type: 'confirm',
        variant: (opts.variant as IconVariant) ?? 'confirm',
        resolve,
      });

      // ✨ 現在ダイアログが開いていなければ、即座に表示処理をトリガーする
      setState((prev) => {
        if (!prev.isOpen) setTimeout(showNext, 0); // 状態更新の競合を防ぐため setTimeout
        return prev;
      });
    });
  }, [showNext]);

  /** 通知ダイアログ（OK のみ）を表示し、閉幕を Promise で返す */
  const alert = useCallback((options: DialogOptions | string) => {
    return new Promise<void>((resolve) => {
      const opts = typeof options === 'string' ? { message: options } : options;

      queueRef.current.push({
        ...opts,
        type: 'alert',
        variant: (opts.variant as IconVariant) ?? 'info',
        resolve,
      });

      setState((prev) => {
        if (!prev.isOpen) setTimeout(showNext, 0);
        return prev;
      });
    });
  }, [showNext]);

  // APIクライアントのグローバルエラーハンドラと接続する。
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

      const translated = tRef.current(messageKey);
      const message = translated !== messageKey
        ? translated
        : (fallbacks[messageKey] ?? translated);

      alert({ title, message, variant: 'error' });
    });

    return () => clearGlobalErrorHandler();
  }, [alert]);

  /**
   * ダイアログを閉じてキュー先頭の Promise を解決する。
   * - confirm ダイアログ: ユーザーの選択（true / false）を resolve する
   * - alert   ダイアログ: 種別に関わらず void で resolve する（dismiss 時も同様）
   */
  const handleClose = useCallback((result: boolean) => {
    // ✨ 修正2: 現在表示していたダイアログ（先頭）をキューから取り出して解決する
    const current = queueRef.current.shift();
    if (current) {
      if (current.type === 'confirm') {
        current.resolve(result);
      } else {
        current.resolve();
      }
    }
    // ✨ 続けて次のダイアログがあれば表示し、無ければ閉じる
    showNext();
  }, [showNext]);

  const {
    isOpen, title, message, type,
    variant = 'info',
    confirmLabel, cancelLabel,
  } = state;

  const okButtonVariant =
    variant === 'error' ? 'danger' :
      variant === 'warning' ? 'secondary' : 'primary';

  const contextValue = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={(open) => { if (!open) handleClose(false); }}
        isDismissable={type === 'alert'}
        className={({ isEntering, isExiting }) => twMerge(
          'fixed inset-0 z-[100] flex min-h-full items-center justify-center p-4 text-center bg-black/20 backdrop-blur-[1px]',
          isEntering && 'animate-in fade-in duration-200 ease-out',
          isExiting && 'animate-out fade-out duration-200 ease-in',
        )}
      >
        <Modal
          className={({ isEntering, isExiting }) => twMerge(
            'w-full max-w-md overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl',
            isEntering && 'animate-in zoom-in-95 duration-200 ease-out',
            isExiting && 'animate-out zoom-out-95 duration-200 ease-in',
          )}
        >
          <Dialog
            role={type === 'alert' ? 'alertdialog' : 'dialog'}
            className="outline-none"
          >
            <div className="flex items-start gap-4">
              <DialogIcon variant={variant} />
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
                <CompanyButton variant="secondary" onPress={() => handleClose(false)}>
                  {cancelLabel ?? 'キャンセル'}
                </CompanyButton>
              )}
              <CompanyButton variant={okButtonVariant} onPress={() => handleClose(true)}>
                {confirmLabel ?? 'OK'}
              </CompanyButton>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogContext.Provider>
  );
});

DialogProvider.displayName = 'DialogProvider';