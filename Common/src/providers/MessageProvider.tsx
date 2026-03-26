import React from 'react';
import type { ReactNode } from 'react';
import { MessageContext } from '../hooks/useMessage';
import type { MessageCatalog } from '../hooks/useMessage';

export interface MessageProviderProps {
  /** 外部から取得したメッセージカタログ（辞書JSON） */
  messages: MessageCatalog;
  children: ReactNode;
}

/**
 * アプリケーション全体にメッセージマスタを提供するコンテキストプロバイダー。
 * 通信やキャッシュ(SWR)の責務は持たたせず、渡された辞書を配下に提供することだけに専念する疎結合設計。
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({ messages, children }) => {
  return (
    <MessageContext.Provider value={{ messages }}>
      {children}
    </MessageContext.Provider>
  );
};
