// Backend จำลอง (พอร์ต 4000) ทำตามสัญญาใน docs/api-contract.md ใช้ระหว่างที่ทีม Go ยังไม่เสร็จ
// ข้อมูลอยู่ในหน่วยความจำ ปิดแล้วหาย / รหัสผ่านเก็บตรง ๆ เพราะเป็นของจำลอง (Go จริงต้อง hash)
const express = require('express');
const cors = require('cors');
const anime = require('./anime.json');

const app = express();
app.use(cors());
app.use(express.json());

const members = [
  { id: 1, email: 'demo@aniwave.test', password: '1234', displayName: 'Demo', role: 'member', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 2, email: 'admin@aniwave.test', password: '1234', displayName: 'Admin', role: 'admin', createdAt: '2026-09-01T09:00:00.000Z' },
];
const reviews = [];                 // { id, animeId, memberId, text, createdAt }
const votes = new Map();            // `${animeId}:${memberId}` -> score
const wishlist = new Map();         // memberId -> Set(animeId)
const overrides = new Map();        // animeId (ของ TENRAI) -> { id, titleTh, genre, poster, synopsis }
let nextMemberId = 3, nextReviewId = 1;

const publicMember = (m) => ({ id: m.id, email: m.email, displayName: m.displayName, role: m.role, createdAt: m.createdAt });
const fail = (res, status, error) => res.status(status).json({ error });
// id ของอนิเมะที่สมาชิกให้คะแนน/รีวิว/เก็บ wishlist คือ mal_id ของ TENRAI backend ไม่มีข้อมูลเรื่องนั้น จึงตรวจแค่ว่าเป็นเลขจำนวนเต็มบวก
const validAnimeId = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

// ---------- middleware ----------
function login(req, res, next) {
  const raw = (req.headers.authorization || '').replace('Bearer ', '');
  const id = Number(raw.split('.')[1]);
  const m = raw.startsWith('mock.') ? members.find(x => x.id === id) : null;
  if (!m) return fail(res, 401, 'กรุณาเข้าสู่ระบบ');
  req.member = m;
  next();
}
function admin(req, res, next) {
  login(req, res, () => (req.member.role === 'admin' ? next() : fail(res, 403, 'สำหรับ admin เท่านั้น')));
}

// ---------- สมาชิก ----------
app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !displayName || !password || password.length < 4) return fail(res, 400, 'กรอกข้อมูลไม่ครบ หรือรหัสผ่านสั้นกว่า 4 ตัว');
  if (members.some(m => m.email === email)) return fail(res, 409, 'อีเมลนี้ถูกใช้แล้ว');
  const m = { id: nextMemberId++, email, password, displayName, role: 'member', createdAt: new Date().toISOString() };
  members.push(m);
  res.status(201).json(publicMember(m));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const m = members.find(x => x.email === email && x.password === password);
  if (!m) return fail(res, 401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  res.json({ token: `mock.${m.id}.${Math.random().toString(36).slice(2)}`, member: publicMember(m) });
});

app.get('/api/me', login, (req, res) => res.json({ member: publicMember(req.member) }));

app.put('/api/me', login, (req, res) => {
  const name = String(req.body?.displayName ?? '').trim();
  if (name.length < 2) return fail(res, 400, 'ชื่อที่แสดงต้องยาวอย่างน้อย 2 ตัวอักษร');
  req.member.displayName = name;
  res.json({ member: publicMember(req.member) });
});

app.put('/api/me/password', login, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (currentPassword !== req.member.password) return fail(res, 400, 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
  if (!newPassword || newPassword.length < 4) return fail(res, 400, 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 4 ตัวอักษร');
  req.member.password = newPassword;
  res.json({ ok: true });
});

// ---------- อนิเมะ (สาธารณะ) ----------
const voteStats = (id) => {
  const scores = [...votes].filter(([k]) => k.startsWith(`${id}:`)).map(([, v]) => v);
  return { voteCount: scores.length, voteAverage: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null };
};

app.get('/api/anime', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const items = anime.filter(a => !q || a.title.toLowerCase().includes(q) || (a.titleTh || '').toLowerCase().includes(q));
  res.json({ items });
});

app.get('/api/anime-overrides', (req, res) => res.json({ items: [...overrides.values()].sort((a, b) => a.id - b.id) }));

app.get('/api/anime/:id', (req, res) => {
  const a = anime.find(x => x.id === Number(req.params.id));
  if (!a) return fail(res, 404, 'ไม่พบอนิเมะเรื่องนี้');
  res.json({ ...a, ...voteStats(a.id) });
});

app.get('/api/anime/:id/stats', (req, res) => {
  if (!validAnimeId(req.params.id)) return fail(res, 400, 'id ไม่ถูกต้อง');
  res.json(voteStats(Number(req.params.id)));
});

app.get('/api/anime/:id/reviews', (req, res) => {
  const items = reviews
    .filter(r => r.animeId === Number(req.params.id))
    .map(r => {
      const m = members.find(x => x.id === r.memberId);
      return { id: r.id, text: r.text, createdAt: r.createdAt, member: { id: m.id, displayName: m.displayName }, score: votes.get(`${r.animeId}:${r.memberId}`) ?? null };
    })
    .reverse();
  res.json({ items });
});

app.post('/api/anime/:id/reviews', login, (req, res) => {
  const animeId = Number(req.params.id);
  if (!validAnimeId(animeId)) return fail(res, 400, 'id ไม่ถูกต้อง');
  const text = String(req.body?.text ?? '').trim();
  if (text.length < 10) return fail(res, 400, 'รีวิวสั้นเกินไป (อย่างน้อย 10 ตัวอักษร)');
  const r = { id: nextReviewId++, animeId, memberId: req.member.id, text, createdAt: new Date().toISOString() };
  reviews.push(r);
  res.status(201).json({ id: r.id, text: r.text, createdAt: r.createdAt });
});

app.put('/api/anime/:id/vote', login, (req, res) => {
  const animeId = Number(req.params.id);
  const score = Number(req.body?.score);
  if (!validAnimeId(animeId)) return fail(res, 400, 'id ไม่ถูกต้อง');
  if (!Number.isInteger(score) || score < 1 || score > 10) return fail(res, 400, 'คะแนนต้องเป็นเลข 1 ถึง 10');
  votes.set(`${animeId}:${req.member.id}`, score);
  res.json({ score, ...voteStats(animeId) });
});

// ---------- wishlist ----------
const listOf = (memberId) => { if (!wishlist.has(memberId)) wishlist.set(memberId, new Set()); return wishlist.get(memberId); };
app.get('/api/me/wishlist', login, (req, res) => res.json({ items: [...listOf(req.member.id)].map(id => ({ id })) }));   // มีแค่ id ชื่อ/โปสเตอร์ FE ไปดึงจาก TENRAI
app.put('/api/me/wishlist/:id', login, (req, res) => {
  const id = Number(req.params.id);
  if (!validAnimeId(id)) return fail(res, 400, 'id ไม่ถูกต้อง');
  listOf(req.member.id).add(id);
  res.json({ animeId: id });
});
app.delete('/api/me/wishlist/:id', login, (req, res) => { listOf(req.member.id).delete(Number(req.params.id)); res.status(204).end(); });

// ---------- หลังบ้าน (admin เท่านั้น ตรวจที่ server ทุกครั้ง) ----------
app.get('/api/admin/stats', admin, (req, res) => {
  const votedIds = [...new Set([...votes.keys()].map(k => Number(k.split(':')[0])))];
  const topVoted = votedIds
    .map(id => ({ id, ...voteStats(id) }))                 // ชื่อเรื่อง FE ไปดึงจาก TENRAI ด้วย id
    .sort((a, b) => b.voteAverage - a.voteAverage || b.voteCount - a.voteCount)
    .slice(0, 5);
  res.json({
    overrides: overrides.size,
    members: members.length,
    admins: members.filter(m => m.role === 'admin').length,
    votes: votes.size,
    wishlistItems: [...wishlist.values()].reduce((n, s) => n + s.size, 0),
    topVoted,
    newestMembers: [...members].reverse().slice(0, 5).map(publicMember),
  });
});

app.get('/api/admin/members', admin, (req, res) => res.json({ items: members.map(publicMember) }));

app.put('/api/admin/members/:id/role', admin, (req, res) => {
  const m = members.find(x => x.id === Number(req.params.id));
  const role = req.body?.role;
  if (!m) return fail(res, 404, 'ไม่พบสมาชิก');
  if (!['member', 'admin'].includes(role)) return fail(res, 400, 'role ต้องเป็น member หรือ admin');
  if (m.id === req.member.id) return fail(res, 400, 'เปลี่ยนบทบาทของตัวเองไม่ได้ ให้ admin คนอื่นทำแทน');
  m.role = role;
  res.json(publicMember(m));
});

// ---------- ข้อมูลที่ admin แก้ทับข้อมูลของ TENRAI (ชื่อไทย แนว โปสเตอร์ เรื่องย่อ) อ้างด้วย id ของ TENRAI ----------
const OVERRIDE_LIMITS = { titleTh: 255, genre: 50, poster: 2000, synopsis: 5000 };
app.put('/api/admin/anime-overrides/:id', admin, (req, res) => {
  const id = Number(req.params.id);
  if (!validAnimeId(id)) return fail(res, 400, 'id ไม่ถูกต้อง');
  const value = { id };
  for (const [field, max] of Object.entries(OVERRIDE_LIMITS)) {
    const raw = req.body?.[field];
    const t = raw == null ? '' : String(raw).trim();
    if (t.length > max) return fail(res, 400, `${field} ยาวเกิน ${max} ตัวอักษร`);
    value[field] = t === '' ? null : t;
  }
  if (value.poster && !/^https?:\/\//i.test(value.poster)) return fail(res, 400, 'ลิงก์โปสเตอร์ต้องขึ้นต้นด้วย http:// หรือ https://');
  if (Object.keys(OVERRIDE_LIMITS).every(f => value[f] === null)) return fail(res, 400, 'ไม่มีข้อมูลที่จะแก้ไข ถ้าจะกลับไปใช้ข้อมูลของ TENRAI ให้ลบแทน');
  overrides.set(id, value);
  res.json(value);
});
app.delete('/api/admin/anime-overrides/:id', admin, (req, res) => {
  overrides.delete(Number(req.params.id));
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AniWave mock backend: http://localhost:${PORT}`));
