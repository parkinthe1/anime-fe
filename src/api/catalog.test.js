import { mergeOverride, fetchOverrideMap, withOverrides } from './catalog';
import { getAnimeOverrides } from './backend';

jest.mock('./backend');

const TENRAI_ANIME = { id: 7, title: 'Frieren', titleTh: null, genre: 'Fantasy', poster: 'https://t/p.jpg', synopsis: 'An elf.' };

test('mergeOverride: ช่องที่ admin แก้ใช้ของ admin ช่องที่เป็น null ใช้ของ TENRAI', () => {
  const merged = mergeOverride(TENRAI_ANIME, { id: 7, titleTh: 'ฟรีเรน', genre: null, poster: null, synopsis: 'เอลฟ์' });

  expect(merged).toMatchObject({ title: 'Frieren', titleTh: 'ฟรีเรน', genre: 'Fantasy', poster: 'https://t/p.jpg', synopsis: 'เอลฟ์', hasOverride: true });
});

test('mergeOverride: ไม่มี override ต้องคืนข้อมูลเดิมไม่เปลี่ยน', () => {
  expect(mergeOverride(TENRAI_ANIME, undefined)).toBe(TENRAI_ANIME);
});

test('fetchOverrideMap: แปลงเป็น Map ตาม id และถ้า backend ล่มต้องคืน Map ว่างไม่โยน error', async () => {
  getAnimeOverrides.mockResolvedValueOnce([{ id: 7, titleTh: 'ฟรีเรน' }]);
  expect((await fetchOverrideMap()).get(7).titleTh).toBe('ฟรีเรน');

  getAnimeOverrides.mockRejectedValueOnce(new Error('down'));
  expect((await fetchOverrideMap()).size).toBe(0);
});

test('withOverrides: ผสมเฉพาะเรื่องที่มี override', () => {
  const other = { id: 8, title: 'Other', titleTh: null };
  const out = withOverrides([TENRAI_ANIME, other], new Map([[7, { id: 7, titleTh: 'ฟรีเรน' }]]));

  expect(out[0].titleTh).toBe('ฟรีเรน');
  expect(out[1]).toBe(other);
});
