import { Link } from 'react-router-dom';
import { usePlayer } from '../player/PlayerContext';
import { formatDuration } from '../utils/format';
import { EmptyBox, ErrorBox, Loading } from './common/States';

// รายการเพลงที่ใช้ร่วมกันทุกหน้า: วาดตามสถานะ loading / error / empty / success
// renderActions(song) = ปุ่มเสริมท้ายแถว (เช่น เพิ่มลงเพลย์ลิสต์, เอาออกจากลิสต์) แต่ละหน้าใส่เอง
function SongList({ items, status = 'success', error, onRetry, emptyText = 'ยังไม่มีเพลง', renderActions }) {
  const { current, playing, play, pause } = usePlayer();

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;
  if (items.length === 0) return <EmptyBox text={emptyText} />;

  return (
    <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900">
      {items.map((song) => {
        const isPlaying = current?.id === song.id && playing;
        return (
          <li key={song.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/40">
            {song.coverUrl
              ? <img src={song.coverUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
              : <div className="grid h-12 w-12 shrink-0 place-items-center rounded bg-slate-800 text-xl" aria-hidden="true">🎵</div>}

            <button
              onClick={() => (isPlaying ? pause() : play(song))}
              disabled={!song.previewUrl}
              aria-label={(isPlaying ? 'หยุด ' : 'เล่น ') + song.title}
              title={song.previewUrl ? '' : 'เพลงนี้ไม่มีเสียงตัวอย่าง'}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500 text-white hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className="min-w-0 flex-1">
              <Link to={`/songs/${song.id}`} className="block truncate font-medium text-white hover:text-violet-300">{song.title}</Link>
              <Link to={`/artists/${song.artistId}`} className="block truncate text-sm text-slate-400 hover:text-violet-300">{song.artistName}</Link>
            </div>

            <span className="hidden text-xs text-slate-500 md:block">{song.genre ?? ''}</span>
            <span className="w-10 text-right text-xs text-slate-400">{formatDuration(song.durationSec)}</span>
            {renderActions && <div className="flex shrink-0 items-center gap-2">{renderActions(song)}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export default SongList;
