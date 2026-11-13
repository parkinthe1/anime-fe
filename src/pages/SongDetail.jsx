import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AddToPlaylist from '../components/AddToPlaylist';
import { ErrorBox, Loading, btnPrimary } from '../components/common/States';
import { getSong } from '../api/backend';
import { usePlayer } from '../player/PlayerContext';
import { formatDuration } from '../utils/format';

function SongDetail() {
  const { id } = useParams();
  const { current, playing, play, pause } = usePlayer();
  const [song, setSong] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getSong(id);
        if (!ignore) { setSong(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, reloadKey]);

  if (status === 'loading') return <div className="mx-auto max-w-3xl px-4 py-10"><Loading /></div>;
  if (status === 'error') return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;

  const isPlaying = current?.id === song.id && playing;
  const rows = [
    ['ศิลปิน', <Link key="a" to={`/artists/${song.artistId}`} className="text-violet-400 hover:underline">{song.artistName}</Link>],
    ['อัลบั้ม', song.album ?? '-'],
    ['แนวเพลง', song.genre ?? '-'],
    ['ปีที่ออก', song.year ?? '-'],
    ['ความยาว', formatDuration(song.durationSec)],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <Link to="/songs" className="text-sm text-slate-400 hover:text-violet-300">← กลับรายการเพลง</Link>
      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        {song.coverUrl
          ? <img src={song.coverUrl} alt={`ปก ${song.title}`} className="h-56 w-56 rounded-xl object-cover" />
          : <div className="grid h-56 w-56 place-items-center rounded-xl bg-slate-800 text-6xl" aria-hidden="true">🎵</div>}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-white">{song.title}</h1>
          <dl className="mt-4 space-y-1 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt className="w-20 text-slate-500">{label}</dt>
                <dd className="text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => (isPlaying ? pause() : play(song))} disabled={!song.previewUrl} className={btnPrimary}>
              {isPlaying ? '⏸ หยุด' : '▶ ฟังตัวอย่าง 30 วินาที'}
            </button>
            <AddToPlaylist song={song} />
          </div>
          {!song.previewUrl && <p className="mt-3 text-sm text-slate-500">เพลงนี้ไม่มีเสียงตัวอย่าง</p>}
        </div>
      </div>
    </div>
  );
}

export default SongDetail;
