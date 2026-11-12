import { Link } from 'react-router-dom';

// การ์ดอนิเมะ 1 ใบ รับ { id, title, titleTh, year, genre, rating, episodes, poster }
// โปสเตอร์เป็นพระเอก ไม่มีกรอบการ์ด คะแนนเป็นป้ายติดมุมรูป
function AnimeCard({ anime }) {
  return (
    <Link to={`/anime/${anime.id}`} className="group block">
      <div className="relative overflow-hidden rounded-md bg-foam">
        {anime.poster ? (
          <img src={anime.poster} alt={`โปสเตอร์ ${anime.title}`} loading="lazy" className="aspect-[2/3] w-full object-cover" />
        ) : (
          <div className="grid aspect-[2/3] w-full place-items-center text-4xl">🌊</div>
        )}
        {anime.rating != null && (
          <span className="absolute left-2 top-2 rounded bg-coral px-1.5 py-0.5 text-xs font-medium text-ink">⭐ {anime.rating}</span>
        )}
      </div>
      <h3 className="mt-2 truncate font-medium text-ink group-hover:text-sea" title={anime.title}>{anime.title}</h3>
      {anime.titleTh && <p className="truncate text-sm text-mute">{anime.titleTh}</p>}
      <p className="mt-0.5 flex justify-between gap-2 text-xs text-mute">
        <span>{anime.year ?? 'ไม่ระบุปี'}</span>
        {anime.episodes != null && <span>{anime.episodes} ตอน</span>}
      </p>
    </Link>
  );
}

export default AnimeCard;
