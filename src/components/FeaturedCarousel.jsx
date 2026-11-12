import { useState } from 'react';
import AnimeCard from './AnimeCard';

const PER_PAGE = 4;

// แถบแนะนำเลื่อนซ้ายขวา รับรายการที่สลับลำดับมาแล้วจากแม่ ตัวเองจำแค่ว่าอยู่ชุดที่เท่าไร
function FeaturedCarousel({ items }) {
  const [page, setPage] = useState(0);
  const total = Math.ceil(items.length / PER_PAGE);

  if (items.length === 0) {
    return <p className="py-10 text-center text-mute">ยังไม่มีอนิเมะแนะนำ</p>;
  }

  const shown = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const prev = () => setPage(p => (p - 1 + total) % total);
  const next = () => setPage(p => (p + 1) % total);
  const nav = 'rounded-full border border-ink/30 bg-white px-4 py-1.5 text-ink transition hover:border-ink hover:bg-foam';

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
        {shown.map(a => <AnimeCard key={a.id} anime={a} />)}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-mute">
        <button onClick={prev} className={nav}>ก่อนหน้า</button>
        <span>ชุดที่ {page + 1} จาก {total}</span>
        <button onClick={next} className={nav}>ถัดไป</button>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
