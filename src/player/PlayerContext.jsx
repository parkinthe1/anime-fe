import { createContext, useContext, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { recordPlay } from '../api/backend';

// ตัวเล่นเพลงเดียวของทั้งเว็บ (เล่นเสียงตัวอย่าง 30 วินาทีจาก previewUrl) ทุกหน้าเรียก usePlayer() เหมือน useAuth()
// สมาชิกที่กดฟังเพลงใหม่ จะบันทึกประวัติการฟังไปที่ Go (ถ้าบันทึกไม่สำเร็จก็ไม่กระทบการเล่น)
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { token } = useAuth();
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);

  function play(song) {
    const audio = audioRef.current;
    if (!song?.previewUrl || !audio) return;
    setError(null);
    if (current?.id !== song.id) {
      setCurrent(song);
      audio.src = song.previewUrl;
      if (token) recordPlay(song.id, token).catch(() => {});
    }
    const started = audio.play();
    if (started && started.catch) started.catch(() => setError('เล่นเสียงไม่ได้ ลองใหม่อีกครั้ง'));
  }

  function pause() {
    audioRef.current?.pause();
  }

  return (
    <PlayerContext.Provider value={{ current, playing, play, pause }}>
      {children}
      {current && <div className="h-20" aria-hidden="true" />}
      <div className={'fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur ' + (current ? '' : 'hidden')}>
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{current?.title}</p>
            <p className="truncate text-xs text-slate-400">{current?.artistName}</p>
            {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          </div>
          <audio ref={audioRef} controls
                 onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
                 className="h-9 w-56 md:w-80" />
        </div>
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
