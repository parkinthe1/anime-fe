import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { ErrorBox, Loading, btnPrimary, btnGhost } from '../components/common/States';
import { getTopAnime } from '../api/tenrai';
import { fetchOverrideMap, withOverrides } from '../api/catalog';
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

// กรอบรูป "เรื่องเด่น" ใช้เรื่องแรกของรายการที่สุ่มไว้ กดสุ่มใหม่แล้วเปลี่ยนเรื่อง
function Spotlight({ anime, status }) {
  if (status === 'error') return null;
  const frame = 'block w-60 max-w-full -rotate-2 rounded-lg border-2 border-ink bg-white p-2 shadow-panel md:justify-self-center';
  if (!anime) {
    return (
      <div aria-hidden="true" className={frame + (status === 'loading' ? ' animate-pulse' : '')}>
        <div className="aspect-[2/3] rounded-md bg-foam" />
        <div className="mt-2 h-5" />
      </div>
    );
  }
  return (
    <Link to={`/anime/${anime.id}`} className={frame + ' group'}>
      {anime.poster ? (
        <img src={anime.poster} alt={`โปสเตอร์ ${anime.title}`} className="aspect-[2/3] w-full rounded-md object-cover" />
      ) : (
        <div className="grid aspect-[2/3] w-full place-items-center rounded-md bg-foam text-5xl">🌊</div>
      )}
      <p className="mt-2 truncate px-1 text-sm font-medium group-hover:text-sea">{anime.title}</p>
    </Link>
  );
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
        const [top, overrides] = await Promise.all([getTopAnime(), fetchOverrideMap()]);
        const list = Array.isArray(top) ? withOverrides(top, overrides) : top;
        if (!ignore) { setPicks(shuffle(list)); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8">
      <section className="grid items-center gap-10 py-12 md:grid-cols-[minmax(0,1fr)_15rem] md:py-16">
        <div>
          <h1 className="max-w-xl text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            อนิเมะที่น่าดู รวมไว้ที่เดียว
          </h1>
          <p className="mt-4 max-w-md text-mute">
            ค้นหาอนิเมะ ให้คะแนน เขียนรีวิว และเก็บเรื่องที่อยากดูไว้ในบัญชีของคุณ
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/anime" className={btnPrimary}>ดูอนิเมะทั้งหมด</Link>
            {!isLoggedIn && <Link to="/register" className={btnGhost}>สมัครสมาชิก</Link>}
          </div>
        </div>
        <Spotlight anime={picks[0]} status={status} />
      </section>

      <section className="border-t border-line pt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-medium">อนิเมะแนะนำ</h2>
            <p className="text-sm text-mute">สุ่มลำดับใหม่ทุกครั้งที่เปิดหน้า</p>
          </div>
          {status === 'success' && (
            <button onClick={() => setPicks(shuffle(picks))} className="text-sm font-medium text-sea hover:underline">สุ่มใหม่</button>
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
