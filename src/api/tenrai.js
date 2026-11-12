// ที่เตรียมไว้สำหรับต่อ TENRAI API (รูปแบบข้อมูลเหมือน Jikan/MyAnimeList) ในขั้นถัดไป
// ตอนนี้ "ยังไม่ถูกเรียกใช้ที่ไหน" ทุกหน้าใช้ข้อมูลจาก backend (src/api/backend.js) เพราะ wishlist/คะแนน/รีวิว/หลังบ้าน
// อ้าง id ของอนิเมะชุดเดียวกับ backend ถ้าเอา id ของ TENRAI (mal_id) มาปนจะ 404
// มีแค่ตัวแปลง JSON ของ TENRAI ให้เป็นรูปร่างเดียวกับ mock/anime.json
// พอต่อจริง: ให้ backend (Go) ดึงจาก TENRAI แล้วเก็บลงฐานข้อมูล แล้วหน้าเว็บยังเรียกผ่าน backend.js เหมือนเดิม

const TENRAI = 'https://api.tenrai.org/v1';

const STATUS = { 'Currently Airing': 'airing', 'Finished Airing': 'finished', 'Not yet aired': 'upcoming' };

// แปลง 1 รายการของ TENRAI -> { id, title, titleTh, year, genre, rating, episodes, status, poster, synopsis }
export function toAnime(j) {
  return {
    id: j.mal_id,
    title: j.title_english || j.title,
    titleTh: null,                                   // TENRAI ไม่มีชื่อไทย
    year: j.year ?? j.aired?.prop?.from?.year ?? null,
    genre: j.genres?.[0]?.name ?? null,
    rating: j.score ?? null,
    episodes: j.episodes ?? null,
    status: STATUS[j.status] ?? 'finished',
    poster: j.images?.jpg?.image_url ?? null,
    synopsis: j.synopsis ?? '',
  };
}

// TODO (ขั้นต่อไป): ต่อใช้งานจริง และระวัง rate limit ของ TENRAI (ประมาณ 3 request ต่อวินาที)
export async function getTopAnime() {
  const res = await fetch(`${TENRAI}/top/anime`);
  if (!res.ok) throw new Error(`TENRAI ตอบกลับ ${res.status}`);
  const data = await res.json();
  return data.data.map(toAnime);
}
export async function getAnimeById(id) {
  const res = await fetch(`${TENRAI}/anime/${id}`);

  if (!res.ok) {
    throw new Error(`TENRAI ตอบกลับ ${res.status}`);
  }

  const data = await res.json();
  return toAnime(data.data);
}
