import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { updateProfile, changePassword } from '../api/backend';
import { btnPrimary, inputClass } from '../components/common/States';

// หน้าโปรไฟล์ของสมาชิก: แก้ชื่อที่แสดง + เปลี่ยนรหัสผ่าน (ครอบด้วย ProtectedRoute ใน App.jsx)
function Profile() {
  const { member, token, updateMember } = useAuth();

  // --- ส่วนแก้ชื่อ ---
  const [displayName, setDisplayName] = useState(member?.displayName ?? '');
  const [nameStatus, setNameStatus] = useState('typing');
  const [nameMsg, setNameMsg] = useState(null);       // { ok: boolean, text }

  async function handleName(e) {
    e.preventDefault();
    setNameStatus('submitting');
    setNameMsg(null);
    try {
      const data = await updateProfile(displayName.trim(), token);
      updateMember(data.member);
      setNameMsg({ ok: true, text: 'บันทึกชื่อเรียบร้อยแล้ว' });
    } catch (err) {
      setNameMsg({ ok: false, text: err.message });
    } finally {
      setNameStatus('typing');
    }
  }

  // --- ส่วนเปลี่ยนรหัสผ่าน ---
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState('typing');
  const [pwMsg, setPwMsg] = useState(null);

  async function handlePassword(e) {
    e.preventDefault();
    if (next !== confirm) {
      setPwMsg({ ok: false, text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;                                          // ไม่ยิง Backend
    }
    setPwStatus('submitting');
    setPwMsg(null);
    try {
      await changePassword(current, next, token);
      setPwMsg({ ok: true, text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      setPwMsg({ ok: false, text: err.message });
    } finally {
      setPwStatus('typing');
    }
  }

  const msgClass = (m) => 'text-sm ' + (m.ok ? 'text-emerald-400' : 'text-red-400');
  const card = 'rounded-xl border border-slate-800 bg-slate-900 p-5';

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">โปรไฟล์ของฉัน</h1>
      <p className="mt-1 text-sm text-slate-400">
        {member?.email} <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{member?.role}</span>
      </p>

      <form onSubmit={handleName} className={card + ' mt-6 space-y-3'}>
        <h2 className="font-medium text-white">ชื่อที่แสดง</h2>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
               aria-label="ชื่อที่แสดง" required className={inputClass} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={nameStatus === 'submitting' || displayName.trim() === ''} className={btnPrimary}>
            {nameStatus === 'submitting' ? 'กำลังบันทึก...' : 'บันทึกชื่อ'}
          </button>
          {nameMsg && <p role="status" className={msgClass(nameMsg)}>{nameMsg.text}</p>}
        </div>
      </form>

      <form onSubmit={handlePassword} className={card + ' mt-6 space-y-3'}>
        <h2 className="font-medium text-white">เปลี่ยนรหัสผ่าน</h2>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
               placeholder="รหัสผ่านปัจจุบัน" aria-label="รหัสผ่านปัจจุบัน" required className={inputClass} />
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)}
               placeholder="รหัสผ่านใหม่ (4 ตัวขึ้นไป)" aria-label="รหัสผ่านใหม่" required minLength={4} className={inputClass} />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
               placeholder="ยืนยันรหัสผ่านใหม่" aria-label="ยืนยันรหัสผ่านใหม่" required minLength={4} className={inputClass} />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pwStatus === 'submitting'} className={btnPrimary}>
            {pwStatus === 'submitting' ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
          </button>
          {pwMsg && <p role="status" className={msgClass(pwMsg)}>{pwMsg.text}</p>}
        </div>
      </form>
    </div>
  );
}

export default Profile;
