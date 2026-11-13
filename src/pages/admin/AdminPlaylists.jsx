import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { deleteAdminPlaylist, getAdminPlaylists } from '../../api/backend';
import { ConfirmBox, ErrorBox, Loading } from '../../components/common/States';

// ดูแลเพลย์ลิสต์ทั้งหมด (admin): เห็นทุกลิสต์รวมที่เป็นส่วนตัว และลบลิสต์ที่ไม่เหมาะสมได้
function AdminPlaylists() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminPlaylists(token);
        if (!ignore) { setItems(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function confirmDelete() {
    setBusy(true);
    setActionError(null);
    try {
      await deleteAdminPlaylist(target.id, token);
      setItems(items.filter((p) => p.id !== target.id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setTarget(null);
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-white">เพลย์ลิสต์ทั้งหมด</h2>
      {actionError && <p role="alert" className="mb-3 text-sm text-red-400">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">เพลย์ลิสต์</th>
                <th className="px-4 py-3">เจ้าของ</th>
                <th className="px-4 py-3">เพลง</th>
                <th className="px-4 py-3">ถูกใจ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-medium text-white">
                    {p.isPublic ? <Link to={`/playlists/${p.id}`} className="hover:text-violet-300">{p.name}</Link> : p.name}
                  </td>
                  <td className="px-4 py-2 text-slate-300">{p.ownerName}</td>
                  <td className="px-4 py-2 text-slate-300">{p.songCount}</td>
                  <td className="px-4 py-2 text-slate-300">{p.likeCount}</td>
                  <td className="px-4 py-2 text-slate-300">{p.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setTarget(p)} aria-label={`ลบเพลย์ลิสต์ ${p.name}`} className="text-red-400 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">ยังไม่มีเพลย์ลิสต์</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ลบเพลย์ลิสต์ “${target?.name}” ของ ${target?.ownerName} ?`} confirmText="ลบ"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>เจ้าของจะไม่เห็นเพลย์ลิสต์นี้อีก กู้คืนไม่ได้</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminPlaylists;
