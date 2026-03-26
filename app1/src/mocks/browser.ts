import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// app1専用のモックワーカーをセットアップ
export const worker = setupWorker(...handlers);
