import { useEffect, useState } from 'react';
import PlaylistGrid from '../components/PlaylistGrid';
import { getMyLikes } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// เพลย์ลิสต์ที่ฉันกดถูกใจ (member)
function Likes() {
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
        const data = await getMyLikes(token);
        if (!ignore) { setItems(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เพลย์ลิสต์ที่ถูกใจ</h1>
      <div className="mt-6">
        <PlaylistGrid items={items} status={status} error={error} onRetry={() => setReloadKey((k) => k + 1)}
                      emptyText="ยังไม่ได้กดถูกใจเพลย์ลิสต์ไหนเลย ลองดูที่หน้าเพลย์ลิสต์" />
      </div>
    </div>
  );
}

export default Likes;
