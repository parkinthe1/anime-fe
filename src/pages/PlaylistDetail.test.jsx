import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import PlaylistDetail from './PlaylistDetail';
import { getMyLikes, getPublicPlaylist, likePlaylist, unlikePlaylist } from '../api/backend';
import { usePlayer } from '../player/PlayerContext';

jest.mock('../api/backend');
jest.mock('../player/PlayerContext', () => ({ usePlayer: jest.fn() }));

const PLAYLIST = {
  id: 5, name: 'เพลงชิลล์', description: 'ฟังสบายๆ', isPublic: true, ownerId: 9, ownerName: 'Somchai',
  songCount: 1, likeCount: 2,
  songs: [{ id: 1, title: 'Hello Test', artistId: 11, artistName: 'Sample Voice', previewUrl: null, durationSec: 187 }],
};

function renderPage({ memberId } = {}) {
  localStorage.clear();
  if (memberId) {
    localStorage.setItem('musicken.token', 'tok');
    localStorage.setItem('musicken.member', JSON.stringify({ id: memberId, displayName: 'Demo', role: 'member' }));
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/playlists/5']}>
        <Routes><Route path="/playlists/:id" element={<PlaylistDetail />} /></Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  usePlayer.mockReturnValue({ current: null, playing: false, play: jest.fn(), pause: jest.fn() });
  getPublicPlaylist.mockResolvedValue(PLAYLIST);
  getMyLikes.mockResolvedValue([]);
});

test('guest ดูเพลย์ลิสต์ได้ แต่ไม่มีปุ่มถูกใจ มีลิงก์ให้เข้าสู่ระบบ', async () => {
  renderPage();

  expect(await screen.findByRole('heading', { name: /เพลงชิลล์/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Hello Test' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /ถูกใจ/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();
  expect(getMyLikes).not.toHaveBeenCalled();
});

test('สมาชิกกดถูกใจ ต้องเรียก backend แล้วแสดงยอดที่ server ตอบกลับ', async () => {
  const user = userEvent.setup();
  likePlaylist.mockResolvedValue({ liked: true, likeCount: 3 });
  renderPage({ memberId: 1 });

  await user.click(await screen.findByRole('button', { name: /ถูกใจ \(2\)/ }));

  expect(likePlaylist).toHaveBeenCalledWith(5, 'tok');
  expect(await screen.findByRole('button', { name: /ถูกใจแล้ว \(3\)/ })).toHaveAttribute('aria-pressed', 'true');
});

test('ลิสต์ที่เคยถูกใจแล้ว กดอีกครั้งต้องยกเลิกถูกใจ', async () => {
  const user = userEvent.setup();
  getMyLikes.mockResolvedValue([{ id: 5 }]);
  unlikePlaylist.mockResolvedValue({ liked: false, likeCount: 1 });
  renderPage({ memberId: 1 });

  await user.click(await screen.findByRole('button', { name: /ถูกใจแล้ว \(2\)/ }));

  expect(unlikePlaylist).toHaveBeenCalledWith(5, 'tok');
  expect(await screen.findByRole('button', { name: /ถูกใจ \(1\)/ })).toHaveAttribute('aria-pressed', 'false');
});

test('ถูกใจไม่สำเร็จ ต้องเห็นข้อความ error และยอดไม่เปลี่ยน', async () => {
  const user = userEvent.setup();
  likePlaylist.mockRejectedValue(new Error('ไม่พบเพลย์ลิสต์นี้'));
  renderPage({ memberId: 1 });

  await user.click(await screen.findByRole('button', { name: /ถูกใจ \(2\)/ }));

  expect(await screen.findByRole('alert')).toHaveTextContent('ไม่พบเพลย์ลิสต์นี้');
  expect(screen.getByRole('button', { name: /ถูกใจ \(2\)/ })).toBeInTheDocument();
});

test('เจ้าของเพลย์ลิสต์เห็นลิงก์ไปหน้าจัดการ ส่วนคนอื่นไม่เห็น', async () => {
  renderPage({ memberId: 9 });
  expect(await screen.findByRole('link', { name: 'จัดการเพลย์ลิสต์นี้' })).toHaveAttribute('href', '/me/playlists/5');
});

test('เพลย์ลิสต์ส่วนตัวหรือไม่มีอยู่ (server ตอบ 404) ต้องเห็นกล่อง error', async () => {
  getPublicPlaylist.mockRejectedValue(new Error('ไม่พบเพลย์ลิสต์นี้'));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('ไม่พบเพลย์ลิสต์นี้');
});
