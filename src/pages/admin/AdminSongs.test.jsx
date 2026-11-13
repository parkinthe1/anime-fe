import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../auth/AuthContext';
import AdminSongs from './AdminSongs';
import { deleteSong, getSongs } from '../../api/backend';

jest.mock('../../api/backend');

const S1 = { id: 1, title: 'Morning Demo', artistId: 10, artistName: 'Demo Band', genre: 'Rock', durationSec: 215 };
const S2 = { id: 2, title: 'Hello Test', artistId: 11, artistName: 'Sample Voice', genre: 'Pop', durationSec: 187 };

function renderPage() {
  localStorage.setItem('musicken.token', 'tok');
  localStorage.setItem('musicken.member', JSON.stringify({ id: 2, displayName: 'Admin', role: 'admin' }));
  return render(<MemoryRouter><AuthProvider><AdminSongs /></AuthProvider></MemoryRouter>);
}

beforeEach(() => localStorage.clear());

test('โหลดรายการเพลงจาก backend แล้วแสดงในตาราง พร้อมลิงก์แก้ไขและปุ่มลบ', async () => {
  getSongs.mockResolvedValue({ items: [S1, S2], total: 2 });
  renderPage();

  expect(await screen.findByText('Morning Demo')).toBeInTheDocument();
  expect(screen.getByText('ทั้งหมด 2 เพลง')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'แก้ไข Hello Test' })).toHaveAttribute('href', '/admin/songs/2');
  expect(screen.getByRole('link', { name: '＋ เพิ่มเพลง' })).toHaveAttribute('href', '/admin/songs/new');
});

test('ลบเพลง ต้องถามยืนยันก่อน แล้วเรียก backend พร้อม token และโหลดรายการใหม่', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValueOnce({ items: [S1, S2], total: 2 });
  getSongs.mockResolvedValue({ items: [S2], total: 1 });
  deleteSong.mockResolvedValue(null);
  renderPage();
  await screen.findByText('Morning Demo');

  await user.click(screen.getByRole('button', { name: 'ลบ Morning Demo' }));
  expect(deleteSong).not.toHaveBeenCalled();                // ต้องยืนยันก่อน

  await user.click(screen.getByRole('button', { name: 'ลบ' }));

  expect(deleteSong).toHaveBeenCalledWith(1, 'tok');
  expect(await screen.findByText('ทั้งหมด 1 เพลง')).toBeInTheDocument();
  expect(screen.queryByText('Morning Demo')).not.toBeInTheDocument();
});

test('ลบไม่สำเร็จ (เช่น ไม่ใช่ admin) ต้องเห็นข้อความจาก server และเพลงยังอยู่', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValue({ items: [S1], total: 1 });
  deleteSong.mockRejectedValue(new Error('ต้องเป็น admin เท่านั้น'));
  renderPage();
  await screen.findByText('Morning Demo');

  await user.click(screen.getByRole('button', { name: 'ลบ Morning Demo' }));
  await user.click(screen.getByRole('button', { name: 'ลบ' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('ต้องเป็น admin เท่านั้น');
  expect(screen.getByText('Morning Demo')).toBeInTheDocument();
});

test('ค้นหาเพลง ต้องยิง backend ด้วยคำค้น และไม่พบเพลงต้องเห็นข้อความ empty', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValueOnce({ items: [S1], total: 1 });
  getSongs.mockResolvedValue({ items: [], total: 0 });
  renderPage();
  await screen.findByText('Morning Demo');

  await user.type(screen.getByLabelText('ค้นหาเพลง'), 'zzz');
  await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

  expect(getSongs).toHaveBeenLastCalledWith({ q: 'zzz', limit: 20, offset: 0 });
  expect(await screen.findByText('ไม่พบเพลง')).toBeInTheDocument();
});

test('backend error ต้องเห็นกล่อง error พร้อมปุ่มลองใหม่', async () => {
  getSongs.mockRejectedValue(new Error('เชื่อมต่อ server ไม่ได้'));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('เชื่อมต่อ server ไม่ได้');
  expect(screen.getByRole('button', { name: 'ลองใหม่' })).toBeInTheDocument();
});
