import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyBox, ErrorBox, Loading, btnPrimary, inputClass } from '../components/common/States';
import { getArtists } from '../api/backend';

function Artists() {
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [artists, setArtists] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getArtists(q);
        if (!ignore) { setArtists(data); setStatus('success'); }
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
      <h1 className="text-2xl font-semibold text-white">ศิลปิน</h1>
      <form onSubmit={handleSearch} className="mt-4 flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ค้นหาชื่อศิลปิน" aria-label="ค้นหาศิลปิน" className={inputClass} />
        <button type="submit" className={btnPrimary}>ค้นหา</button>
      </form>

      <div className="mt-6">
        {status === 'loading' && <Loading />}
        {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
        {status === 'success' && artists.length === 0 && <EmptyBox text="ไม่พบศิลปิน" />}
        {status === 'success' && artists.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => (
              <Link key={a.id} to={`/artists/${a.id}`} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-violet-500/60">
                {a.imageUrl
                  ? <img src={a.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                  : <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800" aria-hidden="true">🎤</div>}
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.songCount} เพลง</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Artists;
