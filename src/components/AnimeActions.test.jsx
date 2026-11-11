import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import AnimeActions from './AnimeActions';
import { putVote, addToWishlist, getWishlist } from '../api/backend';

jest.mock('../api/backend');

function renderActions() {
  return render(
    <AuthProvider>
      <MemoryRouter><AnimeActions animeId={5} /></MemoryRouter>
    </AuthProvider>
  );
}

function loginAsMember() {
  localStorage.setItem('aniwave.token', 'tok');
  localStorage.setItem('aniwave.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));
}

beforeEach(() => localStorage.clear());

test('guest ต้องเห็นลิงก์เข้าสู่ระบบ และไม่เห็นปุ่มให้คะแนน', () => {
  renderActions();

  expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'ให้ 8 คะแนน' })).not.toBeInTheDocument();
});

test('member กดให้คะแนน ต้องเรียก backend ด้วย id คะแนน และ token แล้วขึ้นข้อความสำเร็จ', async () => {
  const user = userEvent.setup();
  loginAsMember();
  getWishlist.mockResolvedValue({ items: [] });
  putVote.mockResolvedValue({});
  renderActions();

  await user.click(screen.getByRole('button', { name: 'ให้ 8 คะแนน' }));

  expect(putVote).toHaveBeenCalledWith(5, 8, 'tok');
  expect(await screen.findByText('ให้คะแนน 8/10 เรียบร้อยแล้ว')).toBeInTheDocument();
});

test('backend ปฏิเสธคะแนน ต้องโชว์ข้อความ error และไม่ขึ้นว่าให้คะแนนสำเร็จ', async () => {
  const user = userEvent.setup();
  loginAsMember();
  getWishlist.mockResolvedValue({ items: [] });
  putVote.mockRejectedValue(new Error('คะแนนต้องเป็นเลข 1 ถึง 10'));
  renderActions();

  await user.click(screen.getByRole('button', { name: 'ให้ 3 คะแนน' }));

  expect(await screen.findByText('คะแนนต้องเป็นเลข 1 ถึง 10')).toBeInTheDocument();
  expect(screen.queryByText(/เรียบร้อยแล้ว/)).not.toBeInTheDocument();
});

test('กดเพิ่มเข้า wishlist ต้องเรียก backend แล้วปุ่มเปลี่ยนเป็น "อยู่ในรายการ"', async () => {
  const user = userEvent.setup();
  loginAsMember();
  getWishlist.mockResolvedValue({ items: [] });
  addToWishlist.mockResolvedValue({ animeId: 5 });
  renderActions();

  await user.click(screen.getByRole('button', { name: /เพิ่มเข้ารายการที่อยากดู/ }));

  expect(addToWishlist).toHaveBeenCalledWith(5, 'tok');
  expect(await screen.findByRole('button', { name: /อยู่ในรายการที่อยากดูแล้ว/ })).toBeInTheDocument();
});

test('เรื่องที่อยู่ใน wishlist อยู่แล้ว ต้องแสดงปุ่มถูกตั้งแต่เปิดหน้า', async () => {
  loginAsMember();
  getWishlist.mockResolvedValue({ items: [{ id: 5 }] });
  renderActions();

  expect(await screen.findByRole('button', { name: /อยู่ในรายการที่อยากดูแล้ว/ })).toBeInTheDocument();
});
