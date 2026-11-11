import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Search, Bookmark, BookmarkCheck, Star, Play, Menu, X, Home, Compass, UserRound, Shield, LogOut, Plus, Trash2, Clapperboard, Sparkles, ChevronRight } from "lucide-react";
import { animeList, genres } from "./data";

const readStore = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return <header className="topbar">
    <Link to="/" className="brand"><span className="brand-mark">A</span><span>ANI<span className="accent">WAVE</span></span></Link>
    <nav className={open ? "nav-links show" : "nav-links"}>
      <NavLink to="/" end onClick={() => setOpen(false)}><Home size={16}/> หน้าแรก</NavLink>
      <NavLink to="/explore" onClick={() => setOpen(false)}><Compass size={16}/> สำรวจอนิเมะ</NavLink>
      <NavLink to="/watchlist" onClick={() => setOpen(false)}><Bookmark size={16}/> Watchlist</NavLink>
    </nav>
    <div className="header-actions">
      {user ? <><Link to="/profile" className="avatar">{user.name?.[0]?.toUpperCase() || "U"}</Link><button className="icon-button" title="ออกจากระบบ" onClick={onLogout}><LogOut size={18}/></button></> : <><Link className="btn btn-ghost small" to="/login">เข้าสู่ระบบ</Link><Link className="btn btn-primary small" to="/register">สมัครสมาชิก</Link></>}
    </div>
    <button className="mobile-menu icon-button" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </header>;
}

function AnimeCard({ anime, saved, onToggle }) {
  return <article className="anime-card">
    <Link to={`/anime/${anime.id}`} className="poster-wrap">
      <img src={anime.image} alt={anime.title} loading="lazy"/>
      <span className="poster-type">{anime.type}</span>
      <span className="poster-score"><Star size={12} fill="currentColor"/> {anime.score}</span>
      <span className="poster-overlay"><span className="play-circle"><Play fill="currentColor" size={18}/></span></span>
    </Link>
    <div className="card-info">
      <Link to={`/anime/${anime.id}`} className="card-title">{anime.title}</Link>
      <div className="card-meta"><span>{anime.year}</span><i/> <span>{anime.episodes} ตอน</span></div>
      <button className={`save-button ${saved ? "saved" : ""}`} onClick={() => onToggle(anime.id)} aria-label="บันทึกเข้ารายการ">{saved ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>}</button>
    </div>
  </article>;
}

function SectionTitle({ eyebrow, title, action }) {
  return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>;
}

function HomePage({ saved, onToggle }) {
  const featured = animeList[0];
  return <main>
    <section className="hero" style={{backgroundImage:`linear-gradient(90deg, #09090f 0%, rgba(9,9,15,.88) 38%, rgba(9,9,15,.12) 100%), linear-gradient(0deg,#09090f 0%,transparent 45%), url(${featured.banner})`}}>
      <div className="hero-content">
        <div className="eyebrow"><Sparkles size={14}/> ANIME OF THE DAY</div>
        <div className="hero-kicker">FEATURED SERIES · {featured.year}</div>
        <h1>{featured.title}<span>.</span></h1>
        <p>{featured.description}</p>
        <div className="hero-meta"><span className="rating"><Star size={15} fill="currentColor"/> {featured.score}</span><span>{featured.type}</span><span>{featured.episodes} Episodes</span><span className="status">{featured.status}</span></div>
        <div className="hero-buttons"><Link to={`/anime/${featured.id}`} className="btn btn-primary"><Play size={17} fill="currentColor"/> ดูรายละเอียด</Link><button className="btn btn-ghost" onClick={() => onToggle(featured.id)}>{saved.includes(featured.id) ? <BookmarkCheck size={17}/> : <Plus size={17}/>} Watchlist</button></div>
      </div>
      <div className="hero-index"><span>01</span> / 08</div>
    </section>
    <div className="page-container">
      <section className="content-section">
        <SectionTitle eyebrow="HANDPICKED FOR YOU" title="อนิเมะแนะนำ" action={<Link className="text-link" to="/explore">ดูทั้งหมด <ChevronRight size={16}/></Link>}/>
        <div className="anime-grid">{animeList.slice(0,4).map(a => <AnimeCard key={a.id} anime={a} saved={saved.includes(a.id)} onToggle={onToggle}/>)}</div>
      </section>
      <section className="content-section">
        <SectionTitle eyebrow="TRENDING NOW" title="กำลังเป็นกระแส"/>
        <div className="anime-grid">{animeList.slice(4).map(a => <AnimeCard key={a.id} anime={a} saved={saved.includes(a.id)} onToggle={onToggle}/>)}</div>
      </section>
      <section className="promo-strip"><div><div className="eyebrow">YOUR PERSONAL ANIME SPACE</div><h2>อนิเมะเรื่องโปรดของคุณ<br/>รวมไว้ในที่เดียว</h2><p>สร้าง Watchlist และเก็บทุกเรื่องที่อยากดูไว้ได้เลย</p><Link to="/register" className="btn btn-primary">เริ่มต้นใช้งาน <ChevronRight size={16}/></Link></div><div className="promo-symbol">アニメ</div></section>
    </div>
  </main>;
}

function ExplorePage({ saved, onToggle }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("ทั้งหมด");
  const [sort, setSort] = useState("popular");
  const filtered = useMemo(() => animeList.filter(a => (a.title.toLowerCase().includes(query.toLowerCase()) || a.japanese.toLowerCase().includes(query.toLowerCase())) && (genre === "ทั้งหมด" || a.genres.includes(genre))).sort((a,b) => sort === "score" ? b.score-a.score : sort === "new" ? b.year-a.year : b.score-a.score), [query, genre, sort]);
  return <main className="page-container inner-page">
    <div className="page-heading"><div className="eyebrow">FIND YOUR NEXT FAVORITE</div><h1>สำรวจอนิเมะ<span>.</span></h1><p>ค้นหาเรื่องที่ใช่ จากคลังอนิเมะที่เราคัดมาให้</p></div>
    <div className="filter-bar"><label className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาชื่ออนิเมะ..."/></label><select value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(g=><option key={g}>{g}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">คะแนนสูงสุด</option><option value="new">ใหม่ล่าสุด</option></select></div>
    <div className="result-line">พบ {filtered.length} เรื่อง</div>
    {filtered.length ? <div className="anime-grid">{filtered.map(a=><AnimeCard key={a.id} anime={a} saved={saved.includes(a.id)} onToggle={onToggle}/>)}</div> : <div className="empty-state"><Search size={32}/><h3>ไม่พบอนิเมะที่ค้นหา</h3><p>ลองเปลี่ยนคำค้นหาหรือประเภทอนิเมะ</p></div>}
  </main>;
}

function DetailPage({ saved, onToggle }) {
  const { id } = useParams();
  const anime = animeList.find(a=>a.id === Number(id));
  if (!anime) return <main className="page-container inner-page"><div className="empty-state"><h2>ไม่พบอนิเมะเรื่องนี้</h2><Link className="btn btn-primary" to="/explore">กลับไปสำรวจ</Link></div></main>;
  return <main className="detail-page">
    <div className="detail-backdrop" style={{backgroundImage:`linear-gradient(0deg,#09090f 0%,rgba(9,9,15,.45) 100%),url(${anime.banner})`}}/>
    <div className="page-container detail-content"><Link to="/explore" className="back-link">← กลับไปหน้า Explore</Link><div className="detail-layout"><img className="detail-poster" src={anime.image} alt={anime.title}/><div className="detail-info"><div className="eyebrow">ANIME DETAIL · {anime.year}</div><h1>{anime.title}</h1><div className="japanese-title">{anime.japanese}</div><div className="detail-stats"><span className="rating"><Star size={16} fill="currentColor"/> {anime.score}</span><span>{anime.type}</span><span>{anime.episodes} ตอน</span><span>{anime.status}</span></div><div className="genre-list">{anime.genres.map(g=><span key={g}>{g}</span>)}</div><h3>เรื่องย่อ</h3><p className="synopsis">{anime.description}</p><div className="hero-buttons"><button className="btn btn-primary" onClick={()=>onToggle(anime.id)}>{saved.includes(anime.id)?<BookmarkCheck size={17}/>:<Bookmark size={17}/>} {saved.includes(anime.id)?"บันทึกแล้ว":"เพิ่มลง Watchlist"}</button><button className="btn btn-ghost" onClick={()=>alert("ส่วนดูวิดีโอจะเชื่อมต่อในเวอร์ชันถัดไป") }><Play size={17}/> ดูตัวอย่าง</button></div></div></div></div>
  </main>;
}

function WatchlistPage({ saved, onToggle }) {
  const items = animeList.filter(a=>saved.includes(a.id));
  return <main className="page-container inner-page"><div className="page-heading"><div className="eyebrow">YOUR COLLECTION</div><h1>Watchlist<span>.</span></h1><p>อนิเมะที่คุณบันทึกไว้ ({items.length} เรื่อง)</p></div>{items.length ? <div className="anime-grid">{items.map(a=><AnimeCard key={a.id} anime={a} saved onToggle={onToggle}/>)}</div> : <div className="empty-state"><Bookmark size={34}/><h3>Watchlist ยังว่างอยู่</h3><p>ไปเลือกอนิเมะที่สนใจแล้วกดบันทึกไว้ได้เลย</p><Link to="/explore" className="btn btn-primary">สำรวจอนิเมะ</Link></div>}</main>;
}

function AuthPage({ mode, onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({name:"",email:"",password:""});
  const submit = e => { e.preventDefault(); onLogin({name:form.name || form.email.split("@")[0] || "Anime Fan", email:form.email}); navigate("/"); };
  return <main className="auth-page"><div className="auth-card"><div className="auth-logo"><span className="brand-mark">A</span></div><div className="eyebrow">{mode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}</div><h1>{mode === "login" ? "ยินดีต้อนรับกลับ" : "สร้างบัญชีใหม่"}<span>.</span></h1><p>{mode === "login" ? "เข้าสู่ระบบเพื่อจัดการ Anime Watchlist ของคุณ" : "เริ่มบันทึกอนิเมะเรื่องโปรดของคุณได้เลย"}</p><form onSubmit={submit}>{mode === "register" && <label>ชื่อที่แสดง<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="ชื่อของคุณ"/></label>}<label>อีเมล<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="name@example.com"/></label><label>รหัสผ่าน<input required minLength="4" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="อย่างน้อย 4 ตัวอักษร"/></label><button className="btn btn-primary full" type="submit">{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button></form><div className="auth-switch">{mode === "login" ? <>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link></> : <>มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></>}</div><div className="demo-note">โหมดทดลอง: ข้อมูลบัญชีจะถูกเก็บไว้ในเบราว์เซอร์เท่านั้น</div></div></main>;
}

function ProfilePage({ user, onLogout }) {
  if (!user) return <main className="page-container inner-page"><div className="empty-state"><UserRound size={32}/><h3>กรุณาเข้าสู่ระบบ</h3><Link to="/login" className="btn btn-primary">เข้าสู่ระบบ</Link></div></main>;
  return <main className="page-container inner-page"><div className="page-heading"><div className="eyebrow">YOUR ACCOUNT</div><h1>โปรไฟล์<span>.</span></h1></div><div className="profile-card"><div className="profile-avatar">{user.name[0].toUpperCase()}</div><div><h2>{user.name}</h2><p>{user.email}</p><span className="role-pill">MEMBER</span></div><button className="btn btn-ghost" onClick={onLogout}><LogOut size={16}/> ออกจากระบบ</button></div><div className="profile-links"><Link to="/watchlist"><Bookmark size={18}/> Watchlist <ChevronRight size={17}/></Link></div></main>;
}

function AdminPage() {
  const [items, setItems] = useState(()=>readStore("aniwave_admin_items", animeList));
  const [title, setTitle] = useState("");
  useEffect(()=>localStorage.setItem("aniwave_admin_items",JSON.stringify(items)),[items]);
  const add = e => {e.preventDefault(); if(!title.trim()) return; setItems([{id:Date.now(),title:title.trim(),year:new Date().getFullYear(),score:"—",episodes:0,status:"ร่าง",genres:["New"],type:"TV",description:"เพิ่มโดยผู้ดูแลระบบ",image:"https://images.unsplash.com/photo-1578632767115-351597cf2477?w=900",banner:""} ,...items]);setTitle("");};
  return <main className="page-container inner-page"><div className="page-heading"><div className="eyebrow">ADMIN CONTROL CENTER</div><h1>จัดการอนิเมะ<span>.</span></h1><p>หน้า Admin ตัวอย่างสำหรับจัดการรายการอนิเมะ (Mock Data)</p></div><div className="admin-stats"><div><span>ANIME IN CATALOG</span><strong>{items.length}</strong></div><div><span>MEMBERS</span><strong>—</strong></div><div><span>WATCHLIST SAVES</span><strong>—</strong></div></div><form className="admin-add" onSubmit={add}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="ชื่ออนิเมะใหม่..."/><button className="btn btn-primary"><Plus size={17}/> เพิ่มอนิเมะ</button></form><div className="admin-table"><div className="table-head"><span>ชื่ออนิเมะ</span><span>ปี</span><span>ประเภท</span><span>จัดการ</span></div>{items.map(a=><div className="table-row" key={a.id}><strong>{a.title}</strong><span>{a.year}</span><span>{a.type}</span><button className="icon-button danger" onClick={()=>setItems(items.filter(x=>x.id!==a.id))}><Trash2 size={17}/></button></div>)}</div></main>;
}

export default function App() {
  const [saved,setSaved] = useState(()=>readStore("aniwave_watchlist",[]));
  const [user,setUser] = useState(()=>readStore("aniwave_user",null));
  useEffect(()=>localStorage.setItem("aniwave_watchlist",JSON.stringify(saved)),[saved]);
  useEffect(()=>user ? localStorage.setItem("aniwave_user",JSON.stringify(user)) : localStorage.removeItem("aniwave_user"),[user]);
  const toggle = id => setSaved(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  const logout = () => setUser(null);
  return <div className="app-shell"><Header user={user} onLogout={logout}/><Routes>
    <Route path="/" element={<HomePage saved={saved} onToggle={toggle}/>}/>
    <Route path="/explore" element={<ExplorePage saved={saved} onToggle={toggle}/>}/>
    <Route path="/anime/:id" element={<DetailPage saved={saved} onToggle={toggle}/>}/>
    <Route path="/watchlist" element={<WatchlistPage saved={saved} onToggle={toggle}/>}/>
    <Route path="/login" element={<AuthPage mode="login" onLogin={setUser}/>}/>
    <Route path="/register" element={<AuthPage mode="register" onLogin={setUser}/>}/>
    <Route path="/profile" element={<ProfilePage user={user} onLogout={logout}/>}/>
    <Route path="/admin" element={<AdminPage/>}/>
    <Route path="*" element={<main className="page-container inner-page"><div className="empty-state"><h2>ไม่พบหน้านี้</h2><Link to="/" className="btn btn-primary">กลับหน้าแรก</Link></div></main>}/>
  </Routes><footer className="footer"><Link to="/" className="brand"><span className="brand-mark">A</span><span>ANI<span className="accent">WAVE</span></span></Link><span>© 2025 ANIWAVE. Made for anime lovers.</span><Link to="/admin" className="admin-link"><Shield size={14}/> Admin</Link></footer></div>;
}
