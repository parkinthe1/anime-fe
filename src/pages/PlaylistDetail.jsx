import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SongList from '../components/SongList';
import AddToPlaylist from '../components/AddToPlaylist';
import { ErrorBox, Loading, btnGhost, btnPrimary } from '../components/common/States';
import { getMyLikes, getPublicPlaylist, likePlaylist, unlikePlaylist } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// หน้าเพลย์ลิสต์สาธารณะ (guest ดูได้) สมาชิกกดถูกใจได้ เจ้าของมีลิงก์ไปหน้าจัดการ
function PlaylistDetail() {
  const { id } = useParams();
  const { token, isLoggedIn, member } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [likeError, setLikeError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getPublicPlaylist(id);
        if (ignore) return;
        setPlaylist(data);
        setLikeCount(data.likeCount);
        setStatus('success');
        if (token) {
          // รู้ว่าเราถูกใจลิสต์นี้อยู่แล้วหรือยัง (ถ้าโหลดไม่ได้ก็แค่ไม่ติ๊กสถานะ)
          getMyLikes(token).then((mine) => { if (!ignore) setLiked(mine.some((p) => p.id === data.id)); }).catch(() => {});
        }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, token, reloadKey]);

  async function toggleLike() {
    setLikeBusy(true);
    setLikeError(null);
    try {
      const result = liked ? await unlikePlaylist(playlist.id, token) : await likePlaylist(playlist.id, token);
      setLiked(result.liked);
      setLikeCount(result.likeCount);               // ใช้ตัวเลขที่ server ยืนยัน
    } catch (err) {
      setLikeError(err.message);
    } finally {
      setLikeBusy(false);
    }
  }

  if (status === 'loading') return <div className="mx-auto max-w-5xl px-4 py-10"><Loading /></div>;
  if (status === 'error') return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;

  const isOwner = member?.id === playlist.ownerId;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <Link to="/playlists" className="text-sm text-slate-400 hover:text-violet-300">← กลับรายการเพลย์ลิสต์</Link>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">🎧 {playlist.name}</h1>
          <p className="mt-1 text-sm text-slate-400">โดย {playlist.ownerName} · {playlist.songs.length} เพลง</p>
          {playlist.description && <p className="mt-3 max-w-2xl text-slate-300">{playlist.description}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {isLoggedIn ? (
            <button onClick={toggleLike} disabled={likeBusy} aria-pressed={liked} className={liked ? btnPrimary : btnGhost}>
              {liked ? '♥ ถูกใจแล้ว' : '♡ ถูกใจ'} ({likeCount})
            </button>
          ) : (
            <p className="text-sm text-slate-400">♥ {likeCount} · <Link to="/login" state={{ from: `/playlists/${playlist.id}` }} className="text-violet-400 hover:underline">เข้าสู่ระบบ</Link> เพื่อกดถูกใจ</p>
          )}
          {likeError && <p role="alert" className="text-sm text-red-400">{likeError}</p>}
          {isOwner && <Link to={`/me/playlists/${playlist.id}`} className="text-sm text-violet-400 hover:underline">จัดการเพลย์ลิสต์นี้</Link>}
        </div>
      </div>
      <div className="mt-6">
        <SongList items={playlist.songs} emptyText="เพลย์ลิสต์นี้ยังไม่มีเพลง" renderActions={(s) => <AddToPlaylist song={s} />} />
      </div>
    </div>
  );
}

export default PlaylistDetail;
