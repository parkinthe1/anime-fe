import { btnGhost } from './common/States';

// ปุ่มเปลี่ยนหน้า: offset = ตำแหน่งเริ่มต้นของหน้านี้, onChange(offsetใหม่)
function Pagination({ offset, limit, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const page = Math.floor(offset / limit) + 1;
  return (
    <nav aria-label="เปลี่ยนหน้า" className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-400">
      <button onClick={() => onChange(offset - limit)} disabled={page <= 1} className={btnGhost}>ก่อนหน้า</button>
      <span>หน้า {page} จาก {pages}</span>
      <button onClick={() => onChange(offset + limit)} disabled={page >= pages} className={btnGhost}>ถัดไป</button>
    </nav>
  );
}

export default Pagination;
