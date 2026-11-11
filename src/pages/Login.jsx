import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { btnPrimary, inputClass } from '../components/common/States';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setStatus('typing');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-semibold text-white">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               placeholder="อีเมล" aria-label="อีเมล" required className={inputClass} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               placeholder="รหัสผ่าน" aria-label="รหัสผ่าน" required minLength={4} className={inputClass} />
        <button type="submit" disabled={status === 'submitting'} className={btnPrimary + ' w-full'}>
          {status === 'submitting' ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-slate-400">
        ยังไม่มีบัญชี? <Link to="/register" className="text-violet-400 hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;
