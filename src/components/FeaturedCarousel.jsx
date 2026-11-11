import { useState } from 'react';
import AnimeCard from './AnimeCard';

const PER_PAGE = 4;

// แถบแนะนำเลื่อนซ้ายขวา รับรายการที่สลับลำดับมาแล้วจากแม่ ตัวเองจำแค่ว่าอยู่ชุดที่เท่าไร
function FeaturedCarousel({ items }) {
  const [page, setPage] = useState(0);
  const total = Math.ceil(items.length / PER_PAGE);

  if (items.length === 0) {
    return <p className="py-10 text-center text-slate-500">ยังไม่มีอนิเมะแนะนำ</p>;
  }

  const shown = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const prev = () => setPage(p => (p - 1 + total) % total);
  const next = () => setPage(p => (p + 1) % total);
  const nav = 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 hover:bg-slate-800';

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map(a => <AnimeCard key={a.id} anime={a} />)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
        <button onClick={prev} className={nav}>ก่อนหน้า</button>
        <span>ชุดที่ {page + 1} จาก {total}</span>
        <button onClick={next} className={nav}>ถัดไป</button>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
