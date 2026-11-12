import { getAnimeOverrides } from './backend';

// ข้อมูลอนิเมะมาจาก TENRAI แต่ admin แก้ทับได้ 4 ช่อง: ชื่อไทย แนว โปสเตอร์ เรื่องย่อ (เก็บที่ backend อ้างด้วย id ของ TENRAI)
// override แต่ละช่องเป็น null = ไม่ได้แก้ ใช้ของ TENRAI ต่อ
export function mergeOverride(anime, override) {
  if (!anime || !override) return anime;
  return {
    ...anime,
    titleTh: override.titleTh ?? anime.titleTh,
    genre: override.genre ?? anime.genre,
    poster: override.poster ?? anime.poster,
    synopsis: override.synopsis ?? anime.synopsis,
    hasOverride: true,
  };
}

// รายการที่ admin แก้ทับ เป็น Map(id -> override) ถ้าดึงจาก backend ไม่ได้ให้คืน Map ว่าง
// หน้าเว็บจะได้ยังแสดงข้อมูลจาก TENRAI ได้ ไม่พังทั้งหน้าเพราะของเสริม
export async function fetchOverrideMap() {
  try {
    const list = await getAnimeOverrides();
    return new Map((Array.isArray(list) ? list : []).map(o => [Number(o.id), o]));
  } catch {
    return new Map();
  }
}

export const withOverrides = (list, overrides) => list.map(a => mergeOverride(a, overrides.get(Number(a.id))));
