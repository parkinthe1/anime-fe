# MusicKen (Frontend — React)

เว็บเพลย์ลิสต์เพลง · **React + React Router + Tailwind CSS** · deploy บน **Vercel** · คุยกับ Backend (Go, deploy บน Render) ผ่าน `src/api/backend.js` ไฟล์เดียว
Backend อยู่อีก repo หนึ่ง (`musicken-be`) รายละเอียด endpoint ดูที่ `docs/api-contract.md`

## ฟีเจอร์ตามบทบาท

| บทบาท | ทำอะไรได้ |
|---|---|
| guest | ดูและค้นหาเพลง ศิลปิน เพลย์ลิสต์สาธารณะ ฟังเสียงตัวอย่าง 30 วินาที สมัคร/เข้าสู่ระบบ |
| member | แก้โปรไฟล์ เปลี่ยนรหัสผ่าน สร้าง/แก้/ลบเพลย์ลิสต์ เพิ่ม-เอาเพลงออก เลื่อนลำดับเพลง กดถูกใจเพลย์ลิสต์ ดูประวัติการฟัง |
| admin | หลังบ้านที่ `/admin`: ภาพรวมสถิติ จัดการเพลง ศิลปิน เพลย์ลิสต์ สมาชิก (เปลี่ยนบทบาท) |

หน้าที่ต้อง login ครอบด้วย `ProtectedRoute` หน้า admin ครอบด้วย `RequireRole` แต่นั่นเป็นแค่การซ่อนหน้า
**สิทธิ์จริงตรวจที่ Go ทุก request** (ไม่ login 401 / ไม่ใช่ admin 403)

ทุกหน้าที่ดึงข้อมูลมี 3 สถานะ: **loading** (`กำลังโหลด...`), **error** (กล่องแดง + ปุ่มลองใหม่) และ **empty** (ข้อความบอกว่าไม่มีข้อมูล)

## โครงสร้างโปรเจกต์

```
src/
  api/backend.js        ตัวเดียวที่ fetch ไป Go (ทุกหน้าเรียกผ่านที่นี่)
  auth/AuthContext.jsx  login/logout/register/token (Context) เก็บ token ใน localStorage
  player/               PlayerContext: ตัวเล่นเสียงตัวอย่างตัวเดียวของเว็บ + บันทึกประวัติการฟัง
  components/           ชิ้นส่วนที่ใช้ซ้ำ: Navbar, Footer, SongList, PlaylistCard/Grid, AddToPlaylist, Pagination, ProtectedRoute, RequireRole
  components/common/    States.jsx: Loading / ErrorBox / EmptyBox / ConfirmBox และสไตล์ปุ่ม
  pages/                หน้าของ guest และ member (Home, Songs, Playlists, MyPlaylists, Profile, ...)
  pages/admin/          หน้าหลังบ้าน (Layout, Dashboard, Songs, SongForm, Artists, Playlists, Members)
  utils/format.js       แปลงความยาวเพลง / วันที่
  App.jsx               เส้นทางทั้งหมด แบ่งกลุ่ม guest / member / admin
```
ไฟล์ `*.test.jsx` อยู่ข้างไฟล์ที่ทดสอบ

## รันในเครื่อง

ต้องมี Node 20

```bash
npm ci
cp .env.example .env     # ปล่อย REACT_APP_API_URL ว่างไว้ = ใช้ proxy ไป Go ที่ http://localhost:8080
npm start                # เปิด http://localhost:3000 (ต้องรัน Go ไว้ด้วย)
```

## เทสต์

```bash
npm test -- --watchAll=false
```
ใช้ React Testing Library + Jest (mock ชั้น `api/backend` ไม่ยิง server จริง) ครอบคลุม
- ระบบสมาชิก: Login, Register, Profile (แก้ชื่อ/เปลี่ยนรหัสผ่าน)
- สิทธิ์: ProtectedRoute, RequireRole (guest / member / admin)
- เพลง: SongList (loading/error/empty/เล่น), Songs (ค้นหา/กรองแนว/แบ่งหน้า)
- เพลย์ลิสต์: AddToPlaylist, MyPlaylistDetail (เลื่อนลำดับ/เอาเพลงออก/แก้/ลบ), PlaylistDetail (ถูกใจ)
- admin: AdminSongs (ลบต้องยืนยัน), AdminMembers (เปลี่ยนบทบาท)
- ชั้น API: backend.test.js (แนบ token, body, 204, error)

## Deploy บน Vercel

1. push โค้ดโฟลเดอร์นี้ขึ้น GitHub (repo ของ frontend)
2. Vercel → **Add New → Project** → เลือก repo → Framework Preset: **Create React App** (Build: `npm run build`, Output: `build`)
3. Environment Variables: `REACT_APP_API_URL` = `https://<ชื่อ>.onrender.com` (ไม่มี `/` ท้าย)
4. Deploy แล้วนำโดเมนที่ได้ไปใส่ใน `CORS_ORIGINS` ของ Backend บน Render (แล้วให้ Render deploy ใหม่)
5. `vercel.json` ตั้ง rewrite ไว้แล้ว เปิดลิงก์ลึก เช่น `/playlists/3` ตรงๆ หรือกด refresh ก็ไม่ขึ้น 404

> ตัวแปร `REACT_APP_*` ถูกฝังตอน build ถ้าเพิ่มหรือแก้ทีหลังต้อง Redeploy
