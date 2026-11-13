import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { createArtist, deleteArtist, getArtists, updateArtist } from '../../api/backend';
import { ConfirmBox, ErrorBox, Loading, btnGhost, btnPrimary, inputClass } from '../../components/common/States';

const EMPTY = { name: '', bio: '', imageUrl: '' };

// จัดการศิลปิน (admin): ตารางรายชื่อ + ฟอร์มเพิ่ม/แก้ไขด้านบน ลบศิลปินที่ยังมีเพลงไม่ได้ (Go ตอบ 409)
function AdminArtists() {
  const { token } = useAuth();
  const [artists, setArtists] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [editingId, setEditingId] = useState(null);       // null = กำลังเพิ่มใหม่
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);           // { ok, text }

  const [target, setTarget] = useState(null);             // ศิลปินที่กำลังจะลบ
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getArtists();
        if (!ignore) { setArtists(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function startEdit(a) {
    setEditingId(a.id);
    setForm({ name: a.name, bio: a.bio ?? '', imageUrl: a.imageUrl ?? '' });
    setMessage(null);
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = { name: form.name.trim(), bio: form.bio.trim(), imageUrl: form.imageUrl.trim() };
    try {
      if (editingId === null) await createArtist(payload, token);
      else await updateArtist(editingId, payload, token);
      setMessage({ ok: true, text: editingId === null ? 'เพิ่มศิลปินแล้ว' : 'บันทึกแล้ว' });
      reset();
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setMessage(null);
    try {
      await deleteArtist(target.id, token);
      setMessage({ ok: true, text: `ลบ ${target.name} แล้ว` });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMessage({ ok: false, text: err.message });       // เช่น 409 ยังมีเพลงของศิลปินนี้อยู่
    } finally {
      setTarget(null);
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-white">ศิลปิน</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-medium text-white">{editingId === null ? 'เพิ่มศิลปินใหม่' : 'แก้ไขศิลปิน'}</h3>
        <input value={form.name} onChange={set('name')} placeholder="ชื่อศิลปิน" aria-label="ชื่อศิลปิน" required maxLength={200} className={inputClass} />
        <textarea value={form.bio} onChange={set('bio')} placeholder="ประวัติ (ไม่บังคับ)" aria-label="ประวัติศิลปิน" rows={2} className={inputClass} />
        <input type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="ลิงก์รูป https://... (ไม่บังคับ)" aria-label="ลิงก์รูปศิลปิน" className={inputClass} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || form.name.trim() === ''} className={btnPrimary}>
            {saving ? 'กำลังบันทึก...' : editingId === null ? 'เพิ่มศิลปิน' : 'บันทึก'}
          </button>
          {editingId !== null && <button type="button" onClick={reset} className={btnGhost}>ยกเลิกการแก้ไข</button>}
        </div>
      </form>

      {message && <p role={message.ok ? 'status' : 'alert'} className={'mb-3 text-sm ' + (message.ok ? 'text-emerald-400' : 'text-red-400')}>{message.text}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">ศิลปิน</th>
                <th className="px-4 py-3">จำนวนเพลง</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {artists.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-medium text-white">{a.name}</td>
                  <td className="px-4 py-2 text-slate-300">{a.songCount}</td>
                  <td className="space-x-3 px-4 py-2 text-right">
                    <button onClick={() => startEdit(a)} aria-label={`แก้ไข ${a.name}`} className="text-violet-400 hover:underline">แก้ไข</button>
                    <button onClick={() => setTarget(a)} aria-label={`ลบ ${a.name}`} className="text-red-400 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {artists.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500">ยังไม่มีศิลปิน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title={`ลบศิลปิน “${target?.name}” ?`} confirmText="ลบ"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>ลบได้เฉพาะศิลปินที่ไม่มีเพลงในระบบแล้ว</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminArtists;
