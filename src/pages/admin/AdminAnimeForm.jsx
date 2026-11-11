import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminAnime, createAnime, updateAnime, deleteAnime } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnDanger, btnGhost, inputClass } from '../../components/common/States';

const EMPTY = { title: '', titleTh: '', year: '', genre: '', episodes: '', status: 'finished', poster: '', synopsis: '' };

// ฟอร์มเดียวใช้ทั้ง "เพิ่ม" (/admin/anime/new) และ "แก้ไข" (/admin/anime/:id) แยกด้วยว่ามี id ใน URL หรือไม่
function AdminAnimeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready');   // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const a = await getAdminAnime(id, token);
        if (!ignore) {
          setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ?? ''])) });
          setStatus('ready');
        }
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit, token]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const fields = {
      title: form.title.trim(),
      titleTh: form.titleTh.trim() || null,
      year: form.year === '' ? null : Number(form.year),
      genre: form.genre.trim() || null,
      episodes: form.episodes === '' ? null : Number(form.episodes),
      status: form.status,
      poster: form.poster.trim() || null,
      synopsis: form.synopsis.trim(),
    };
    try {
      if (isEdit) await updateAnime(id, fields, token);
      else await createAnime(fields, token);
      navigate('/admin/anime');
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteAnime(id, token);
      navigate('/admin/anime');
    } catch (err) {
      setSaveError(err.message);
      setConfirmDelete(false);
      setSaving(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const label = 'block text-sm text-slate-300';
  return (
    <div className="max-w-2xl">
      <Link to="/admin/anime" className="text-sm text-slate-400 hover:text-violet-300">← กลับไปรายการอนิเมะ</Link>
      <h2 className="mb-4 mt-2 text-lg font-semibold text-white">{isEdit ? `แก้ไขอนิเมะ #${id}` : 'เพิ่มอนิเมะใหม่'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={label}>ชื่อเรื่อง (อังกฤษ/โรมาจิ)
          <input value={form.title} onChange={set('title')} required className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>ชื่อไทย
          <input value={form.titleTh} onChange={set('titleTh')} className={inputClass + ' mt-1'} />
        </label>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <label className={label}>ปีที่ฉาย
            <input type="number" value={form.year} onChange={set('year')} className={inputClass + ' mt-1'} />
          </label>
          <label className={label}>จำนวนตอน
            <input type="number" min="0" value={form.episodes} onChange={set('episodes')} className={inputClass + ' mt-1'} />
          </label>
          <label className={label}>แนว
            <input value={form.genre} onChange={set('genre')} className={inputClass + ' mt-1'} />
          </label>
          <label className={label}>สถานะ
            <select value={form.status} onChange={set('status')} className={inputClass + ' mt-1'}>
              <option value="airing">กำลังฉาย</option>
              <option value="finished">จบแล้ว</option>
              <option value="upcoming">ยังไม่ฉาย</option>
            </select>
          </label>
        </div>
        <label className={label}>ลิงก์โปสเตอร์
          <input value={form.poster} onChange={set('poster')} placeholder="https://..." className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>เรื่องย่อ
          <textarea value={form.synopsis} onChange={set('synopsis')} rows={4} className={inputClass + ' mt-1'} />
        </label>

        {saveError && <p role="alert" className="text-sm text-red-400">{saveError}</p>}

        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving || form.title.trim() === ''} className={btnPrimary}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <Link to="/admin/anime" className={btnGhost}>ยกเลิก</Link>
          {isEdit && <button type="button" onClick={() => setConfirmDelete(true)} disabled={saving} className={btnDanger + ' ml-auto'}>ลบ</button>}
        </div>
      </form>

      <ConfirmBox open={confirmDelete} busy={saving} title={`ลบ ${form.title} ?`} confirmText="ลบ"
                  onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        <p>ลบแล้วกู้คืนไม่ได้ รีวิวและคะแนนของเรื่องนี้จะหายไปด้วย</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminAnimeForm;
