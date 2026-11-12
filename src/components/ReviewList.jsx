// รายการรีวิวของอนิเมะ 1 เรื่อง รับ items จาก GET /api/anime/{id}/reviews
function ReviewList({ items }) {
  if (items.length === 0) {
    return <p className="text-sm text-mute">ยังไม่มีรีวิว เป็นคนแรกเลย</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-lg border border-line bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{r.member.displayName}</span>
            <span className="text-mute">
              {r.score != null && `⭐ ${r.score}/10 | `}
              {new Date(r.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p className="mt-2 text-ink/80">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
