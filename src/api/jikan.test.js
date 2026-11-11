import { toAnime } from './jikan';

test('toAnime แปลง JSON ของ Jikan เป็นรูปร่างเดียวกับข้อมูลของเรา', () => {
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

test('field ที่ Jikan ไม่ส่งมา ต้องได้ null ไม่ใช่ error', () => {
  const result = toAnime({ mal_id: 1, title: 'X', status: 'Not yet aired' });

  expect(result.title).toBe('X');
  expect(result.year).toBeNull();
  expect(result.genre).toBeNull();
  expect(result.poster).toBeNull();
  expect(result.status).toBe('upcoming');
});
