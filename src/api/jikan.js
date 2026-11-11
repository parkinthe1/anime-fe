// ที่เตรียมไว้สำหรับต่อ Jikan API (https://docs.api.jikan.moe) ในขั้นถัดไป
// ตอนนี้ "ยังไม่ถูกเรียกใช้ที่ไหน" มีแค่ตัวแปลง JSON ของ Jikan ให้เป็นรูปร่างเดียวกับ mock/anime.json
// พอต่อจริง: หน้าที่ต้องการข้อมูลจาก Jikan เรียก getTopAnime() แล้วส่งต่อให้ AnimeGrid ได้เลย ไม่ต้องแก้การ์ด

const JIKAN = 'https://api.jikan.moe/v4';

const STATUS = { 'Currently Airing': 'airing', 'Finished Airing': 'finished', 'Not yet aired': 'upcoming' };

// แปลง 1 รายการของ Jikan -> { id, title, titleTh, year, genre, rating, episodes, status, poster, synopsis }
export function toAnime(j) {
  return {
    id: j.mal_id,
    title: j.title_english || j.title,
    titleTh: null,                                   // Jikan ไม่มีชื่อไทย
    year: j.year ?? j.aired?.prop?.from?.year ?? null,
    genre: j.genres?.[0]?.name ?? null,
    rating: j.score ?? null,
    episodes: j.episodes ?? null,
    status: STATUS[j.status] ?? 'finished',
    poster: j.images?.jpg?.image_url ?? null,
    synopsis: j.synopsis ?? '',
  };
}

// TODO (ขั้นต่อไป): ต่อใช้งานจริง และระวัง rate limit ของ Jikan (ประมาณ 3 request ต่อวินาที)
export async function getTopAnime() {
  const res = await fetch(`${JIKAN}/top/anime`);
  if (!res.ok) throw new Error(`Jikan ตอบกลับ ${res.status}`);
  const data = await res.json();
  return data.data.map(toAnime);
}
