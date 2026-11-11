import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { putVote, addToWishlist, removeFromWishlist, getWishlist } from '../api/backend';

// แถบปุ่มใต้ชื่อเรื่อง: ให้คะแนน 1 ถึง 10 และปุ่มเพิ่มเข้า wishlist (เฉพาะสมาชิก)
function AnimeActions({ animeId }) {
  const { isLoggedIn, token } = useAuth();
  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);

  // รู้ว่าเรื่องนี้อยู่ใน wishlist อยู่แล้วหรือยัง ปุ่มจะได้แสดงถูกตั้งแต่เปิดหน้า
  useEffect(() => {
    if (!isLoggedIn) return;
    let ignore = false;
    Promise.resolve(getWishlist(token))
      .then(data => { if (!ignore && data) setInWishlist(data.items.some(a => String(a.id) === String(animeId))); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [isLoggedIn, token, animeId]);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        <Link to="/login" className="text-violet-400 hover:underline">เข้าสู่ระบบ</Link> เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleVote(score) {
    try {
      setMessage(null);
      await putVote(animeId, score, token);     // รอ server สำเร็จก่อนค่อยเปลี่ยน state
      setMyScore(score);
      setMessage(`ให้คะแนน ${score}/10 เรียบร้อยแล้ว`);
    } catch (err) {
      setMessage(err.message || 'ไม่สามารถให้คะแนนได้');
    }
  }

  async function handleWishlist() {
    try {
      setMessage(null);
      if (inWishlist) {
        await removeFromWishlist(animeId, token);
        setInWishlist(false);
        setMessage('ลบออกจากรายการที่อยากดูแล้ว');
      } else {
        await addToWishlist(animeId, token);
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากดูแล้ว');
      }
    } catch (err) {
      setMessage(err.message || 'ไม่สามารถแก้ไขรายการที่อยากดูได้');
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-400">ให้คะแนน</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => handleVote(n)} aria-label={`ให้ ${n} คะแนน`}
                  className={'h-8 w-8 rounded-lg border text-sm ' +
                    (myScore === n ? 'border-violet-400 bg-violet-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800')}>
            {n}
          </button>
        ))}
      </div>

      <button onClick={handleWishlist}
              className={'rounded-lg border px-4 py-2 text-sm ' +
                (inWishlist ? 'border-violet-400 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800')}>
        {inWishlist ? '❤️ อยู่ในรายการที่อยากดูแล้ว' : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {message && <p role="status" className="text-sm text-slate-400">{message}</p>}
    </div>
  );
}

export default AnimeActions;
