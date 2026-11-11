import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import AnimeDetail from './AnimeDetail';
import { getAnime, getReviews, postReview } from '../api/backend';

jest.mock('../api/backend');

const FRIEREN = { id: 1, title: 'Frieren', titleTh: 'คำอำลาของฟรีเรน', year: 2023, genre: 'Fantasy', episodes: 28, status: 'finished', rating: 9.3, synopsis: 'เอลฟ์ออกเดินทางอีกครั้ง', poster: null };

function renderDetail() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/anime/1']}>
        <Routes><Route path="/anime/:id" element={<AnimeDetail />} /></Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => localStorage.clear());

test('โหลดสำเร็จ ต้องเห็นรายละเอียดและรีวิวที่มีอยู่', async () => {
  getAnime.mockResolvedValue(FRIEREN);
  getReviews.mockResolvedValue({ items: [{ id: 1, text: 'ภาพสวยมาก', createdAt: '2026-11-01T00:00:00.000Z', score: 9, member: { id: 5, displayName: 'Mai' } }] });
  renderDetail();

  expect(await screen.findByRole('heading', { name: 'Frieren' })).toBeInTheDocument();
  expect(screen.getByText('เอลฟ์ออกเดินทางอีกครั้ง')).toBeInTheDocument();
  expect(await screen.findByText('ภาพสวยมาก')).toBeInTheDocument();
  expect(getAnime).toHaveBeenCalledWith('1');
});

test('guest ต้องไม่เห็นฟอร์มรีวิว แต่เห็นลิงก์ให้ไปเข้าสู่ระบบ', async () => {
  getAnime.mockResolvedValue(FRIEREN);
  getReviews.mockResolvedValue({ items: [] });
  renderDetail();

  await screen.findByRole('heading', { name: 'Frieren' });

  expect(screen.queryByPlaceholderText(/ดูแล้วรู้สึกอย่างไร/)).not.toBeInTheDocument();
  expect(screen.getByText('ยังไม่มีรีวิว เป็นคนแรกเลย')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'เข้าสู่ระบบ' }).length).toBeGreaterThan(0);
});

test('ไม่พบเรื่อง (404) ต้องเห็นข้อความจาก server และลิงก์กลับ ไม่มีปุ่มลองใหม่', async () => {
  const err = new Error('ไม่พบอนิเมะเรื่องนี้');
  err.status = 404;
  getAnime.mockRejectedValue(err);
  getReviews.mockResolvedValue({ items: [] });
  renderDetail();

  expect(await screen.findByText('ไม่พบอนิเมะเรื่องนี้')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /กลับไปหน้าอนิเมะทั้งหมด/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'ลองใหม่' })).not.toBeInTheDocument();
});

test('member ส่งรีวิว ต้องเรียก backend ด้วย token และรีวิวใหม่โผล่ในรายการทันที', async () => {
  const user = userEvent.setup();
  localStorage.setItem('aniwave.token', 'tok');
  localStorage.setItem('aniwave.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));
  getAnime.mockResolvedValue(FRIEREN);
  getReviews.mockResolvedValue({ items: [] });
  postReview.mockResolvedValue({ id: 9, text: 'สนุกมาก เนื้อเรื่องดี', createdAt: '2026-11-11T00:00:00.000Z' });
  renderDetail();

  await user.type(await screen.findByPlaceholderText(/ดูแล้วรู้สึกอย่างไร/), 'สนุกมาก เนื้อเรื่องดี');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(postReview).toHaveBeenCalledWith('1', 'สนุกมาก เนื้อเรื่องดี', 'tok');
  expect(await screen.findByText('สนุกมาก เนื้อเรื่องดี')).toBeInTheDocument();
  expect(screen.getByText('Demo')).toBeInTheDocument();
});
