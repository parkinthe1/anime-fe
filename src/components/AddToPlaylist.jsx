import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { addSongToPlaylist, getMyPlaylists } from '../api/backend';

// ปุ่ม "เพิ่มลงเพลย์ลิสต์" ของสมาชิก: กดแล้วโหลดเพลย์ลิสต์ของตัวเอง เลือกลิสต์ -> ยิง Go (guest ไม่เห็นปุ่มนี้)
function AddToPlaylist({ song }) {
  const { isLoggedIn, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');        // idle | loading | ready | error
  const [lists, setLists] = useState([]);
  const [message, setMessage] = useState(null);        // { ok, text }

  if (!isLoggedIn) return null;

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setStatus('loading');
    setMessage(null);
    try {
      setLists(await getMyPlaylists(token));
      setStatus('ready');
    } catch (err) {
      setMessage({ ok: false, text: err.message });
      setStatus('error');
    }
  }

  async function add(list) {
    setMessage(null);
    try {
      await addSongToPlaylist(list.id, song.id, token);
      setMessage({ ok: true, text: `เพิ่มลง "${list.name}" แล้ว` });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  }

  return (
    <div className="relative">
      <button onClick={toggle} aria-label={`เพิ่ม ${song.title} ลงเพลย์ลิสต์`} aria-expanded={open}
              className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">
        ＋ เพลย์ลิสต์
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
          {status === 'loading' && <p role="status" className="px-2 py-1 text-xs text-slate-400">กำลังโหลด...</p>}
          {status === 'ready' && lists.length === 0 && (
            <p className="px-2 py-1 text-xs text-slate-400">
              ยังไม่มีเพลย์ลิสต์ <Link to="/me/playlists" className="text-violet-400 hover:underline">สร้างเลย</Link>
            </p>
          )}
          {status === 'ready' && lists.map((l) => (
            <button key={l.id} onClick={() => add(l)}
                    className="block w-full truncate rounded px-2 py-1 text-left text-sm text-slate-200 hover:bg-slate-800">
              {l.name}
            </button>
          ))}
          {message && (
            <p role={message.ok ? 'status' : 'alert'} className={'px-2 pt-1 text-xs ' + (message.ok ? 'text-emerald-400' : 'text-red-400')}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AddToPlaylist;
