import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import AnimeActions from '../components/AnimeActions';
import { ErrorBox, Loading } from '../components/common/States';
import { getAnime, getReviews, postReview } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

const STATUS_TH = { airing: 'กำลังฉาย', finished: 'จบแล้ว', upcoming: 'ยังไม่ฉาย' };

function AnimeDetail() {
  const { id } = useParams();
  const { isLoggedIn, token, member } = useAuth();
  const [anime, setAnime] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const a = await getAnime(id);
        if (!ignore) { setAnime(a); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, reloadKey]);

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
    setReviews([{ ...saved, member: { id: member.id, displayName: member.displayName }, score: null }, ...reviews]);
  }

  if (status === 'loading') return <div className="mx-auto max-w-4xl px-4 py-10"><Loading text="กำลังโหลดรายละเอียด..." /></div>;

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorBox error={error} onRetry={error?.status === 404 ? undefined : () => setReloadKey(k => k + 1)} />
        <Link to="/anime" className="mt-6 block text-center text-sm text-violet-400 hover:underline">กลับไปหน้าอนิเมะทั้งหมด</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/anime" className="text-sm text-slate-400 hover:text-violet-300">← กลับไปหน้าอนิเมะทั้งหมด</Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {anime.poster ? (
          <img src={anime.poster} alt={`โปสเตอร์ ${anime.title}`} className="w-48 shrink-0 self-start rounded-xl border border-slate-800" />
        ) : (
          <div className="grid aspect-[2/3] w-48 shrink-0 place-items-center rounded-xl bg-slate-800 text-5xl">🌊</div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">{anime.title}</h1>
          {anime.titleTh && <p className="mt-1 text-slate-400">{anime.titleTh}</p>}
          <p className="mt-2 text-sm text-slate-400">
            {anime.year ?? 'ไม่ระบุปี'}
            {anime.genre && ` | ${anime.genre}`}
            {anime.episodes != null && ` | ${anime.episodes} ตอน`}
            {anime.status && ` | ${STATUS_TH[anime.status] ?? anime.status}`}
            {anime.rating != null && ` | ⭐ ${anime.rating}`}
          </p>
          {anime.voteCount > 0 && (
            <p className="mt-1 text-xs text-slate-500">คะแนนจากสมาชิก AniWave ⭐ {anime.voteAverage} ({anime.voteCount} โหวต)</p>
          )}
          <p className="mt-4 leading-relaxed text-slate-300">{anime.synopsis || 'ยังไม่มีเรื่องย่อ'}</p>

          <AnimeActions animeId={anime.id} />

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-white">รีวิวจากสมาชิก ({reviews.length})</h2>
            <ReviewList items={reviews} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
            {isLoggedIn ? (
              <ReviewForm key={anime.id} animeTitle={anime.title} onSubmit={handleReviewSubmit} />
            ) : (
              <p className="text-sm text-slate-400">
                <Link to="/login" className="text-violet-400 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeDetail;
