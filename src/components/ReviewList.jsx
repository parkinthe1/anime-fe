// รายการรีวิวของอนิเมะ 1 เรื่อง รับ items จาก GET /api/anime/{id}/reviews
function ReviewList({ items }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">ยังไม่มีรีวิว เป็นคนแรกเลย</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white">{r.member.displayName}</span>
            <span className="text-slate-500">
              {r.score != null && `⭐ ${r.score}/10 | `}
              {new Date(r.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p className="mt-2 text-slate-300">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
