// ดึงข้อมูลอนิเมะ (ชื่อ โปสเตอร์ เรื่องย่อ ฯลฯ) จาก TENRAI API โดยตรง (รูปแบบข้อมูลเหมือน Jikan/MyAnimeList)
// id ของอนิเมะทั้งเว็บ = mal_id ของ TENRAI ส่วน backend (Go) เก็บแค่ของสมาชิก: คะแนน รีวิว wishlist โดยอ้างด้วย id นี้
// แปลงเป็นรูปร่างเดียวกับ { id, title, titleTh, ... } เพื่อให้การ์ด/หน้ารายละเอียดใช้ร่วมกันได้

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

// ระวัง rate limit ของ TENRAI (ประมาณ 3 request ต่อวินาที) ถ้าต้องดึงหลายเรื่องให้ทยอยเรียก
async function tenraiFetch(path) {
  const res = await fetch(`${TENRAI}${path}`);
  if (!res.ok) {
    const err = new Error(res.status === 404 ? 'ไม่พบอนิเมะเรื่องนี้' : `TENRAI ตอบกลับ ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return (await res.json()).data;
}

export async function getTopAnime() {
  const data = await tenraiFetch('/top/anime');
  return data.map(toAnime);
}
export async function getAnimeById(id) {
  return toAnime(await tenraiFetch(`/anime/${id}`));
}

