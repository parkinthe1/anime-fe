import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SongList from './SongList';
import { usePlayer } from '../player/PlayerContext';

jest.mock('../player/PlayerContext', () => ({ usePlayer: jest.fn() }));

const SONGS = [
  { id: 1, title: 'Morning Demo', artistId: 10, artistName: 'Demo Band', genre: 'Rock', durationSec: 215, coverUrl: null, previewUrl: 'https://example.com/p1.m4a' },
  { id: 2, title: 'Silent Track', artistId: 11, artistName: 'Test Beats', genre: null, durationSec: null, coverUrl: null, previewUrl: null },
];

const play = jest.fn();
const pause = jest.fn();

beforeEach(() => {
  usePlayer.mockReturnValue({ current: null, playing: false, play, pause });
});

function renderList(props) {
  return render(<MemoryRouter><SongList items={SONGS} {...props} /></MemoryRouter>);
}

test('กำลังโหลด ต้องเห็นข้อความ loading และไม่เห็นรายการ', () => {
  renderList({ items: [], status: 'loading' });
  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลด');
});

test('error ต้องเห็นข้อความของ error และกด "ลองใหม่" แล้วเรียก onRetry', async () => {
  const user = userEvent.setup();
  const onRetry = jest.fn();
  renderList({ items: [], status: 'error', error: new Error('เชื่อมต่อ server ไม่ได้'), onRetry });

  expect(screen.getByRole('alert')).toHaveTextContent('เชื่อมต่อ server ไม่ได้');
  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('ไม่มีเพลง ต้องเห็นข้อความ empty ที่ส่งเข้ามา', () => {
  renderList({ items: [], emptyText: 'ยังไม่มีเพลงในลิสต์นี้' });
  expect(screen.getByText('ยังไม่มีเพลงในลิสต์นี้')).toBeInTheDocument();
});

test('แสดงชื่อเพลง ลิงก์ไปศิลปิน และความยาวในรูปนาที:วินาที (ไม่มีค่าเป็น "-")', () => {
  renderList();
  expect(screen.getByRole('link', { name: 'Morning Demo' })).toHaveAttribute('href', '/songs/1');
  expect(screen.getByRole('link', { name: 'Demo Band' })).toHaveAttribute('href', '/artists/10');
  expect(screen.getByText('3:35')).toBeInTheDocument();
  expect(screen.getByText('-')).toBeInTheDocument();
});

test('กดเล่น ต้องเรียก play พร้อมเพลงนั้น ส่วนเพลงที่ไม่มีเสียงตัวอย่างกดไม่ได้', async () => {
  const user = userEvent.setup();
  renderList();

  await user.click(screen.getByRole('button', { name: 'เล่น Morning Demo' }));
  expect(play).toHaveBeenCalledWith(SONGS[0]);
  expect(screen.getByRole('button', { name: 'เล่น Silent Track' })).toBeDisabled();
});

test('เพลงที่กำลังเล่นอยู่ ปุ่มต้องเป็น "หยุด" และกดแล้วเรียก pause', async () => {
  const user = userEvent.setup();
  usePlayer.mockReturnValue({ current: SONGS[0], playing: true, play, pause });
  renderList();

  await user.click(screen.getByRole('button', { name: 'หยุด Morning Demo' }));
  expect(pause).toHaveBeenCalledTimes(1);
  expect(play).not.toHaveBeenCalled();
});

test('renderActions ถูกเรียกต่อเพลงและแสดงปุ่มเสริมท้ายแถว', () => {
  renderList({ renderActions: (s) => <button>จัดการ {s.title}</button> });
  expect(screen.getByRole('button', { name: 'จัดการ Morning Demo' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'จัดการ Silent Track' })).toBeInTheDocument();
});
