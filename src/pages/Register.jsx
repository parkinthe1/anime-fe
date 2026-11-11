import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/common/States';

function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;                                         // ไม่ส่งไป Backend
    }
    setStatus('submitting');
    setError(null);
    try {
      await register(email, password, displayName);
      navigate('/login', { state: { from: '/' } });   // สมัครแล้วให้ login ด้วยบัญชีใหม่
    } catch (err) {
      setError(err.message);
      setStatus('typing');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold text-white">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
               placeholder="ชื่อที่แสดง" aria-label="ชื่อที่แสดง" required className={inputClass} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               placeholder="อีเมล" aria-label="อีเมล" required className={inputClass} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               placeholder="รหัสผ่าน (4 ตัวขึ้นไป)" aria-label="รหัสผ่าน" required minLength={4} className={inputClass} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
               placeholder="ยืนยันรหัสผ่าน" aria-label="ยืนยันรหัสผ่าน" required minLength={4} className={inputClass} />
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-slate-400">
        มีบัญชีแล้ว? <Link to="/login" className="text-violet-400 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;
