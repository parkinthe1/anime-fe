// ตัวช่วยแสดงผลที่ใช้ซ้ำหลายหน้า

// 205 -> "3:25"  (ไม่มีค่า -> "-")
export function formatDuration(sec) {
  if (sec === null || sec === undefined || Number.isNaN(Number(sec))) return '-';
  const total = Math.max(0, Math.round(Number(sec)));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export const dateTH = (iso) =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
