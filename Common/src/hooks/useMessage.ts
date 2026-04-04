import { createContext, useContext, useMemo } from 'react';

/**
 * メッセージカタログの型定義。
 * キーにメッセージコード、値にメッセージ本文（プレースホルダ込）を保持します。
 */
export type MessageCatalog = Record<string, string>;

/**
 * メッセージコンテキストの保持する値の型定義。
 */
interface MessageContextValue {
  messages: MessageCatalog;
}

/**
 * メッセージカタログを配信するための Context。
 */
export const MessageContext = createContext<MessageContextValue>({ messages: {} });

/**
 * 翻訳・メッセージ取得用のカスタムフック。
 * * @description
 * 1. メッセージコードからカタログ内の文言を取得します。
 * 2. {0}, {1} 形式のプレースホルダを指定した引数で置換します。
 * 3. JSON文字列形式の入力（{ code: '...', args: [...] }）を自動でパースして処理します。
 * * @returns { t } 翻訳関数を含むオブジェクト
 * * @example
 * const { t } = useMessage();
 * t('E0001', '氏名'); // => "氏名は必須入力です"
 * t('{"code":"E0001","args":["住所"]}'); // => "住所は必須入力です"
 */
export const useMessage = () => {
  const context = useContext(MessageContext);
  // Contextが未定義の場合のフォールバック
  const messages = context?.messages ?? {};

  const t = useMemo(() => {
    /**
     * @param codeOrMessage - メッセージコード、またはJSON形式のメッセージオブジェクト、あるいは生のメッセージ文字列
     * @param args - プレースホルダ置換用の引数
     */
    return (codeOrMessage: string | undefined | null, ...args: unknown[]): string => {
      if (!codeOrMessage) return '';

      let code = codeOrMessage;
      let formatArgs = args;

      // JSON形式で渡された場合のパース（Zod等のバリデーションライブラリ連携用）
      if (codeOrMessage.startsWith('{')) {
        try {
          const parsed = JSON.parse(codeOrMessage);
          if (parsed && typeof parsed.code === 'string') {
            code = parsed.code;
            if (Array.isArray(parsed.args)) {
              formatArgs = parsed.args;
            }
          }
        } catch {
          // JSONでない場合はそのまま通常の文字列として処理
        }
      }

      // カタログから取得。該当がなければコード（または入力文字列）をそのまま返す
      let message = messages[code] ?? code;

      // プレースホルダ {0}, {1} ... を引数で一括置換
      if (formatArgs && formatArgs.length > 0) {
        formatArgs.forEach((arg, index) => {
          const placeholder = new RegExp(`\\{${index}\\}`, 'g');
          message = message.replace(placeholder, String(arg ?? ''));
        });
      }

      return message;
    };
  }, [messages]);

  return { t };
};