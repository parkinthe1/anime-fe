# สัญญา API ระหว่าง FE (React) กับ BE (Go)

กติกา: ทุก endpoint ตอบ JSON, prefix `/api`, field แบบ camelCase, error ทุกตัวตอบ `{ "error": "ข้อความ" }`
ตั๋ว (token) ส่งใน header `Authorization: Bearer <token>` — **สิทธิ์ตรวจที่ Go ทุกครั้ง** FE ซ่อนหน้าเฉยๆ ไม่ใช่การป้องกัน

บทบาท: `guest` (ไม่มี token) / `member` / `admin`

## guest
| Method | Path | ตอบ |
|---|---|---|
| POST | /api/auth/register | 201 `{id,email,displayName,role}` · 400 ข้อมูลไม่ครบ/รหัสสั้นกว่า 4 · 409 อีเมลซ้ำ |
| POST | /api/auth/login | 200 `{token, member}` · 401 อีเมลหรือรหัสผ่านผิด |
| GET | /api/anime | 200 `{items:[Anime]}` |
| GET | /api/anime/{id} | 200 `Anime + voteAverage, voteCount` · 404 |
| GET | /api/anime/{id}/reviews | 200 `{items:[{id,text,createdAt,score,member:{id,displayName}}]}` |

`Anime` = `{ id, title, titleTh, year, genre, rating, episodes, status("airing"|"finished"|"upcoming"), poster, synopsis }`

## member (ต้อง login ไม่งั้น 401)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/me | | 200 `{member}` |
| PUT | /api/me | `{displayName}` | 200 `{member}` · 400 สั้นกว่า 2 ตัว |
| PUT | /api/me/password | `{currentPassword,newPassword}` | 200 `{ok:true}` · 400 รหัสเดิมผิด / รหัสใหม่สั้นกว่า 4 |
| POST | /api/anime/{id}/reviews | `{text}` | 201 `{id,text,createdAt}` · 400 สั้นกว่า 10 ตัว |
| PUT | /api/anime/{id}/vote | `{score}` | 200 · 400 ไม่ใช่ 1–10 |
| GET | /api/me/wishlist | | 200 `{items:[Anime]}` |
| PUT | /api/me/wishlist/{id} | | 200 |
| DELETE | /api/me/wishlist/{id} | | 204 |

## admin (member ได้ 403)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/admin/stats | | 200 `{anime,members,admins,votes,wishlistItems,topVoted[],newestMembers[]}` |
| GET | /api/admin/members | | 200 `{items:[member]}` |
| PUT | /api/admin/members/{id}/role | `{role}` | 200 member · 400 เปลี่ยนของตัวเอง |
| GET | /api/admin/anime/{id} | | 200 Anime |
| POST | /api/admin/anime | Anime (ไม่มี id) | 201 · 400 ไม่มีชื่อเรื่อง |
| PUT | /api/admin/anime/{id} | Anime | 200 |
| DELETE | /api/admin/anime/{id} | | 204 |

## CORS
อนุญาต origin `http://localhost:3000` และโดเมน Vercel ของทีม, header `Authorization, Content-Type`, method `GET POST PUT DELETE OPTIONS`

mock ที่ `mock/server.js` ทำตามสัญญานี้ครบ ใช้ทดสอบ FE ได้ก่อน Go เสร็จ
