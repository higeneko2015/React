import React, { useMemo } from 'react';
import { MessageContext } from '../hooks/useMessage';

/**
 * MessageProvider のプロパティ定義。
 */
export interface MessageProviderProps {
  /** 外部から取得したメッセージカタログ（キーと文言の辞書JSON） */
  messages: MessageCatalog;
  /** ラップする子要素 */
  children: ReactNode;
}

/**
 * アプリケーション全体にメッセージマスタを提供するコンテキストプロバイダー。
 * 通信やキャッシュ(SWR)の責務は持たせず、渡された辞書を配下に提供することだけに専念する疎結合設計です。
 */
export const MessageProvider = React.memo(({ messages, children }: MessageProviderProps) => {
  /** * Context に渡す値をメモ化。
   * messages が更新されない限り、参照を維持して配下の再レンダリングを抑止します。
   */
  const contextValue = useMemo(() => ({ messages }), [messages]);

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
});

// 型のインポートはルール 5 に従って一番下に配置
import type { ReactNode } from 'react';
import type { MessageCatalog } from '../hooks/useMessage';

MessageProvider.displayName = 'MessageProvider';