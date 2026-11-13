import PlaylistCard from './PlaylistCard';
import { EmptyBox, ErrorBox, Loading } from './common/States';

// ตารางการ์ดเพลย์ลิสต์ที่วาดตามสถานะ loading / error / empty / success
function PlaylistGrid({ items, status = 'success', error, onRetry, emptyText = 'ยังไม่มีเพลย์ลิสต์', linkFor = (p) => `/playlists/${p.id}` }) {
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;
  if (items.length === 0) return <EmptyBox text={emptyText} />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => <PlaylistCard key={p.id} playlist={p} to={linkFor(p)} />)}
    </div>
  );
}

export default PlaylistGrid;
