import { useState } from 'react';
import { btnPrimary, inputClass } from './common/States';

// ฟอร์มรีวิว: ไม่รู้ว่าส่งไปที่ไหน รับ onSubmit(text) จากแม่ซึ่งไปยิง POST จริง ถ้า throw ฟอร์มโชว์ error เอง
function ReviewForm({ animeTitle, onSubmit }) {
  const [review, setReview] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');   // 'typing' | 'submitting' | 'success'

  if (status === 'success') {
    return <p className="rounded-lg bg-violet-500/10 p-4 text-violet-300">ขอบคุณสำหรับรีวิว {animeTitle} 🎉</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit(review);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-white">เขียนรีวิว {animeTitle}</h3>
      <textarea value={review} onChange={(e) => setReview(e.target.value)}
                disabled={status === 'submitting'} rows={3}
                placeholder="ดูแล้วรู้สึกอย่างไร (อย่างน้อย 10 ตัวอักษร)"
                className={inputClass} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={review.trim().length === 0 || status === 'submitting'} className={btnPrimary}>
          {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
        {error && <p className="text-sm text-red-400">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
