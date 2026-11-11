import { Link } from 'react-router-dom';

// การ์ดอนิเมะ 1 ใบ รับ { id, title, titleTh, year, genre, rating, episodes, poster }
function AnimeCard({ anime }) {
  return (
    <Link to={`/anime/${anime.id}`}
          className="group block overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-900/20">
      {anime.poster ? (
        <img src={anime.poster} alt={`โปสเตอร์ ${anime.title}`} loading="lazy" className="aspect-[2/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[2/3] w-full place-items-center bg-slate-800 text-4xl">🌊</div>
      )}
      <div className="p-3">
        <h3 className="truncate font-medium text-white" title={anime.title}>{anime.title}</h3>
        {anime.titleTh && <p className="truncate text-sm text-slate-400">{anime.titleTh}</p>}
        <p className="mt-1 text-xs text-slate-500">
          {anime.year ?? 'ไม่ระบุปี'}
          {anime.rating != null && ` | ⭐ ${anime.rating}`}
          {anime.episodes != null && ` | ${anime.episodes} ตอน`}
        </p>
      </div>
    </Link>
  );
}

export default AnimeCard;
