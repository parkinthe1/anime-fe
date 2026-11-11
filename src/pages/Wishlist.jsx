import { useEffect, useState } from 'react';
import AnimeGrid from '../components/AnimeGrid';
import { useAuth } from '../auth/AuthContext';
import { getWishlist } from '../api/backend';

// "รายการที่อยากดู" ของสมาชิกที่ login อยู่
function Wishlist() {
  const { member, token } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getWishlist(token);
        if (!ignore) { setItems(data.items); setStatus('success'); }
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
      <AnimeGrid items={items} status={status} error={error}
                 emptyText="ยังไม่มีอนิเมะในรายการที่อยากดู"
                 onRetry={() => setReloadKey(k => k + 1)} />
    </div>
  );
}

export default Wishlist;
