import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getAdminMembers, setMemberRole } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, inputClass } from '../../components/common/States';

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// รายชื่อสมาชิก + ปุ่มเลื่อน/ลดบทบาท (ของตัวเองกดไม่ได้ Go ก็ไม่ยอมเช่นกัน)
function AdminMembers() {
  const { token, member: me } = useAuth();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);      // สมาชิกที่กำลังจะเปลี่ยนบทบาท (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAdminMembers(token);
        if (!ignore) { setMembers(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function confirmRole() {
    const nextRole = target.role === 'admin' ? 'member' : 'admin';
    setBusy(true);
    setActionError(null);
    try {
      const updated = await setMemberRole(target.id, nextRole, token);
      setMembers(members.map(m => (m.id === updated.id ? updated : m)));   // ใช้ข้อมูลที่ server ยืนยัน
      setTarget(null);
    } catch (err) {
      setActionError(err.message);
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const shown = members.filter(m => q === '' || m.displayName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">สมาชิก</h2>
          {status === 'success' && <p className="text-sm text-slate-400">ทั้งหมด {members.length} คน (admin {members.filter(m => m.role === 'admin').length})</p>}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นชื่อหรืออีเมล" className={inputClass + ' md:w-64'} />
      </div>

      {actionError && <p role="alert" className="mb-3 text-sm text-red-400">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">สมาชิก</th>
                <th className="px-4 py-3">บทบาท</th>
                <th className="px-4 py-3">สมัครเมื่อ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {shown.map(m => {
                const isMe = m.id === me?.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-2">
                      <p className="font-medium text-white">{m.displayName} {isMe && <span className="text-xs text-slate-500">(คุณ)</span>}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={'rounded-full px-2 py-0.5 text-xs ' + (m.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-300')}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{m.createdAt ? dateTH(m.createdAt) : '-'}</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => setTarget(m)} disabled={isMe}
                              className="text-violet-400 hover:underline disabled:cursor-not-allowed disabled:text-slate-600 disabled:no-underline">
                        {m.role === 'admin' ? 'ลดเป็น member' : 'เลื่อนเป็น admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">ไม่พบสมาชิก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy}
                  title={target?.role === 'admin' ? `ลด ${target?.displayName} เป็น member ?` : `เลื่อน ${target?.displayName} เป็น admin ?`}
                  onConfirm={confirmRole} onCancel={() => setTarget(null)}>
        <p>{target?.role === 'admin'
          ? 'คนนี้จะเข้าหลังบ้านไม่ได้อีกเมื่อ login ใหม่'
          : 'คนนี้จะแก้ไขอนิเมะและบทบาทของสมาชิกคนอื่นได้ มีผลเมื่อเขา login ใหม่'}</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminMembers;
