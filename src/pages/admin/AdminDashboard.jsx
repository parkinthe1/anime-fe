import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading } from '../../components/common/States';

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

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
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  const box = 'rounded-xl border border-slate-800 bg-slate-900 p-4';
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="อนิเมะ" value={stats.anime} to="/admin/anime" />
        <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
        <StatCard label="admin" value={stats.admins} />
        <StatCard label="โหวต" value={stats.votes} />
        <StatCard label="อยากดู" value={stats.wishlistItems} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={box}>
          <h2 className="font-semibold text-white">อนิเมะที่สมาชิกให้คะแนนสูงสุด</h2>
          {stats.topVoted.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีใครโหวต</p>
          ) : (
            <ol className="mt-3 divide-y divide-slate-800">
              {stats.topVoted.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 py-2">
                  <span className="w-5 text-sm text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/anime/${a.id}`} className="block truncate text-sm font-medium text-white hover:text-violet-300">{a.title}</Link>
                    {a.titleTh && <p className="truncate text-xs text-slate-400">{a.titleTh}</p>}
                  </div>
                  <span className="text-sm text-slate-300">⭐ {a.voteAverage} <span className="text-xs text-slate-500">({a.voteCount})</span></span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={box}>
          <h2 className="font-semibold text-white">สมาชิกใหม่ล่าสุด</h2>
          <ul className="mt-3 divide-y divide-slate-800">
            {stats.newestMembers.map(m => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{m.displayName}</p>
                  <p className="truncate text-xs text-slate-400">{m.email}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {m.role === 'admin' && <span className="mr-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-300">admin</span>}
                  {dateTH(m.createdAt)}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/members" className="mt-3 inline-block text-sm text-violet-400 hover:underline">ดูสมาชิกทั้งหมด</Link>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
