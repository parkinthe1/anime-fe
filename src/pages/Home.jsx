import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { ErrorBox, Loading, btnPrimary, btnGhost } from '../components/common/States';
import { getAnimeList } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

// สลับลำดับแบบสุ่มบนสำเนา ไม่แตะ array เดิม
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Home() {
  const { isLoggedIn } = useAuth();
  const [picks, setPicks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAnimeList();
        if (!ignore) { setPicks(shuffle(list)); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6">
      <section className="py-14 md:py-20">
        <p className="text-sm font-medium text-violet-400">ยินดีต้อนรับสู่ AniWave</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
          อนิเมะที่น่าดู รวมไว้ที่เดียว
        </h1>
        <p className="mt-4 max-w-xl text-slate-400">
          ค้นหาอนิเมะ ให้คะแนน เขียนรีวิว และเก็บเรื่องที่อยากดูไว้ในบัญชีของคุณ
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/anime" className={btnPrimary}>ดูอนิเมะทั้งหมด</Link>
          {!isLoggedIn && <Link to="/register" className={btnGhost}>สมัครสมาชิก</Link>}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">อนิเมะแนะนำ</h2>
            <p className="text-sm text-slate-500">สุ่มลำดับใหม่ทุกครั้งที่เปิดหน้า</p>
          </div>
          {status === 'success' && (
            <button onClick={() => setPicks(shuffle(picks))} className="text-sm text-violet-400 hover:underline">สุ่มใหม่</button>
          )}
        </div>
        {status === 'loading' && <Loading />}
        {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
        {status === 'success' && <FeaturedCarousel items={picks} />}
      </section>
    </div>
  );
}

export default Home;
