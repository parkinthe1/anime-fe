import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SongList from '../components/SongList';
import AddToPlaylist from '../components/AddToPlaylist';
import PlaylistGrid from '../components/PlaylistGrid';
import { btnPrimary, btnGhost } from '../components/common/States';
import { getSongs, getPublicPlaylists } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// หน้าแรก (guest ดูได้): เพลงมาใหม่ + เพลย์ลิสต์ยอดนิยม แต่ละส่วนโหลดและแสดง loading/error/empty ของตัวเอง
function Home() {
  const { isLoggedIn } = useAuth();

  const [songs, setSongs] = useState([]);
  const [songStatus, setSongStatus] = useState('loading');
  const [songError, setSongError] = useState(null);
  const [songReload, setSongReload] = useState(0);

  const [lists, setLists] = useState([]);
  const [listStatus, setListStatus] = useState('loading');
  const [listError, setListError] = useState(null);
  const [listReload, setListReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setSongStatus('loading');
      try {
        const data = await getSongs({ limit: 6 });
        if (!ignore) { setSongs(data.items); setSongStatus('success'); }
      } catch (err) {
        if (!ignore) { setSongError(err); setSongStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [songReload]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setListStatus('loading');
      try {
        const data = await getPublicPlaylists();
        if (!ignore) { setLists(data.slice(0, 6)); setListStatus('success'); }
      } catch (err) {
        if (!ignore) { setListError(err); setListStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [listReload]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-violet-950 to-slate-900 px-6 py-12 text-center">
        <h1 className="text-3xl font-semibold text-white md:text-4xl">🎵 MusicKen</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">ฟังตัวอย่างเพลง รวมเพลงโปรดเป็นเพลย์ลิสต์ของคุณเอง และแบ่งปันให้คนอื่นกดถูกใจ</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/songs" className={btnPrimary}>ค้นหาเพลง</Link>
          {isLoggedIn
            ? <Link to="/me/playlists" className={btnGhost}>เพลย์ลิสต์ของฉัน</Link>
            : <Link to="/register" className={btnGhost}>สมัครสมาชิก</Link>}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-white">เพลงมาใหม่</h2>
          <Link to="/songs" className="text-sm text-violet-400 hover:underline">ดูทั้งหมด</Link>
        </div>
        <SongList items={songs} status={songStatus} error={songError} onRetry={() => setSongReload((k) => k + 1)}
                  emptyText="ยังไม่มีเพลงในระบบ" renderActions={(s) => <AddToPlaylist song={s} />} />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-white">เพลย์ลิสต์ยอดนิยม</h2>
          <Link to="/playlists" className="text-sm text-violet-400 hover:underline">ดูทั้งหมด</Link>
        </div>
        <PlaylistGrid items={lists} status={listStatus} error={listError} onRetry={() => setListReload((k) => k + 1)}
                      emptyText="ยังไม่มีเพลย์ลิสต์สาธารณะ" />
      </section>
    </div>
  );
}

export default Home;
