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
      <p className="mt-4 text-sm text-mute">
        <Link to="/login" className="font-medium text-sea underline">เข้าสู่ระบบ</Link> เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
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
        <span className="mr-2 text-sm text-mute">ให้คะแนน</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => handleVote(n)} aria-label={`ให้ ${n} คะแนน`}
                  className={'h-9 w-9 rounded-full border text-sm transition ' +
                    (myScore === n ? 'border-ink bg-coral font-medium text-ink' : 'border-ink/25 bg-white text-ink hover:border-ink hover:bg-foam')}>
            {n}
          </button>
        ))}
      </div>

      <button onClick={handleWishlist}
              className={'rounded-full border px-5 py-2 text-sm font-medium transition ' +
                (inWishlist ? 'border-ink bg-foam text-ink' : 'border-ink/30 bg-white text-ink hover:border-ink hover:bg-foam')}>
        {inWishlist ? '❤️ อยู่ในรายการที่อยากดูแล้ว' : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {message && <p role="status" className="text-sm text-mute">{message}</p>}
    </div>
  );
}

export default AnimeActions;
