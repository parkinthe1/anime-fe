import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Songs from './Songs';
import { getGenres, getSongs } from '../api/backend';
import { usePlayer } from '../player/PlayerContext';

jest.mock('../api/backend');
jest.mock('../player/PlayerContext', () => ({ usePlayer: jest.fn() }));

const SONGS = [
  { id: 1, title: 'Morning Demo', artistId: 10, artistName: 'Demo Band', genre: 'Rock', durationSec: 215, previewUrl: null },
  { id: 2, title: 'Hello Test', artistId: 11, artistName: 'Sample Voice', genre: 'Pop', durationSec: 187, previewUrl: null },
];

function renderPage() {
  return render(<MemoryRouter><AuthProvider><Songs /></AuthProvider></MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
  usePlayer.mockReturnValue({ current: null, playing: false, play: jest.fn(), pause: jest.fn() });
  getGenres.mockResolvedValue(['Pop', 'Rock']);
});

test('โหลดเพลงจาก backend แล้วแสดงรายการและจำนวนที่พบ (ระหว่างโหลดเห็น loading)', async () => {
  getSongs.mockResolvedValue({ items: SONGS, total: 2 });
  renderPage();

  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลด');
  expect(await screen.findByRole('link', { name: 'Morning Demo' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Hello Test' })).toBeInTheDocument();
  expect(screen.getByText('พบ 2 เพลง')).toBeInTheDocument();
  expect(getSongs).toHaveBeenCalledWith({ q: '', genre: '', limit: 20, offset: 0 });
});

test('พิมพ์คำค้นแล้วกดค้นหา ต้องยิง backend ด้วยคำค้นนั้นและกลับไปหน้าแรก', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValue({ items: SONGS, total: 2 });
  renderPage();
  await screen.findByRole('link', { name: 'Morning Demo' });

  await user.type(screen.getByLabelText('ค้นหาเพลง'), 'hello');
  await user.click(screen.getByRole('button', { name: 'ค้นหา' }));

  expect(getSongs).toHaveBeenLastCalledWith({ q: 'hello', genre: '', limit: 20, offset: 0 });
});

test('เลือกแนวเพลงจากตัวกรอง ต้องยิง backend พร้อม genre', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValue({ items: SONGS, total: 2 });
  renderPage();
  await screen.findByRole('link', { name: 'Morning Demo' });

  await user.selectOptions(await screen.findByLabelText('แนวเพลง'), 'Rock');

  expect(getSongs).toHaveBeenLastCalledWith({ q: '', genre: 'Rock', limit: 20, offset: 0 });
});

test('ไม่พบเพลง ต้องเห็นข้อความ empty', async () => {
  getSongs.mockResolvedValue({ items: [], total: 0 });
  renderPage();

  expect(await screen.findByText('ไม่พบเพลงที่ค้นหา')).toBeInTheDocument();
});

test('backend error ต้องเห็นกล่อง error และกด "ลองใหม่" แล้วโหลดสำเร็จ', async () => {
  const user = userEvent.setup();
  getSongs.mockRejectedValueOnce(new Error('เซิร์ฟเวอร์ผิดพลาด ลองใหม่อีกครั้ง'));
  getSongs.mockResolvedValue({ items: SONGS, total: 2 });
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('เซิร์ฟเวอร์ผิดพลาด ลองใหม่อีกครั้ง');
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByRole('link', { name: 'Morning Demo' })).toBeInTheDocument();
});

test('เพลงเกินหนึ่งหน้า ต้องมีปุ่มถัดไปที่ขอหน้าถัดไป (offset เพิ่มทีละ 20)', async () => {
  const user = userEvent.setup();
  getSongs.mockResolvedValue({ items: SONGS, total: 45 });
  renderPage();

  expect(await screen.findByText('หน้า 1 จาก 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ก่อนหน้า' })).toBeDisabled();

  await user.click(screen.getByRole('button', { name: 'ถัดไป' }));

  expect(getSongs).toHaveBeenLastCalledWith({ q: '', genre: '', limit: 20, offset: 20 });
  expect(await screen.findByText('หน้า 2 จาก 3')).toBeInTheDocument();
});
