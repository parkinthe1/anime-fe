import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAnimeById } from '../../api/tenrai';
import { getAnimeOverrides, putAnimeOverride, deleteAnimeOverride } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnDanger, btnGhost, inputClass } from '../../components/common/States';

const STATUS_TH = { airing: 'กำลังฉาย', finished: 'จบแล้ว', upcoming: 'ยังไม่ฉาย' };
const EMPTY = { titleTh: '', genre: '', poster: '', synopsis: '' };

// แก้ทับข้อมูลของ TENRAI สำหรับอนิเมะ 1 เรื่อง (id ใน URL = id ของ TENRAI) เว้นช่องไหนว่างไว้ = ใช้ของ TENRAI ช่องนั้น
// ไม่มีการเพิ่ม/ลบอนิเมะ เพราะรายการเรื่องมาจาก TENRAI
function AdminAnimeForm() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [original, setOriginal] = useState(null);       // ข้อมูลเดิมจาก TENRAI
  const [hasOverride, setHasOverride] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('loading');      // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        // ดึงที่แก้ไว้แบบเข้มงวด: ถ้าดึงไม่ได้ต้องขึ้น error ไม่งั้นฟอร์มว่างจะทำให้เผลอเขียนทับของเดิม
        const [a, list] = await Promise.all([getAnimeById(id), getAnimeOverrides()]);
        const ov = list.find(o => Number(o.id) === Number(a.id));
        if (!ignore) {
          setOriginal(a);
          setHasOverride(Boolean(ov));
          setForm({ titleTh: ov?.titleTh ?? '', genre: ov?.genre ?? '', poster: ov?.poster ?? '', synopsis: ov?.synopsis ?? '' });
          setStatus('ready');
        }
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const fields = {
      titleTh: form.titleTh.trim() || null,
      genre: form.genre.trim() || null,
      poster: form.poster.trim() || null,
      synopsis: form.synopsis.trim() || null,
    };
    if (fields.poster && !/^https?:\/\//i.test(fields.poster)) {
      setSaveError('ลิงก์โปสเตอร์ต้องขึ้นต้นด้วย http:// หรือ https://');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (Object.values(fields).every(v => v === null)) {
        if (hasOverride) await deleteAnimeOverride(id, token);   // ล้างทุกช่อง = กลับไปใช้ของ TENRAI ทั้งหมด
      } else {
        await putAnimeOverride(id, fields, token);
      }
      navigate('/admin/anime');
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await deleteAnimeOverride(id, token);
      navigate('/admin/anime');
    } catch (err) {
      setSaveError(err.message);
      setConfirmReset(false);
      setSaving(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const label = 'block text-sm text-ink/80';
  const hint = 'mt-1 text-xs text-mute';
  return (
    <div className="max-w-2xl">
      <Link to="/admin/anime" className="text-sm text-mute hover:text-sea">← กลับไปรายการอนิเมะ</Link>
      <h2 className="mb-1 mt-2 text-lg font-medium text-ink">แก้ไขข้อมูล: {original.title} <span className="text-mute">#{id}</span></h2>
      <p className="mb-4 text-sm text-mute">
        {original.year ?? '-'} · {original.episodes ?? '-'} ตอน · {STATUS_TH[original.status] ?? original.status} (ส่วนนี้มาจาก TENRAI แก้ไม่ได้)
        <br />เว้นช่องไหนว่างไว้ = ใช้ข้อมูลของ TENRAI ช่องนั้น
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={label}>ชื่อไทย
          <input value={form.titleTh} onChange={set('titleTh')} className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>แนว
          <input value={form.genre} onChange={set('genre')} placeholder={original.genre ?? ''} className={inputClass + ' mt-1'} />
          {original.genre && <span className={hint + ' block'}>TENRAI: {original.genre}</span>}
        </label>
        <label className={label}>ลิงก์โปสเตอร์
          <input value={form.poster} onChange={set('poster')} placeholder="https://..." className={inputClass + ' mt-1'} />
        </label>
        <label className={label}>เรื่องย่อ
          <textarea value={form.synopsis} onChange={set('synopsis')} rows={5} className={inputClass + ' mt-1'} />
        </label>
        {original.synopsis && (
          <details className="rounded-lg border border-line bg-white p-3 text-sm text-mute">
            <summary className="cursor-pointer text-ink/80">เรื่องย่อเดิมจาก TENRAI</summary>
            <p className="mt-2 whitespace-pre-line">{original.synopsis}</p>
          </details>
        )}

        {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}

        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          <Link to="/admin/anime" className={btnGhost}>ยกเลิก</Link>
          {hasOverride && (
            <button type="button" onClick={() => setConfirmReset(true)} disabled={saving} className={btnDanger + ' ml-auto'}>
              กลับไปใช้ข้อมูลของ TENRAI
            </button>
          )}
        </div>
      </form>

      <ConfirmBox open={confirmReset} busy={saving} title={`ล้างข้อมูลที่แก้ของ ${original.title} ?`} confirmText="ล้าง"
                  onConfirm={handleReset} onCancel={() => setConfirmReset(false)}>
        <p>ชื่อไทย แนว โปสเตอร์ และเรื่องย่อที่แก้ไว้จะหายไป หน้าเว็บจะกลับไปแสดงข้อมูลของ TENRAI (รีวิวและคะแนนของสมาชิกไม่ถูกลบ)</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminAnimeForm;
