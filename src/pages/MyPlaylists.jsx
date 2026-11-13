import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaylistGrid from '../components/PlaylistGrid';
import { btnPrimary, inputClass } from '../components/common/States';
import { createPlaylist, getMyPlaylists } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// เพลย์ลิสต์ของฉัน (member): ดูรายการ + สร้างใหม่ (ครอบด้วย ProtectedRoute ใน App.jsx)
function MyPlaylists() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getMyPlaylists(token);
        if (!ignore) { setItems(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const created = await createPlaylist({ name: name.trim(), description: description.trim(), isPublic }, token);
      navigate(`/me/playlists/${created.id}`);          // สร้างเสร็จพาไปหน้าจัดการเลย
    } catch (err) {
      setFormError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เพลย์ลิสต์ของฉัน</h1>

      <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="font-medium text-white">สร้างเพลย์ลิสต์ใหม่</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อเพลย์ลิสต์" aria-label="ชื่อเพลย์ลิสต์"
               required maxLength={100} className={inputClass} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="คำอธิบาย (ไม่บังคับ)"
                  aria-label="คำอธิบาย" maxLength={500} rows={2} className={inputClass} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          ตั้งเป็นสาธารณะ (คนอื่นเห็นและกดถูกใจได้)
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || name.trim() === ''} className={btnPrimary}>
            {saving ? 'กำลังสร้าง...' : 'สร้างเพลย์ลิสต์'}
          </button>
          {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        </div>
      </form>

      <div className="mt-8">
        <PlaylistGrid items={items} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                      emptyText="คุณยังไม่มีเพลย์ลิสต์ สร้างอันแรกได้ที่ด้านบน" linkFor={(p) => `/me/playlists/${p.id}`} />
      </div>
    </div>
  );
}

export default MyPlaylists;
