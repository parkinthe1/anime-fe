import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { createSong, getArtists, getSong, updateSong } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../../components/common/States';

const NEW_ARTIST = '__new';
const EMPTY = { title: '', artistId: '', newArtistName: '', album: '', genre: '', year: '', durationSec: '', coverUrl: '', previewUrl: '' };

// ฟอร์มเพิ่ม (/admin/songs/new) และแก้ไข (/admin/songs/:id) เพลง ใช้ฟอร์มเดียวกัน
function AdminSongForm() {
  const { id } = useParams();
  const isNew = id === undefined || id === 'new';
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [artists, setArtists] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getArtists();
        const song = isNew ? null : await getSong(id);
        if (ignore) return;
        setArtists(list);
        if (song) {
          setForm({
            title: song.title, artistId: String(song.artistId), newArtistName: '', album: song.album ?? '', genre: song.genre ?? '',
            year: song.year ?? '', durationSec: song.durationSec ?? '', coverUrl: song.coverUrl ?? '', previewUrl: song.previewUrl ?? '',
          });
        }
        setStatus('success');
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isNew, reloadKey]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      title: form.title.trim(),
      album: form.album.trim(),
      genre: form.genre.trim(),
      year: form.year === '' ? null : Number(form.year),
      durationSec: form.durationSec === '' ? null : Number(form.durationSec),
      coverUrl: form.coverUrl.trim(),
      previewUrl: form.previewUrl.trim(),
    };
    if (form.artistId === NEW_ARTIST) payload.artistName = form.newArtistName.trim();
    else payload.artistId = Number(form.artistId);

    try {
      if (isNew) await createSong(payload, token);
      else await updateSong(id, payload, token);
      navigate('/admin/songs');
    } catch (err) {
      setFormError(err.message);
      setSaving(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  const label = 'block text-sm text-slate-300';
  return (
    <div className="max-w-xl">
      <Link to="/admin/songs" className="text-sm text-slate-400 hover:text-violet-300">← กลับรายการเพลง</Link>
      <h2 className="mb-4 mt-3 text-lg font-semibold text-white">{isNew ? 'เพิ่มเพลง' : 'แก้ไขเพลง'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={label}>ชื่อเพลง
          <input value={form.title} onChange={set('title')} required maxLength={255} className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>ศิลปิน
          <select value={form.artistId} onChange={set('artistId')} required className={inputClass + ' mt-1'}>
            <option value="">เลือกศิลปิน</option>
            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            <option value={NEW_ARTIST}>＋ ศิลปินใหม่...</option>
          </select>
        </label>
        {form.artistId === NEW_ARTIST && (
          <label className={label}>ชื่อศิลปินใหม่
            <input value={form.newArtistName} onChange={set('newArtistName')} required maxLength={200} className={inputClass + ' mt-1'} />
          </label>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <label className={label}>อัลบั้ม<input value={form.album} onChange={set('album')} className={inputClass + ' mt-1'} /></label>
          <label className={label}>แนวเพลง<input value={form.genre} onChange={set('genre')} className={inputClass + ' mt-1'} /></label>
          <label className={label}>ปีที่ออก<input type="number" min="1900" max="2100" value={form.year} onChange={set('year')} className={inputClass + ' mt-1'} /></label>
          <label className={label}>ความยาว (วินาที)<input type="number" min="0" value={form.durationSec} onChange={set('durationSec')} className={inputClass + ' mt-1'} /></label>
        </div>
        <label className={label}>ลิงก์รูปปก (https://...)
          <input type="url" value={form.coverUrl} onChange={set('coverUrl')} className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>ลิงก์เสียงตัวอย่าง (https://...)
          <input type="url" value={form.previewUrl} onChange={set('previewUrl')} className={inputClass + ' mt-1'} />
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        </div>
      </form>
    </div>
  );
}

export default AdminSongForm;
