import { Link } from 'react-router-dom';

// การ์ดเพลย์ลิสต์ 1 ใบ: to = ลิงก์ปลายทาง (หน้าสาธารณะ หรือหน้าจัดการของเจ้าของ)
function PlaylistCard({ playlist, to }) {
  return (
    <Link to={to} className="block rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-violet-500/60 hover:bg-slate-800/60">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-medium text-white">🎧 {playlist.name}</h3>
        {!playlist.isPublic && <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">ส่วนตัว</span>}
      </div>
      <p className="mt-1 truncate text-sm text-slate-400">โดย {playlist.ownerName}</p>
      {playlist.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{playlist.description}</p>}
      <p className="mt-3 text-xs text-slate-400">{playlist.songCount} เพลง · ♥ {playlist.likeCount}</p>
    </Link>
  );
}

export default PlaylistCard;
