
interface BootstrapOptions {
  isDev: boolean;
  enableMocking?: () => Promise<any>;
  renderApp: () => void;
}

export const bootstrapApp = async ({ isDev, enableMocking, renderApp }: BootstrapOptions) => {
  if (isDev && enableMocking) {
    // 開発環境（DEV）かつモック初期化関数が渡された場合のみ実行する
    // モックの実体（MSWなど）には依存せず、呼び出し元に委譲するクリーンな設計
    await enableMocking();
  }

  // アプリケーションの描画ツリー（React）をキックする
  renderApp();
};
