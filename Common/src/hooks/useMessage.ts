import { createContext, useContext, useMemo } from 'react';

// メッセージカタログの型
export type MessageCatalog = Record<string, string>;

// Contextの定義
interface MessageContextValue {
  messages: MessageCatalog;
}

export const MessageContext = createContext<MessageContextValue>({ messages: {} });

/**
 * プレースホルダ置換機能付きの翻訳関数を取得するカスタムフック
 */
export const useMessage = () => {
  const { messages } = useContext(MessageContext);

  const t = useMemo(() => {
    return (codeOrMessage: string | undefined | null, ...args: any[]): string => {
      if (!codeOrMessage) return '';
      
      // Zodなどから { code: 'E0002', args: ['生年月日', '未来日'] } のようなJSON形式で渡された場合の高機能パース
      let code = codeOrMessage;
      let formatArgs = args;
      
      try {
         const parsed = JSON.parse(codeOrMessage);
         if (parsed && typeof parsed.code === 'string') {
             code = parsed.code;
             if (Array.isArray(parsed.args)) {
                 formatArgs = parsed.args;
             }
         }
      } catch (e) {
         // 文字列がJSONではない場合（ただのメッセージ直書きや単なるエラーコード）はそのまま進行
      }

      // マスタからメッセージを取得。
      // 【フォールバック機構】
      // もしマスタが存在しない（Contextが空）、またはマスタ内に該当コードがない場合は、
      // 渡された文字列（『氏名は必須です』や『E0001』）をそのまま返す。
      let message = messages[code] || code;

      // プレースホルダ {0}, {1} ... を引数で置換
      if (formatArgs && formatArgs.length > 0) {
        formatArgs.forEach((arg, index) => {
          message = message.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
        });
      }

      return message;
    };
  }, [messages]);

  return { t };
};
