import { useEffect, useState } from 'react';
import PlaylistGrid from '../components/PlaylistGrid';
import { btnPrimary, inputClass } from '../components/common/States';
import { getPublicPlaylists } from '../api/backend';

// เพลย์ลิสต์สาธารณะของทุกคน (guest ดูได้) เรียงตามยอดถูกใจ
function Playlists() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getPublicPlaylists(q);
        if (!ignore) { setItems(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [q, reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    setQ(input.trim());
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เพลย์ลิสต์</h1>
      <form onSubmit={handleSearch} className="mt-4 flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ค้นหาชื่อเพลย์ลิสต์" aria-label="ค้นหาเพลย์ลิสต์" className={inputClass} />
        <button type="submit" className={btnPrimary}>ค้นหา</button>
      </form>
      <div className="mt-6">
        <PlaylistGrid items={items} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                      emptyText="ไม่พบเพลย์ลิสต์" />
      </div>
    </div>
  );
}

export default Playlists;
