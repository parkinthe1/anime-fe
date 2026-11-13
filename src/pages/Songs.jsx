import { useEffect, useState } from 'react';
import SongList from '../components/SongList';
import AddToPlaylist from '../components/AddToPlaylist';
import Pagination from '../components/Pagination';
import { btnPrimary, inputClass } from '../components/common/States';
import { getGenres, getSongs } from '../api/backend';

const LIMIT = 20;

// รายการเพลง (guest ดูได้): ค้นหาชื่อเพลง/ศิลปิน + กรองแนว + แบ่งหน้า ข้อมูลมาจาก Go ทุกครั้ง
function Songs() {
  const [input, setInput] = useState('');             // ข้อความที่กำลังพิมพ์
  const [q, setQ] = useState('');                     // คำค้นที่ใช้จริง (หลังกดค้นหา)
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [offset, setOffset] = useState(0);
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    getGenres().then((list) => { if (!ignore) setGenres(list); }).catch(() => {});   // ไม่มีตัวกรองแนวก็ใช้งานต่อได้
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getSongs({ q, genre, limit: LIMIT, offset });
        if (!ignore) { setSongs(data.items); setTotal(data.total); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [q, genre, offset, reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    setOffset(0);
    setQ(input.trim());
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เพลง</h1>

      <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ค้นหาชื่อเพลงหรือศิลปิน"
               aria-label="ค้นหาเพลง" className={inputClass} />
        <select value={genre} onChange={(e) => { setOffset(0); setGenre(e.target.value); }}
                aria-label="แนวเพลง" className={inputClass + ' md:w-48'}>
          <option value="">ทุกแนว</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button type="submit" className={btnPrimary}>ค้นหา</button>
      </form>

      {status === 'success' && <p className="mt-4 text-sm text-slate-400">พบ {total} เพลง</p>}
      <div className="mt-3">
        <SongList items={songs} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                  emptyText="ไม่พบเพลงที่ค้นหา" renderActions={(s) => <AddToPlaylist song={s} />} />
      </div>
      {status === 'success' && <Pagination offset={offset} limit={LIMIT} total={total} onChange={setOffset} />}
    </div>
  );
}

export default Songs;
