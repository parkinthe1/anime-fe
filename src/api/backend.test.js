import { apiFetch, login, createPlaylist, reorderPlaylist, getSongs, changePassword } from './backend';

// สร้างคำตอบปลอมของ fetch: ใส่แค่ status กับ body ที่อยากให้ server ตอบ
function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน JSON ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/songs');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/songs');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('มี token ต้องแนบ Authorization แบบ Bearer และ body ต้องเป็นข้อความ JSON', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));

  await createPlaylist({ name: 'เพลงขับรถ', description: '', isPublic: true }, 'abc123');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/me/playlists');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(options.headers['Content-Type']).toBe('application/json');
  expect(options.body).toBe(JSON.stringify({ name: 'เพลงขับรถ', description: '', isPublic: true }));
});

test('จัดลำดับเพลงต้องยิง PUT /order พร้อม songIds ตามลำดับใหม่', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { id: 3, songs: [] }));

  await reorderPlaylist(3, [9, 4, 6], 'tok');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/me/playlists/3/order');
  expect(options.method).toBe('PUT');
  expect(options.body).toBe(JSON.stringify({ songIds: [9, 4, 6] }));
});

test('ค้นหาเพลงต้องแนบ q, genre, limit, offset ใน query string และข้ามค่าที่ว่าง', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [], total: 0 }));

  await getSongs({ q: 'a b', genre: '', limit: 10, offset: 20 });

  const [url] = fetch.mock.calls[0];
  expect(url).toBe('/api/songs?q=a+b&limit=10&offset=20');
});

test('เปลี่ยนรหัสผ่านต้องยิง PUT /api/me/password พร้อม token และรหัสทั้งสองตัว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { ok: true }));

  await changePassword('old1234', 'new5678', 'tok');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/me/password');
  expect(options.method).toBe('PUT');
  expect(options.headers.Authorization).toBe('Bearer tok');
  expect(options.body).toBe(JSON.stringify({ currentPassword: 'old1234', newPassword: 'new5678' }));
});

test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/me/playlists/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('ไม่ใช่ 2xx ต้องโยน Error ที่มีข้อความจาก server และเลข status', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  await expect(login('a@b.c', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  const err = await login('a@b.c', 'wrong').catch(e => e);
  expect(err.status).toBe(401);
});

test('server ตอบมาไม่ใช่ JSON ต้องได้ข้อความที่เข้าใจได้ ไม่ใช่ SyntaxError', async () => {
  fetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

  await expect(apiFetch('/api/songs')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');
});
