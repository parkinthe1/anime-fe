import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { deleteSong, getSongs } from '../../api/backend';
import { ConfirmBox, ErrorBox, Loading, btnPrimary, inputClass } from '../../components/common/States';
import Pagination from '../../components/Pagination';
import { formatDuration } from '../../utils/format';

const LIMIT = 20;

// จัดการเพลง (admin): ค้นหา แบ่งหน้า เพิ่ม/แก้ไข/ลบ ทุกอย่างผ่าน Go และตรวจสิทธิ์ admin ที่ Go
function AdminSongs() {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);       // เพลงที่กำลังจะลบ (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getSongs({ q, limit: LIMIT, offset });
        if (!ignore) { setSongs(data.items); setTotal(data.total); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [q, offset, reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    setOffset(0);
    setQ(input.trim());
  }

  async function confirmDelete() {
    setBusy(true);
    setActionError(null);
    try {
      await deleteSong(target.id, token);
      setTarget(null);
      if (songs.length === 1 && offset > 0) setOffset(offset - LIMIT);      // ลบแถวสุดท้ายของหน้า ถอยไปหน้าก่อน
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err.message);
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">เพลง</h2>
          {status === 'success' && <p className="text-sm text-slate-400">ทั้งหมด {total} เพลง</p>}
        </div>
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ค้นชื่อเพลงหรือศิลปิน" aria-label="ค้นหาเพลง" className={inputClass + ' md:w-56'} />
            <button type="submit" className={btnPrimary}>ค้นหา</button>
          </form>
          <Link to="/admin/songs/new" className={btnPrimary}>＋ เพิ่มเพลง</Link>
        </div>
      </div>

      {actionError && <p role="alert" className="mb-3 text-sm text-red-400">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">เพลง</th>
                <th className="px-4 py-3">แนว</th>
                <th className="px-4 py-3">ความยาว</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {songs.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2">
                    <p className="font-medium text-white">{s.title}</p>
                    <p className="text-xs text-slate-400">{s.artistName}</p>
                  </td>
                  <td className="px-4 py-2 text-slate-300">{s.genre ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-300">{formatDuration(s.durationSec)}</td>
                  <td className="space-x-3 px-4 py-2 text-right">
                    <Link to={`/admin/songs/${s.id}`} aria-label={`แก้ไข ${s.title}`} className="text-violet-400 hover:underline">แก้ไข</Link>
                    <button onClick={() => setTarget(s)} aria-label={`ลบ ${s.title}`} className="text-red-400 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">ไม่พบเพลง</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {status === 'success' && <Pagination offset={offset} limit={LIMIT} total={total} onChange={setOffset} />}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ลบเพลง “${target?.title}” ?`} confirmText="ลบ"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>เพลงนี้จะหายจากเพลย์ลิสต์ของสมาชิกทุกคนและประวัติการฟังด้วย กู้คืนไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminSongs;
