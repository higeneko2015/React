import { http, HttpResponse, delay } from 'msw';
import type { User } from '../api/users';

const generateDummyData = (count: number): User[] => {
  const depts = ['dev', 'sales', 'hr'];
  const types = ['full_time', 'contract'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `テスト社員 ${i + 1}号`,
    salary: 200000 + (i % 10) * 10000,
    department: depts[i % depts.length],
    isActive: i % 2 === 0,
    employmentType: types[i % types.length],
    birthDate: `199${i % 10}/0${(i % 9) + 1}/1${i % 9}`,
    startTime: `09:0${i % 10}`,
    postalCode: `10000${(i % 99).toString().padStart(2, '0')}`,
    phoneNumber: `0901234${(i % 9999).toString().padStart(4, '0')}`
  }));
};

const allUsers = generateDummyData(1000);

export const mockMessages = {
  'E0001': '{0}は必須です',
  'E0002': '有効な日付を入力してください（{0}）',
  'E0003': '{0}は未来日を入力できません',
  'E0004': '有効な時刻を入力してください（{0}）',
  'E0005': '最低賃金（{0}円）以上を入力してください',
  'E0006': '{0}を入力した場合は{1}も必須です',
  'I0001': '社員情報を検索しています...',
  'I0002': 'データを保存しています...',
  // --- システムエラーメッセージ ---
  'E9001': 'サーバーに接続できませんでした。ネットワーク接続をご確認ください。',
  'E9002': 'サーバーエラーが発生しました。時間を置いて再度お試しください。',
  'E9003': 'セッションの有効期限が切れました。再度ログインしてください。',
};

export const handlers = [
  http.get('/api/messages', async () => {
    // 💡 フリッカーや非同期挙動の確認のため、初期ロード時に少しだけ遅延を入れます
    await delay(300);
    return HttpResponse.json(mockMessages);
  }),

  // --- デバッグ・検証用：エラーシミュレーションエンドポイント ---
  http.get('/api/test/error/500', async () => {
    await delay(500);
    return new HttpResponse(null, { status: 500 });
  }),

  http.get('/api/test/error/401', async () => {
    await delay(500);
    return new HttpResponse(null, { status: 401 });
  }),

  http.get('/api/test/error/network', async () => {
    await delay(500);
    return HttpResponse.error();
  }),

  http.get('/api/users', async ({ request }) => {
    // 💡 0.5秒〜3秒のランダムな遅延を発生させて「フリッカー防止ルール」をテストできるようにします！
    const randomDelay = 500 + Math.random() * 2500;
    await delay(randomDelay);

    const url = new URL(request.url);
    const nameQuery = url.searchParams.get('name') || '';
    const phoneQuery = url.searchParams.get('phone') || '';

    let results = allUsers;

    if (nameQuery) {
      results = results.filter(u => u.name.startsWith(nameQuery));
    }

    if (phoneQuery) {
      results = results.filter(u => u.phoneNumber.includes(phoneQuery));
    }

    return HttpResponse.json(results);
  }),
];
