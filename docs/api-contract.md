# สัญญา API ระหว่าง FE (React) กับ BE (Go)

กติกา: ทุก endpoint ตอบ JSON, prefix `/api`, field แบบ camelCase, error ทุกตัวตอบ `{ "error": "ข้อความ" }`
ตั๋ว (token) ส่งใน header `Authorization: Bearer <token>` — **สิทธิ์ตรวจที่ Go ทุกครั้ง** FE ซ่อนหน้าเฉยๆ ไม่ใช่การป้องกัน

บทบาท: `guest` (ไม่มี token) / `member` / `admin`

## guest
| Method | Path | ตอบ |
|---|---|---|
| POST | /api/auth/register | 201 `{id,email,displayName,role}` · 400 ข้อมูลไม่ครบ/รหัสสั้นกว่า 4 · 409 อีเมลซ้ำ |
| POST | /api/auth/login | 200 `{token, member}` · 401 อีเมลหรือรหัสผ่านผิด |
| GET | /api/anime-overrides | 200 `{items:[Override]}` ข้อมูลที่ admin แก้ทับข้อมูลของ TENRAI (เฉพาะเรื่องที่เคยแก้) |
| GET | /api/anime/{id}/stats | 200 `{voteAverage, voteCount}` (ยังไม่มีโหวต = `null, 0`) · 400 id ไม่ใช่เลขบวก |
| GET | /api/anime/{id}/reviews | 200 `{items:[{id,text,createdAt,score,member:{id,displayName}}]}` |

**ข้อมูลอนิเมะ (ชื่อ โปสเตอร์ เรื่องย่อ) FE ดึงจาก TENRAI API โดยตรง** (`src/api/tenrai.js`) และใช้ `mal_id` ของ TENRAI เป็น `{id}` ในทุก endpoint ด้านล่าง
ส่วน Go เก็บเฉพาะข้อมูลของสมาชิก (คะแนน รีวิว wishlist) โดยอ้าง id นี้ ไม่ต้องมีข้อมูลอนิเมะของเรื่องนั้นอยู่ในฐานข้อมูล

`Override` = `{ id, titleTh, genre, poster, synopsis }` — `id` คือ id ของ TENRAI ส่วน 4 ช่องที่เหลือเป็น `string | null` (`null` = ไม่ได้แก้ ใช้ของ TENRAI)
FE ผสมเข้ากับข้อมูลของ TENRAI เอง (`src/api/catalog.js`) ถ้าดึง `/api/anime-overrides` ไม่ได้ หน้าเว็บยังแสดงข้อมูลของ TENRAI ได้ตามปกติ

`Anime` (รูปร่างที่ FE ใช้หลังดึงจาก TENRAI แล้วผสม Override) = `{ id, title, titleTh, year, genre, rating, episodes, status("airing"|"finished"|"upcoming"), poster, synopsis }`

> `GET /api/anime`, `GET /api/anime/{id}` และตาราง `anime` ในฐานข้อมูลเป็นของรุ่นก่อนที่เก็บรายการอนิเมะเองและ FE ไม่เรียกแล้ว

## member (ต้อง login ไม่งั้น 401)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/me | | 200 `{member}` |
| PUT | /api/me | `{displayName}` | 200 `{member}` · 400 สั้นกว่า 2 ตัว |
| PUT | /api/me/password | `{currentPassword,newPassword}` | 200 `{ok:true}` · 400 รหัสเดิมผิด / รหัสใหม่สั้นกว่า 4 |
| POST | /api/anime/{id}/reviews | `{text}` | 201 `{id,text,createdAt}` · 400 สั้นกว่า 10 ตัว หรือ id ไม่ถูกต้อง |
| PUT | /api/anime/{id}/vote | `{score}` | 200 `{score,voteAverage,voteCount}` · 400 ไม่ใช่ 1–10 |
| GET | /api/me/wishlist | | 200 `{items:[{id}]}` มีแค่ id ชื่อ/โปสเตอร์ FE ไปดึงจาก TENRAI |
| PUT | /api/me/wishlist/{id} | | 200 `{animeId}` · 400 id ไม่ถูกต้อง |
| DELETE | /api/me/wishlist/{id} | | 204 |

## admin (member ได้ 403)
| Method | Path | Body | ตอบ |
|---|---|---|---|
| GET | /api/admin/stats | | 200 `{overrides,members,admins,votes,wishlistItems,topVoted:[{id,voteAverage,voteCount}],newestMembers[]}` (`overrides` = จำนวนอนิเมะที่ admin แก้ข้อมูล) (`topVoted` มีแค่ id FE ไปดึงชื่อจาก TENRAI) |
| GET | /api/admin/members | | 200 `{items:[member]}` |
| PUT | /api/admin/members/{id}/role | `{role}` | 200 member · 400 เปลี่ยนของตัวเอง |
| PUT | /api/admin/anime-overrides/{id} | `{titleTh,genre,poster,synopsis}` (ช่องที่ไม่แก้ส่ง `null` หรือเว้นว่าง) | 200 Override · 400 id ไม่ถูกต้อง / ทุกช่องว่าง / `poster` ไม่ขึ้นต้น http(s):// / ข้อความยาวเกิน |
| DELETE | /api/admin/anime-overrides/{id} | | 204 (กลับไปใช้ข้อมูลของ TENRAI ทั้งหมด ลบซ้ำได้ ไม่ error) |

## CORS
อนุญาต origin `http://localhost:3000` และโดเมน Vercel ของทีม, header `Authorization, Content-Type`, method `GET POST PUT DELETE OPTIONS`

mock ที่ `mock/server.js` ทำตามสัญญานี้ครบ ใช้ทดสอบ FE ได้ก่อน Go เสร็จ
