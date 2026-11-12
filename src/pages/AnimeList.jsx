
import { useEffect, useState } from 'react';
import AnimeGrid from '../components/AnimeGrid';
import { inputClass } from '../components/common/States';
import { getTopAnime } from '../api/tenrai';
import { fetchOverrideMap, withOverrides } from '../api/catalog';

function AnimeList() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus('loading');
      setError(null);

      try {
        const [top, overrides] = await Promise.all([getTopAnime(), fetchOverrideMap()]);
        const list = Array.isArray(top) ? withOverrides(top, overrides) : top;

        if (!Array.isArray(list)) {
          throw new Error('ข้อมูลที่ได้ไม่ใช่รายการอนิเมะ');
        }

        if (!ignore) {
          setItems(list);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const genres = [
    ...new Set(items.map(a => a.genre).filter(Boolean))
  ];

  const q = query.trim().toLowerCase();

  const shown = items.filter(a =>
    (genre === 'all' || a.genre === genre) &&
    (
      q === '' ||
      (a.title ?? '').toLowerCase().includes(q) ||
      (a.titleTh ?? '').toLowerCase().includes(q)
    )
  );

  const chipClass = (active) =>
    'rounded-full border px-3 py-1 text-sm transition ' +
    (active
      ? 'border-ink bg-ink text-white'
      : 'border-ink/25 bg-white text-ink hover:border-ink');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-ink">
            อนิเมะทั้งหมด
          </h1>

          <p className="text-sm text-mute">
            {status === 'success'
              ? `พบ ${shown.length} จาก ${items.length} เรื่อง`
              : 'กำลังเตรียมรายการ'}
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="พิมพ์ชื่ออนิเมะเพื่อค้นหา..."
          className={inputClass + ' md:w-72'}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setGenre('all')}
          className={chipClass(genre === 'all')}
        >
          ทุกแนว
        </button>

        {genres.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={chipClass(genre === g)}
          >
            {g}
          </button>
        ))}
      </div>

      <AnimeGrid
        items={shown}
        status={status}
        error={error}
        emptyText={
          items.length === 0
            ? 'ยังไม่มีอนิเมะในระบบ'
            : 'ไม่พบอนิเมะที่ค้นหา ลองคำอื่นดู'
        }
        onRetry={() => setReloadKey(k => k + 1)}
      />
    </div>
  );
}

export default AnimeList;
