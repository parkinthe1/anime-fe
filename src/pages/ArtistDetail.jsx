import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SongList from '../components/SongList';
import AddToPlaylist from '../components/AddToPlaylist';
import { ErrorBox, Loading } from '../components/common/States';
import { getArtist } from '../api/backend';

function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getArtist(id);
        if (!ignore) { setArtist(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, reloadKey]);

  if (status === 'loading') return <div className="mx-auto max-w-5xl px-4 py-10"><Loading /></div>;
  if (status === 'error') return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <Link to="/artists" className="text-sm text-slate-400 hover:text-violet-300">← กลับรายการศิลปิน</Link>
      <div className="mt-4 flex items-center gap-4">
        {artist.imageUrl
          ? <img src={artist.imageUrl} alt={artist.name} className="h-20 w-20 rounded-full object-cover" />
          : <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-800 text-3xl" aria-hidden="true">🎤</div>}
        <div>
          <h1 className="text-2xl font-semibold text-white">{artist.name}</h1>
          <p className="text-sm text-slate-400">{artist.songs.length} เพลง</p>
        </div>
      </div>
      {artist.bio && <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">{artist.bio}</p>}
      <div className="mt-6">
        <SongList items={artist.songs} emptyText="ศิลปินนี้ยังไม่มีเพลง" renderActions={(s) => <AddToPlaylist song={s} />} />
      </div>
    </div>
  );
}

export default ArtistDetail;
