import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimeList } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../../components/common/States';

// ตารางอนิเมะทั้งหมด: ใช้ GET /api/anime ตัวเดิม (สาธารณะ) ส่วนที่ต้องเป็น admin คือปุ่มแก้ไข/เพิ่ม ซึ่งพาไปหน้าฟอร์ม
function AdminAnime() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAnimeList();
        if (!ignore) { setItems(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const q = query.trim().toLowerCase();
  const shown = items.filter(a =>
    q === '' || a.title.toLowerCase().includes(q) || (a.titleTh ?? '').toLowerCase().includes(q) || String(a.id) === q
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">อนิเมะทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-400">แสดง {shown.length} จาก {items.length} เรื่อง</p>}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="ค้นชื่อ หรือพิมพ์เลข id" className={inputClass + ' md:w-64'} />
          <Link to="/admin/anime/new" className={btnPrimary + ' whitespace-nowrap'}>+ เพิ่มอนิเมะ</Link>
        </div>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">เรื่อง</th>
                <th className="px-4 py-3">แนว</th>
                <th className="px-4 py-3">ปี</th>
                <th className="px-4 py-3">ตอน</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shown.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2">
                    <p className="truncate font-medium text-white">{a.title}</p>
                    <p className="truncate text-xs text-slate-400">{a.titleTh ?? '(ยังไม่มีชื่อไทย)'} <span className="text-slate-600">#{a.id}</span></p>
                  </td>
                  <td className="px-4 py-2 text-slate-300">{a.genre ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-300">{a.year ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-300">{a.episodes ?? '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/admin/anime/${a.id}`} className="text-violet-400 hover:underline">แก้ไข</Link>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {items.length === 0 ? 'ยังไม่มีอนิเมะในระบบ' : 'ไม่พบอนิเมะที่ค้นหา'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAnime;
