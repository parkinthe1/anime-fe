import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTopAnime } from '../../api/tenrai';
import { getAnimeOverrides } from '../../api/backend';
import { withOverrides } from '../../api/catalog';
import { ErrorBox, Loading, inputClass } from '../../components/common/States';

// รายการอนิเมะเดียวกับที่หน้าเว็บแสดง (ดึงจาก TENRAI) admin กดแก้ไขเพื่อใส่ชื่อไทย/เรื่องย่อไทยทับข้อมูลของ TENRAI
// ที่นี่ดึงที่ admin แก้ไว้แบบเข้มงวด (ถ้าดึงไม่ได้ให้ขึ้น error ไม่ใช่แสดงเหมือนยังไม่เคยแก้)
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
      setError(null);
      try {
        const [top, list] = await Promise.all([getTopAnime(), getAnimeOverrides()]);
        const overrides = new Map(list.map(o => [Number(o.id), o]));
        if (!ignore) { setItems(withOverrides(top, overrides)); setStatus('success'); }
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
          <h2 className="text-lg font-medium text-ink">อนิเมะทั้งหมด</h2>
          <p className="text-sm text-mute">
            ข้อมูลมาจาก TENRAI กดแก้ไขเพื่อใส่ชื่อไทย แนว โปสเตอร์ หรือเรื่องย่อของเราเอง (จะแสดงแทนข้อมูลของ TENRAI ในหน้าเว็บ)
          </p>
          {status === 'success' && <p className="text-sm text-mute">แสดง {shown.length} จาก {items.length} เรื่อง</p>}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="ค้นชื่อ หรือพิมพ์เลข id" className={inputClass + ' md:w-64'} />
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-foam text-left text-xs font-medium text-mute">
              <tr>
                <th className="px-4 py-3">เรื่อง</th>
                <th className="px-4 py-3">แนว</th>
                <th className="px-4 py-3">ปี</th>
                <th className="px-4 py-3">ตอน</th>
                <th className="px-4 py-3">ข้อมูล</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map(a => (
                <tr key={a.id} className="hover:bg-foam/60">
                  <td className="px-4 py-2">
                    <p className="truncate font-medium text-ink">{a.title}</p>
                    <p className="truncate text-xs text-mute">{a.titleTh ?? '(ยังไม่มีชื่อไทย)'} <span className="text-mute/70">#{a.id}</span></p>
                  </td>
                  <td className="px-4 py-2 text-ink/80">{a.genre ?? '-'}</td>
                  <td className="px-4 py-2 text-ink/80">{a.year ?? '-'}</td>
                  <td className="px-4 py-2 text-ink/80">{a.episodes ?? '-'}</td>
                  <td className="px-4 py-2">
                    {a.hasOverride
                      ? <span className="rounded-full bg-foam px-2 py-0.5 text-xs text-sea">แก้ไขแล้ว</span>
                      : <span className="text-xs text-mute">ใช้ของ TENRAI</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/admin/anime/${a.id}`} className="text-sea hover:underline">แก้ไข</Link>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-mute">
                  {items.length === 0 ? 'TENRAI ไม่มีรายการอนิเมะ' : 'ไม่พบอนิเมะที่ค้นหา'}
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
