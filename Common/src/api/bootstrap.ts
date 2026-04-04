/**
 * アプリケーションの起動オプション。
 */
export interface BootstrapOptions {
  /** 開発環境かどうか */
  isDev: boolean;
  /** モック（MSW等）の初期化を行う非同期関数（オプション） */
  enableMocking?: () => Promise<unknown>;
  /** ReactコンポーネントをDOMにレンダリングする関数 */
  renderApp: () => void;
}

/**
 * アプリケーションの初期化と起動を行うエントリーポイント関数。
 * 開発環境であれば、Reactの描画前にモックサーバーの起動などを待ち合わせることができます。
 */
export const bootstrapApp = async ({ isDev, enableMocking, renderApp }: BootstrapOptions) => {
  if (isDev && enableMocking) {
    // 開発環境（DEV）かつモック初期化関数が渡された場合のみ実行する
    // モックの実体（MSWなど）には依存せず、呼び出し元に委譲するクリーンな設計
    await enableMocking();
  }

  // アプリケーションの描画ツリー（React）をキックする
  renderApp();
};