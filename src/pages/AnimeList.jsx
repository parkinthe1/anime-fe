import { useEffect, useState } from 'react';
import AnimeGrid from '../components/AnimeGrid';
import { inputClass } from '../components/common/States';
import { getAnimeList } from '../api/backend';

function AnimeList() {
  const [query, setQuery] = useState('');            // คำค้น กรองในเครื่อง ไม่ยิง API ซ้ำ
  const [genre, setGenre] = useState('all');         // 'all' = ทุกแนว

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');   // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);     // ตัวนับสำหรับปุ่ม "ลองใหม่"

  useEffect(() => {
    let ignore = false;                              // กันคำตอบเก่ามาทับคำตอบใหม่
    async function load() {
      setStatus('loading');
      try {
        const list = await getAnimeList();
        if (!Array.isArray(list)) throw new Error('ข้อมูลที่ได้ไม่ใช่รายการอนิเมะ');
        if (!ignore) { setItems(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const genres = [...new Set(items.map(a => a.genre).filter(Boolean))];
  const q = query.trim().toLowerCase();
  const shown = items.filter(a =>
    (genre === 'all' || a.genre === genre) &&
    (q === '' || a.title.toLowerCase().includes(q) || (a.titleTh ?? '').toLowerCase().includes(q))
  );

  const chipClass = (active) =>
    'rounded-full border px-3 py-1 text-sm transition ' +
    (active ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">อนิเมะทั้งหมด</h1>
          <p className="text-sm text-slate-500">
            {status === 'success' ? `พบ ${shown.length} จาก ${items.length} เรื่อง` : 'กำลังเตรียมรายการ'}
          </p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="พิมพ์ชื่ออนิเมะเพื่อค้นหา..." className={inputClass + ' md:w-72'} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setGenre('all')} className={chipClass(genre === 'all')}>ทุกแนว</button>
        {genres.map(g => (
          <button key={g} onClick={() => setGenre(g)} className={chipClass(genre === g)}>{g}</button>
        ))}
      </div>

      <AnimeGrid items={shown} status={status} error={error}
                 emptyText={items.length === 0 ? 'ยังไม่มีอนิเมะในระบบ' : 'ไม่พบอนิเมะที่ค้นหา ลองคำอื่นดู'}
                 onRetry={() => setReloadKey(k => k + 1)} />
    </div>
  );
}

export default AnimeList;
