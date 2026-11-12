// ชั้นกลางเดียวที่คุยกับ Backend ของทีม (Go) ทุกหน้าเรียกผ่านไฟล์นี้ ไม่ fetch เองในหน้า
// '' = origin เดียวกับหน้าเว็บ (CRA proxy /api ไปที่ mock พอร์ต 4000)
// ต่อ Go จริง: REACT_APP_API_URL=https://<ชื่อ>.onrender.com (ตั้งใน .env และใน Vercel)
const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;                       // ลบสำเร็จ ไม่มี body

  const data = await res.json().catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON (backend ยังไม่พร้อม?)' }));
  if (!res.ok) {
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- สมาชิก ----------
export const register = (email, password, displayName) =>
  apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
export const login = (email, password) =>
  apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });            // { token, member }
export const getMe = (token) => apiFetch('/api/me', { token });                            // { member }
export const updateProfile = (displayName, token) =>
  apiFetch('/api/me', { method: 'PUT', body: { displayName }, token });                    // { member }
export const changePassword = (currentPassword, newPassword, token) =>
  apiFetch('/api/me/password', { method: 'PUT', body: { currentPassword, newPassword }, token });

// ---------- อนิเมะ (guest ดูได้) ----------
// ข้อมูลอนิเมะมาจาก TENRAI (src/api/tenrai.js) ส่วนนี้คือสิ่งที่ admin แก้ทับ -> [{ id, titleTh, genre, poster, synopsis }]
// (ช่องที่เป็น null = ใช้ของ TENRAI) ผสมเข้ากับข้อมูลของ TENRAI ด้วย src/api/catalog.js
export async function getAnimeOverrides() {
  const data = await apiFetch('/api/anime-overrides');
  return data.items;
}
// คะแนนเฉลี่ยจากสมาชิก AniWave ของอนิเมะ 1 เรื่อง (id ของ TENRAI) -> { voteAverage, voteCount }
export const getAnimeStats = (animeId) => apiFetch(`/api/anime/${animeId}/stats`);

// ---------- รีวิว / คะแนน (member) ----------
export const getReviews = (animeId) => apiFetch(`/api/anime/${animeId}/reviews`);          // { items }
export const postReview = (animeId, text, token) =>
  apiFetch(`/api/anime/${animeId}/reviews`, { method: 'POST', body: { text }, token });
export const putVote = (animeId, score, token) =>
  apiFetch(`/api/anime/${animeId}/vote`, { method: 'PUT', body: { score }, token });

// ---------- Wishlist (member) ----------
export const getWishlist = (token) => apiFetch('/api/me/wishlist', { token });             // { items: [{ id }] } มีแค่ id ชื่อ/โปสเตอร์ไปดึงจาก TENRAI
export const addToWishlist = (animeId, token) => apiFetch(`/api/me/wishlist/${animeId}`, { method: 'PUT', token });
export const removeFromWishlist = (animeId, token) => apiFetch(`/api/me/wishlist/${animeId}`, { method: 'DELETE', token });

// ---------- หลังบ้าน (admin เท่านั้น member ได้ 403 จาก Go) ----------
export const getAdminStats = (token) => apiFetch('/api/admin/stats', { token });
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.items;
}
export const setMemberRole = (memberId, role, token) =>
  apiFetch(`/api/admin/members/${memberId}/role`, { method: 'PUT', body: { role }, token });
// แก้ทับข้อมูลของ TENRAI: fields = { titleTh, genre, poster, synopsis } (ช่องที่ไม่แก้ส่ง null)
export const putAnimeOverride = (animeId, fields, token) =>
  apiFetch(`/api/admin/anime-overrides/${animeId}`, { method: 'PUT', body: fields, token });
// ลบที่แก้ไว้ทั้งหมด = กลับไปใช้ข้อมูลของ TENRAI
export const deleteAnimeOverride = (animeId, token) =>
  apiFetch(`/api/admin/anime-overrides/${animeId}`, { method: 'DELETE', token });
