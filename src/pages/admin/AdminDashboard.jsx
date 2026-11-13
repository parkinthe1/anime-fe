import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading } from '../../components/common/States';
import { dateTH } from '../../utils/format';

function StatCard({ label, value, to }) {
  const body = (
    <>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    </>
  );
  const cls = 'rounded-xl border border-slate-800 bg-slate-900 p-4';
  return to ? <Link to={to} className={cls + ' block hover:border-violet-500/60'}>{body}</Link> : <div className={cls}>{body}</div>;
}

// ภาพรวมระบบ: ตัวเลขจากฐานข้อมูลผ่าน Go (/api/admin/stats)
function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminStats(token);
        if (!ignore) { setStats(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
        <StatCard label="ผู้ดูแล (admin)" value={stats.admins} to="/admin/members" />
        <StatCard label="เพลง" value={stats.songs} to="/admin/songs" />
        <StatCard label="ศิลปิน" value={stats.artists} to="/admin/artists" />
        <StatCard label="เพลย์ลิสต์" value={stats.playlists} to="/admin/playlists" />
        <StatCard label="ครั้งที่กดฟัง" value={stats.plays} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-medium text-white">เพลงที่ถูกฟังมากที่สุด</h2>
          {stats.topSongs.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">ยังไม่มีประวัติการฟัง</p>
          ) : (
            <ol className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900">
              {stats.topSongs.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                  <span className="min-w-0 truncate text-slate-200">{i + 1}. {s.title} <span className="text-slate-500">— {s.artistName}</span></span>
                  <span className="shrink-0 text-slate-400">{s.plays} ครั้ง</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-medium text-white">สมาชิกใหม่ล่าสุด</h2>
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900">
            {stats.newestMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                <span className="truncate text-slate-200">{m.displayName} <span className="text-slate-500">{m.email}</span></span>
                <span className="shrink-0 text-slate-400">{dateTH(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
