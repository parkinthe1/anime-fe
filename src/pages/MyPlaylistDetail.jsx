import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SongList from '../components/SongList';
import { ConfirmBox, ErrorBox, Loading, btnDanger, btnGhost, btnPrimary, inputClass } from '../components/common/States';
import {
  deletePlaylist, getMyPlaylist, removeSongFromPlaylist, reorderPlaylist, updatePlaylist,
} from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// จัดการเพลย์ลิสต์ของตัวเอง: แก้ชื่อ/คำอธิบาย/สาธารณะ, เลื่อนลำดับเพลง, เอาเพลงออก, ลบลิสต์
// เพลย์ลิสต์ของคนอื่นหรือที่ไม่มีอยู่ Go ตอบ 404 -> หน้านี้แสดงกล่อง error
function MyPlaylistDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);         // { ok, text }
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getMyPlaylist(id, token);
        if (ignore) return;
        setPlaylist(data);
        setName(data.name);
        setDescription(data.description);
        setIsPublic(data.isPublic);
        setStatus('success');
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, token, reloadKey]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updatePlaylist(id, { name: name.trim(), description: description.trim(), isPublic }, token);
      setPlaylist({ ...playlist, ...updated });         // เก็บ songs เดิมไว้ อัปเดตเฉพาะข้อมูลลิสต์
      setMessage({ ok: true, text: 'บันทึกเรียบร้อยแล้ว' });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function move(index, delta) {
    const ids = playlist.songs.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusy(true);
    setMessage(null);
    try {
      const updated = await reorderPlaylist(id, ids, token);
      setPlaylist(updated);                               // ใช้ลำดับที่ server ยืนยัน
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function removeSong(song) {
    setBusy(true);
    setMessage(null);
    try {
      await removeSongFromPlaylist(id, song.id, token);
      setPlaylist({ ...playlist, songs: playlist.songs.filter((s) => s.id !== song.id), songCount: playlist.songCount - 1 });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deletePlaylist(id, token);
      navigate('/me/playlists');
    } catch (err) {
      setMessage({ ok: false, text: err.message });
      setConfirmDelete(false);
      setBusy(false);
    }
  }

  if (status === 'loading') return <div className="mx-auto max-w-5xl px-4 py-10"><Loading /></div>;
  if (status === 'error') return <div className="mx-auto max-w-5xl px-4 py-10"><ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} /></div>;

  const songs = playlist.songs;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <Link to="/me/playlists" className="text-sm text-slate-400 hover:text-violet-300">← เพลย์ลิสต์ของฉัน</Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">🎧 {playlist.name}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {songs.length} เพลง · ♥ {playlist.likeCount} · {playlist.isPublic ? 'สาธารณะ' : 'ส่วนตัว'}
        {playlist.isPublic && <> · <Link to={`/playlists/${playlist.id}`} className="text-violet-400 hover:underline">ดูหน้าสาธารณะ</Link></>}
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="font-medium text-white">ข้อมูลเพลย์ลิสต์</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="ชื่อเพลย์ลิสต์" required maxLength={100} className={inputClass} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} aria-label="คำอธิบาย" maxLength={500} rows={2} className={inputClass} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          ตั้งเป็นสาธารณะ
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving || name.trim() === ''} className={btnPrimary}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>ลบเพลย์ลิสต์</button>
        </div>
      </form>

      {message && <p role={message.ok ? 'status' : 'alert'} className={'mt-4 text-sm ' + (message.ok ? 'text-emerald-400' : 'text-red-400')}>{message.text}</p>}

      <h2 className="mb-3 mt-8 font-medium text-white">เพลงในลิสต์</h2>
      <SongList items={songs} emptyText="ยังไม่มีเพลง ไปที่หน้าเพลงแล้วกด “＋ เพลย์ลิสต์” เพื่อเพิ่ม"
                renderActions={(song) => {
                  const index = songs.findIndex((s) => s.id === song.id);
                  return (
                    <>
                      <button onClick={() => move(index, -1)} disabled={busy || index === 0}
                              aria-label={`เลื่อน ${song.title} ขึ้น`} className={btnGhost + ' !px-2 !py-1'}>↑</button>
                      <button onClick={() => move(index, 1)} disabled={busy || index === songs.length - 1}
                              aria-label={`เลื่อน ${song.title} ลง`} className={btnGhost + ' !px-2 !py-1'}>↓</button>
                      <button onClick={() => removeSong(song)} disabled={busy}
                              aria-label={`เอา ${song.title} ออก`} className={btnDanger + ' !px-2 !py-1'}>เอาออก</button>
                    </>
                  );
                }} />

      <ConfirmBox open={confirmDelete} busy={busy} title={`ลบเพลย์ลิสต์ “${playlist.name}” ?`} confirmText="ลบ"
                  onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        <p>ลบแล้วกู้คืนไม่ได้ เพลงในลิสต์ยังอยู่ในระบบ แต่ยอดถูกใจของลิสต์นี้จะหายไป</p>
      </ConfirmBox>
    </div>
  );
}

export default MyPlaylistDetail;
