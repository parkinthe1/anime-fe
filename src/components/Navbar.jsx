import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  'text-sm transition ' + (isActive ? 'font-medium text-violet-400' : 'text-slate-400 hover:text-violet-300');

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-violet-400">🌊 AniWave</Link>
        <div className="flex flex-wrap items-center gap-5">
          <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
          <NavLink to="/anime" className={linkClass}>อนิเมะ</NavLink>
          {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass}>อยากดู</NavLink>}
          <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <>
              <Link to="/me" className="text-slate-300 hover:text-violet-300">สวัสดี {member?.displayName}</Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-violet-300">ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-slate-400 hover:text-violet-300">สมัครสมาชิก</Link>
              <Link to="/login" className="rounded-lg border border-violet-500/50 px-3 py-1.5 text-violet-300 hover:bg-slate-800">เข้าสู่ระบบ</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
