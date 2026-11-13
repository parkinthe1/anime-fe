// ชั้นกลางเดียวที่คุยกับ Backend ของทีม (Go) ทุกหน้าเรียกผ่านไฟล์นี้ ไม่ fetch เองในหน้า
// '' = origin เดียวกับหน้าเว็บ (CRA proxy /api ไปที่ Go ในเครื่องพอร์ต 8080)
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

  if (res.status === 204) return null;                       // สำเร็จแต่ไม่มี body (ลบ, เพิ่มเพลง ฯลฯ)

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

// ---------- เพลง ศิลปิน เพลย์ลิสต์สาธารณะ (guest ดูได้) ----------
// รายการเพลง -> { items, total }  (แบ่งหน้าด้วย limit/offset)
export function getSongs({ q = '', genre = '', limit = 24, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (genre) params.set('genre', genre);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return apiFetch(`/api/songs?${params}`);
}
export const getSong = (id) => apiFetch(`/api/songs/${id}`);
export async function getGenres() {
  const data = await apiFetch('/api/genres');
  return data.items;
}
export async function getArtists(q = '') {
  const data = await apiFetch(`/api/artists${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  return data.items;
}
export const getArtist = (id) => apiFetch(`/api/artists/${id}`);                          // ศิลปิน + songs
export async function getPublicPlaylists(q = '') {
  const data = await apiFetch(`/api/playlists${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  return data.items;
}
export const getPublicPlaylist = (id) => apiFetch(`/api/playlists/${id}`);                // เพลย์ลิสต์ + songs

// ---------- เพลย์ลิสต์ของฉัน (member) ----------
export async function getMyPlaylists(token) {
  const data = await apiFetch('/api/me/playlists', { token });
  return data.items;
}
export const createPlaylist = (fields, token) =>
  apiFetch('/api/me/playlists', { method: 'POST', body: fields, token });                 // fields = { name, description, isPublic }
export const getMyPlaylist = (id, token) => apiFetch(`/api/me/playlists/${id}`, { token });
export const updatePlaylist = (id, fields, token) =>
  apiFetch(`/api/me/playlists/${id}`, { method: 'PUT', body: fields, token });
export const deletePlaylist = (id, token) =>
  apiFetch(`/api/me/playlists/${id}`, { method: 'DELETE', token });
export const addSongToPlaylist = (playlistId, songId, token) =>
  apiFetch(`/api/me/playlists/${playlistId}/songs/${songId}`, { method: 'PUT', token });
export const removeSongFromPlaylist = (playlistId, songId, token) =>
  apiFetch(`/api/me/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE', token });
export const reorderPlaylist = (playlistId, songIds, token) =>
  apiFetch(`/api/me/playlists/${playlistId}/order`, { method: 'PUT', body: { songIds }, token });   // คืนเพลย์ลิสต์ที่เรียงใหม่

// ---------- ถูกใจ / ประวัติการฟัง (member) ----------
export const likePlaylist = (id, token) => apiFetch(`/api/playlists/${id}/like`, { method: 'PUT', token });         // { liked, likeCount }
export const unlikePlaylist = (id, token) => apiFetch(`/api/playlists/${id}/like`, { method: 'DELETE', token });
export async function getMyLikes(token) {
  const data = await apiFetch('/api/me/likes', { token });
  return data.items;
}
export const recordPlay = (songId, token) => apiFetch(`/api/songs/${songId}/play`, { method: 'POST', token });
export async function getHistory(token) {
  const data = await apiFetch('/api/me/history', { token });
  return data.items;
}

// ---------- หลังบ้าน (admin เท่านั้น member ได้ 403 จาก Go) ----------
export const getAdminStats = (token) => apiFetch('/api/admin/stats', { token });
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.items;
}
export const setMemberRole = (memberId, role, token) =>
  apiFetch(`/api/admin/members/${memberId}/role`, { method: 'PUT', body: { role }, token });
export const createSong = (fields, token) => apiFetch('/api/admin/songs', { method: 'POST', body: fields, token });
export const updateSong = (id, fields, token) => apiFetch(`/api/admin/songs/${id}`, { method: 'PUT', body: fields, token });
export const deleteSong = (id, token) => apiFetch(`/api/admin/songs/${id}`, { method: 'DELETE', token });
export const createArtist = (fields, token) => apiFetch('/api/admin/artists', { method: 'POST', body: fields, token });
export const updateArtist = (id, fields, token) => apiFetch(`/api/admin/artists/${id}`, { method: 'PUT', body: fields, token });
export const deleteArtist = (id, token) => apiFetch(`/api/admin/artists/${id}`, { method: 'DELETE', token });
export async function getAdminPlaylists(token) {
  const data = await apiFetch('/api/admin/playlists', { token });
  return data.items;
}
export const deleteAdminPlaylist = (id, token) => apiFetch(`/api/admin/playlists/${id}`, { method: 'DELETE', token });
