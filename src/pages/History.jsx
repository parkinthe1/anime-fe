import { useEffect, useState } from 'react';
import SongList from '../components/SongList';
import AddToPlaylist from '../components/AddToPlaylist';
import { getHistory } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { dateTH } from '../utils/format';

// ประวัติการฟัง 50 รายการล่าสุดของสมาชิก (บันทึกอัตโนมัติเมื่อกดเล่นเพลงตอน login อยู่)
function History() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getHistory(token);
        if (!ignore) { setItems(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  // แถวเดียวกันอาจซ้ำหลายครั้ง (ฟังซ้ำ) จึงใช้ playedAt ประกอบเป็น key ไม่ได้ผ่าน SongList: แสดงวันที่ต่อท้ายแทน
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">ประวัติการฟัง</h1>
      <div className="mt-6">
        <SongList items={dedupe(items)} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                  emptyText="ยังไม่มีประวัติการฟัง ลองกดเล่นเพลงดู"
                  renderActions={(s) => (
                    <>
                      <span className="hidden text-xs text-slate-500 md:inline">{dateTH(s.playedAt)}</span>
                      <AddToPlaylist song={s} />
                    </>
                  )} />
      </div>
    </div>
  );
}

// เก็บเฉพาะครั้งล่าสุดของแต่ละเพลง (รายการเรียงใหม่ไปเก่าอยู่แล้ว) กันรายการซ้ำและ key ซ้ำ
function dedupe(items) {
  const seen = new Set();
  return items.filter((s) => (seen.has(s.id) ? false : seen.add(s.id)));
}

export default History;
