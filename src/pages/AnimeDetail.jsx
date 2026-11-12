import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import AnimeActions from '../components/AnimeActions';
import { ErrorBox, Loading } from '../components/common/States';
import { useAuth } from '../auth/AuthContext';
import { getAnimeById } from '../api/tenrai';
import { fetchOverrideMap, mergeOverride } from '../api/catalog';
import { getAnimeStats, getReviews, postReview } from '../api/backend';

const STATUS_TH = { airing: 'กำลังฉาย', finished: 'จบแล้ว', upcoming: 'ยังไม่ฉาย' };

function AnimeDetail() {
  const { id } = useParams();
  const { isLoggedIn, token, member } = useAuth();
  const [anime, setAnime] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const [a, overrides] = await Promise.all([getAnimeById(id), fetchOverrideMap()]);
        if (!ignore) { setAnime(mergeOverride(a, overrides.get(Number(a?.id)))); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, reloadKey]);

  // คะแนนจากสมาชิกอยู่ที่ backend ของเรา แยก effect: ถ้าดึงไม่ได้ก็แค่ไม่แสดงคะแนนส่วนนี้
  useEffect(() => {
    let ignore = false;
    setStats(null);
    Promise.resolve(getAnimeStats(id))
      .then(data => { if (!ignore) setStats(data ?? null); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [id]);

  // รีวิวแยก effect: ถ้าโหลดรีวิวพัง หน้าเรื่องยังดูได้
  useEffect(() => {
    let ignore = false;
    getReviews(id)
      .then(data => { if (!ignore) setReviews(data.items); })
      .catch(() => { if (!ignore) setReviews([]); });
    return () => { ignore = true; };
  }, [id]);

  async function handleReviewSubmit(text) {
    const saved = await postReview(id, text, token);
    setReviews(prev => [{ ...saved, member: { id: member.id, displayName: member.displayName }, score: null }, ...prev]);
  }

  if (status === 'loading') return <div className="mx-auto max-w-5xl px-4 py-10"><Loading text="กำลังโหลดรายละเอียด..." /></div>;

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorBox error={error} onRetry={error?.status === 404 ? undefined : () => setReloadKey(k => k + 1)} />
        <Link to="/anime" className="mt-6 block text-center text-sm font-medium text-sea underline">กลับไปหน้าอนิเมะทั้งหมด</Link>
      </div>
    );
  }

  const chip = 'rounded-full bg-foam px-3 py-1 text-sm text-ink';
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <Link to="/anime" className="text-sm text-mute hover:text-sea">← กลับไปหน้าอนิเมะทั้งหมด</Link>

      <div className="mt-5 grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="md:sticky md:top-8 md:self-start">
          {anime.poster ? (
            <img src={anime.poster} alt={`โปสเตอร์ ${anime.title}`} className="w-full max-w-[14rem] rounded-lg border-2 border-ink shadow-panel" />
          ) : (
            <div className="grid aspect-[2/3] w-full max-w-[14rem] place-items-center rounded-lg border-2 border-ink bg-foam text-5xl shadow-panel">🌊</div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-medium leading-tight md:text-4xl">{anime.title}</h1>
          {anime.titleTh && <p className="mt-1 text-lg text-mute">{anime.titleTh}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={chip}>{anime.year ?? 'ไม่ระบุปี'}</span>
            {anime.genre && <span className={chip}>{anime.genre}</span>}
            {anime.episodes != null && <span className={chip}>{anime.episodes} ตอน</span>}
            {anime.status && <span className={chip}>{STATUS_TH[anime.status] ?? anime.status}</span>}
            {anime.rating != null && <span className="rounded-full bg-coral px-3 py-1 text-sm font-medium text-ink">⭐ {anime.rating}</span>}
          </div>
          {stats?.voteCount > 0 && (
            <p className="mt-2 text-sm text-mute">คะแนนจากสมาชิก AniWave ⭐ {stats.voteAverage} ({stats.voteCount} โหวต)</p>
          )}

          <p className="mt-5 max-w-prose leading-relaxed text-ink/85">{anime.synopsis || 'ยังไม่มีเรื่องย่อ'}</p>

          <AnimeActions animeId={anime.id} />

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="mb-4 text-lg font-medium">รีวิวจากสมาชิก ({reviews.length})</h2>
            <ReviewList items={reviews} />
          </div>

          <div className="mt-6 rounded-lg border-2 border-ink bg-white p-5 shadow-panel">
            {isLoggedIn ? (
              <ReviewForm key={anime.id} animeTitle={anime.title} onSubmit={handleReviewSubmit} />
            ) : (
              <p className="text-sm text-mute">
                <Link to="/login" className="font-medium text-sea underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeDetail;
