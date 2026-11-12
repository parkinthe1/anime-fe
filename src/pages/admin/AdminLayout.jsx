import { NavLink, Outlet } from 'react-router-dom';

const tabClass = ({ isActive }) =>
  'rounded-full px-4 py-1.5 text-sm transition ' + (isActive ? 'bg-ink font-medium text-white' : 'text-ink hover:bg-foam');

function AdminLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <h1 className="mr-2 text-xl font-medium text-ink">หลังบ้าน AniWave</h1>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/admin" end className={tabClass}>ภาพรวม</NavLink>
          <NavLink to="/admin/anime" className={tabClass}>อนิเมะ</NavLink>
          <NavLink to="/admin/members" className={tabClass}>สมาชิก</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
