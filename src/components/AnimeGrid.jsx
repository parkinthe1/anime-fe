import AnimeCard from './AnimeCard';
import { ErrorBox, EmptyBox } from './common/States';

// วาดรายการตามสถานะ: loading | error | success (success แต่ว่างเปล่า = empty)
function AnimeGrid({ items, status, error, onRetry, emptyText = 'ไม่พบอนิเมะที่ค้นหา ลองคำอื่นดู' }) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label="กำลังโหลด" className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] rounded-md bg-foam" />
            <div className="mt-2 h-4 w-3/4 rounded bg-foam" />
            <div className="mt-2 h-3 w-1/2 rounded bg-foam" />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') return <ErrorBox error={error} onRetry={onRetry} />;

  if (!items || items.length === 0) return <EmptyBox text={emptyText} />;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
      {items.map(a => <AnimeCard key={a.id} anime={a} />)}
    </div>
  );
}

export default AnimeGrid;
