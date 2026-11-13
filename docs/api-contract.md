# สัญญา API ระหว่าง FE (React) กับ BE (Go) — MusicKen

กติกา: ทุก endpoint ตอบ JSON, prefix `/api`, field แบบ camelCase, error ทุกตัวตอบ `{ "error": "ข้อความ" }`
ตั๋ว (token) ส่งใน header `Authorization: Bearer <token>` — **สิทธิ์ตรวจที่ Go ทุกครั้ง** FE ซ่อนหน้าเฉยๆ ไม่ใช่การป้องกัน
บทบาท: `guest` (ไม่มี token) / `member` / `admin`

รูปร่างข้อมูล
- `Song` = `{ id, title, artistId, artistName, album, genre, year, durationSec, coverUrl, previewUrl, externalId }` (ช่องที่ไม่มีค่าเป็น `null`)
- `Artist` = `{ id, name, bio, imageUrl, songCount }`
- `Playlist` = `{ id, name, description, isPublic, ownerId, ownerName, createdAt, songCount, likeCount }`
- `PlaylistDetail` = `Playlist` + `songs: [Song]` (เรียงตามลำดับในลิสต์)
- `Member` = `{ id, email, displayName, role, createdAt }`

## guest
| Method | Path | ตอบ |
|---|---|---|
| POST | /api/auth/register | 201 `Member` · 400 ข้อมูลไม่ครบ/รหัสสั้นกว่า 4 · 409 อีเมลซ้ำ |
| POST | /api/auth/login | 200 `{token, member}` · 401 อีเมลหรือรหัสผ่านผิด |
| GET | /api/songs?q=&genre=&limit=&offset= | 200 `{items:[Song], total}` (limit ตั้งต้น 24 สูงสุด 100) |
| GET | /api/songs/{id} | 200 `Song` · 404 |
| GET | /api/genres | 200 `{items:["Pop",...]}` |
| GET | /api/artists?q= | 200 `{items:[Artist]}` |
| GET | /api/artists/{id} | 200 `Artist` + `songs:[Song]` · 404 |
| GET | /api/playlists?q= | 200 `{items:[Playlist]}` เฉพาะที่เป็นสาธารณะ เรียงตามยอดถูกใจ |
| GET | /api/playlists/{id} | 200 `PlaylistDetail` · 404 (รวมกรณีเป็นส่วนตัว) |

## member (ต้อง login ไม่งั้น 401)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/me | | 200 `{member}` |
| PUT | /api/me | `{displayName}` | 200 `{member}` · 400 |
| PUT | /api/me/password | `{currentPassword,newPassword}` | 200 `{ok:true}` · 400 รหัสเดิมผิด/รหัสใหม่สั้น |
| GET | /api/me/playlists | | 200 `{items:[Playlist]}` ของตัวเอง |
| POST | /api/me/playlists | `{name,description,isPublic}` | 201 `Playlist` · 400 |
| GET | /api/me/playlists/{id} | | 200 `PlaylistDetail` · 404 (ไม่ใช่ของตัวเอง) |
| PUT | /api/me/playlists/{id} | `{name,description,isPublic}` | 200 `Playlist` · 404 |
| DELETE | /api/me/playlists/{id} | | 204 · 404 |
| PUT | /api/me/playlists/{id}/songs/{songId} | | 204 เพิ่มต่อท้าย (ซ้ำไม่ error) · 404 ลิสต์/เพลงไม่มี |
| DELETE | /api/me/playlists/{id}/songs/{songId} | | 204 |
| PUT | /api/me/playlists/{id}/order | `{songIds:[...]}` | 200 `PlaylistDetail` · 400 ถ้าไม่ตรงกับเพลงในลิสต์ทุกเพลง |
| PUT | /api/playlists/{id}/like | | 200 `{liked:true, likeCount}` · 404 (ลิสต์ส่วนตัวของคนอื่น) |
| DELETE | /api/playlists/{id}/like | | 200 `{liked:false, likeCount}` |
| GET | /api/me/likes | | 200 `{items:[Playlist]}` |
| POST | /api/songs/{id}/play | | 204 บันทึกประวัติการฟัง · 404 |
| GET | /api/me/history | | 200 `{items:[Song + playedAt]}` 50 รายการล่าสุด |

## admin (ไม่ login 401 · เป็น member 403)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/admin/stats | | 200 `{members,admins,songs,artists,playlists,plays,topSongs,newestMembers}` |
| GET | /api/admin/members | | 200 `{items:[Member]}` |
| PUT | /api/admin/members/{id}/role | `{role}` | 200 `Member` · 400 เปลี่ยนของตัวเอง |
| POST | /api/admin/songs | `{title, artistId หรือ artistName, album, genre, year, durationSec, coverUrl, previewUrl, externalId}` | 201 `Song` · 400 · 409 externalId ซ้ำ |
| PUT | /api/admin/songs/{id} | เหมือน POST (externalId แก้ไม่ได้) | 200 `Song` · 404 |
| DELETE | /api/admin/songs/{id} | | 204 · 404 (ลบจากเพลย์ลิสต์และประวัติตามด้วย) |
| POST | /api/admin/artists | `{name,bio,imageUrl}` | 201 `Artist` · 409 ชื่อซ้ำ |
| PUT | /api/admin/artists/{id} | เหมือน POST | 200 `Artist` · 404 · 409 |
| DELETE | /api/admin/artists/{id} | | 204 · 404 · 409 ถ้ายังมีเพลงของศิลปินนี้ |
| GET | /api/admin/playlists | | 200 `{items:[Playlist]}` ทุกลิสต์ รวมส่วนตัว |
| DELETE | /api/admin/playlists/{id} | | 204 · 404 |

`GET /healthz` -> `{"status":"ok"}` ไว้เช็กว่า server ตื่นอยู่ (Render ฟรีหลับเมื่อไม่มีคนใช้)
