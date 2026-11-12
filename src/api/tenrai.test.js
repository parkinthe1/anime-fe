import { toAnime, getTopAnime, getAnimeById } from './tenrai';

test('toAnime แปลง JSON ของ TENRAI เป็นรูปร่างเดียวกับข้อมูลของเรา', () => {
  const result = toAnime({
    mal_id: 52991,
    title: 'Sousou no Frieren',
    title_english: "Frieren: Beyond Journey's End",
    year: 2023,
    score: 9.3,
    episodes: 28,
    status: 'Finished Airing',
    genres: [{ name: 'Fantasy' }, { name: 'Adventure' }],
    images: { jpg: { image_url: 'https://cdn.example/frieren.jpg' } },
    synopsis: 'เรื่องย่อ',
  });

  expect(result).toEqual({
    id: 52991,
    title: "Frieren: Beyond Journey's End",
    titleTh: null,
    year: 2023,
    genre: 'Fantasy',
    rating: 9.3,
    episodes: 28,
    status: 'finished',
    poster: 'https://cdn.example/frieren.jpg',
    synopsis: 'เรื่องย่อ',
  });
});

test('field ที่ TENRAI ไม่ส่งมา ต้องได้ null ไม่ใช่ error', () => {
  const result = toAnime({ mal_id: 1, title: 'X', status: 'Not yet aired' });

  expect(result.title).toBe('X');
  expect(result.year).toBeNull();
  expect(result.genre).toBeNull();
  expect(result.poster).toBeNull();
  expect(result.status).toBe('upcoming');
});

afterEach(() => { delete global.fetch; });

test('getTopAnime เรียก TENRAI แล้วแปลงทุกรายการ', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ mal_id: 1, title: 'A' }, { mal_id: 2, title: 'B' }] }) });

  const list = await getTopAnime();

  expect(global.fetch).toHaveBeenCalledWith('https://api.tenrai.org/v1/top/anime');
  expect(list.map(a => a.id)).toEqual([1, 2]);
});

test('getAnimeById ถ้า TENRAI ตอบ 404 ต้องโยน error ที่มี status 404 และข้อความไทย', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

  await expect(getAnimeById(999)).rejects.toMatchObject({ status: 404, message: 'ไม่พบอนิเมะเรื่องนี้' });
});
