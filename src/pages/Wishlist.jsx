import { useEffect, useState } from 'react';
import AnimeGrid from '../components/AnimeGrid';
import { useAuth } from '../auth/AuthContext';
import { getWishlist } from '../api/backend';
import { getAnimeById } from '../api/tenrai';
import { fetchOverrideMap, mergeOverride } from '../api/catalog';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const GAP_MS = 350;   // TENRAI จำกัดประมาณ 3 request ต่อวินาที

// "รายการที่อยากดู" ของสมาชิกที่ login อยู่
function Wishlist() {
  const { member, token } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [missing, setMissing] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setMissing(0);
      try {
        const data = await getWishlist(token);           // { items: [{ id }] }
        const overrides = await fetchOverrideMap();
        const loaded = [];
        let failed = 0;
        for (let i = 0; i < data.items.length; i++) {
          if (ignore) return;
          if (i > 0) await sleep(GAP_MS);
          try {
            const a = await getAnimeById(data.items[i].id);
            loaded.push(mergeOverride(a, overrides.get(Number(a.id))));
          } catch { failed++; }
        }
        if (!ignore) {
          if (data.items.length > 0 && loaded.length === 0) throw new Error('โหลดรายละเอียดอนิเมะจาก TENRAI ไม่สำเร็จ');
          setItems(loaded); setMissing(failed); setStatus('success');
        }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">รายการที่อยากดูของ {member?.displayName}</h1>
      <p className="mb-6 text-sm text-slate-500">กดปุ่มหัวใจในหน้าอนิเมะเพื่อเพิ่มเรื่องเข้ามาที่นี่</p>
      {missing > 0 && <p role="status" className="mb-4 text-sm text-amber-400">โหลดไม่ได้ {missing} เรื่อง (TENRAI ไม่ตอบ) ลองรีเฟรชอีกครั้ง</p>}
      <AnimeGrid items={items} status={status} error={error}
                 emptyText="ยังไม่มีอนิเมะในรายการที่อยากดู"
                 onRetry={() => setReloadKey(k => k + 1)} />
    </div>
  );
}

export default Wishlist;
