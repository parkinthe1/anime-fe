import { NavLink, Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  'whitespace-nowrap rounded-full px-4 py-2 text-sm transition lg:rounded-md lg:px-3 ' +
  (isActive ? 'bg-white font-medium text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white');

// เส้นคลื่นเล็ก ๆ ข้างชื่อเว็บ
function WaveMark() {
  return (
    <svg viewBox="0 0 32 20" width="30" height="19" aria-hidden="true" className="shrink-0 text-coral">
      <path d="M0 8c4 0 4-6 8-6s4 6 8 6 4-6 8-6 4 6 8 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M0 17c4 0 4-6 8-6s4 6 8 6 4-6 8-6 4 6 8 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function UserBox({ className }) {
  const { isLoggedIn, member, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className={'items-center gap-x-4 gap-y-2 text-sm ' + className}>
      {isLoggedIn ? (
        <>
          <Link to="/me" className="text-white hover:underline">สวัสดี {member?.displayName}</Link>
          <button onClick={handleLogout} className="text-white/70 hover:text-white">ออกจากระบบ</button>
        </>
      ) : (
        <>
          <Link to="/login" className="rounded-full bg-coral px-4 py-1.5 font-medium text-ink hover:brightness-105">เข้าสู่ระบบ</Link>
          <Link to="/register" className="text-white/70 hover:text-white">สมัครสมาชิก</Link>
        </>
      )}
    </div>
  );
}

// จอใหญ่: แถบด้านข้างสีกรมท่าตรึงไว้ซ้าย / มือถือ: แถบด้านบน เมนูเลื่อนซ้ายขวาได้
function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <header className="bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:px-5 lg:py-8">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 lg:px-3 lg:pt-0">
        <Link to="/" className="flex items-center gap-2">
          <WaveMark />
          <span className="font-display text-2xl tracking-tight">AniWave</span>
        </Link>
        <UserBox className="flex lg:hidden" />
      </div>

      <nav aria-label="เมนูหลัก" className="flex gap-1 overflow-x-auto px-3 py-3 lg:mt-8 lg:flex-col lg:overflow-visible lg:px-0 lg:py-0">
        <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
        <NavLink to="/anime" className={linkClass}>อนิเมะ</NavLink>
        {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass}>อยากดู</NavLink>}
        <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
        {isAdmin && <NavLink to="/admin" className={linkClass}>หลังบ้าน</NavLink>}
      </nav>

      <UserBox className="hidden border-t border-white/15 pt-5 lg:mt-auto lg:flex lg:flex-col lg:items-start lg:px-3" />
    </header>
  );
}

export default Navbar;
