// ชิ้นส่วนที่ทุกหน้าใช้ร่วมกัน: สถานะ loading / error / empty, ปุ่ม, ช่องกรอก, กล่องยืนยัน

// ปุ่มหลักมีกรอบหมึกกับเงาทึบ กดแล้วยุบลงเหมือนกดปุ่มจริง
export const btnPrimary =
  'inline-flex items-center justify-center rounded-full border-2 border-ink bg-coral px-5 py-2 text-sm font-medium text-ink shadow-press transition hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:border-line disabled:bg-foam disabled:text-mute disabled:shadow-none';
export const btnGhost =
  'inline-flex items-center justify-center rounded-full border border-ink/30 bg-white px-5 py-2 text-sm font-medium text-ink transition hover:border-ink hover:bg-foam disabled:text-mute/60';
export const btnDanger =
  'inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:text-mute/60';
export const inputClass =
  'w-full rounded-md border border-ink/25 bg-white px-3 py-2 text-ink placeholder-mute/70 focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/25 disabled:opacity-60';

export function Loading({ text = 'กำลังโหลด...' }) {
  return <p role="status" className="py-12 text-center text-mute">{text}</p>;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-red-700">{error?.message}</p>
      {onRetry && <button onClick={onRetry} className={btnDanger + ' mt-4'}>ลองใหม่</button>}
    </div>
  );
}

export function EmptyBox({ text }) {
  return <p className="py-16 text-center text-mute">{text}</p>;
}

// กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ (ลบ, เปลี่ยนสิทธิ์)
export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border-2 border-ink bg-white p-6 shadow-panel">
        <h2 className="text-lg font-medium text-ink">{title}</h2>
        <div className="mt-2 text-sm text-ink/80">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>{busy ? 'กำลังทำ...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
}
