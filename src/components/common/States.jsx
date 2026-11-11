// ชิ้นส่วนที่ทุกหน้าใช้ร่วมกัน: สถานะ loading / error / empty, ปุ่ม, ช่องกรอก, กล่องยืนยัน

export const btnPrimary =
  'rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-400';
export const btnGhost =
  'rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:text-slate-600';
export const btnDanger =
  'rounded-lg border border-red-500/50 bg-slate-900 px-4 py-2 text-sm text-red-300 hover:bg-red-950 disabled:text-slate-600';
export const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60';

export function Loading({ text = 'กำลังโหลด...' }) {
  return <p role="status" className="py-12 text-center text-slate-400">{text}</p>;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 p-6 text-center">
      <p className="font-medium text-red-300">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-red-400">{error?.message}</p>
      {onRetry && <button onClick={onRetry} className={btnDanger + ' mt-4'}>ลองใหม่</button>}
    </div>
  );
}

export function EmptyBox({ text }) {
  return <p className="py-16 text-center text-slate-500">{text}</p>;
}

// กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ (ลบ, เปลี่ยนสิทธิ์)
export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="mt-2 text-sm text-slate-300">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>{busy ? 'กำลังทำ...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
}
