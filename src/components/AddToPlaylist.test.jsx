import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import AddToPlaylist from './AddToPlaylist';
import { addSongToPlaylist, getMyPlaylists } from '../api/backend';

jest.mock('../api/backend');

const SONG = { id: 7, title: 'Hello Test' };

function renderButton({ loggedIn }) {
  localStorage.clear();
  if (loggedIn) {
    localStorage.setItem('musicken.token', 'tok');
    localStorage.setItem('musicken.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));
  }
  return render(<MemoryRouter><AuthProvider><AddToPlaylist song={SONG} /></AuthProvider></MemoryRouter>);
}

test('guest ไม่เห็นปุ่มเพิ่มลงเพลย์ลิสต์ และไม่ยิง backend', () => {
  renderButton({ loggedIn: false });
  expect(screen.queryByRole('button', { name: /เพิ่ม Hello Test ลงเพลย์ลิสต์/ })).not.toBeInTheDocument();
  expect(getMyPlaylists).not.toHaveBeenCalled();
});

test('สมาชิกกดปุ่มแล้วโหลดเพลย์ลิสต์ของตัวเอง เลือกลิสต์ แล้วยิง backend พร้อม token', async () => {
  const user = userEvent.setup();
  getMyPlaylists.mockResolvedValue([{ id: 5, name: 'เพลงขับรถ' }, { id: 6, name: 'เพลงทำงาน' }]);
  addSongToPlaylist.mockResolvedValue(null);
  renderButton({ loggedIn: true });

  await user.click(screen.getByRole('button', { name: /เพิ่ม Hello Test ลงเพลย์ลิสต์/ }));
  expect(getMyPlaylists).toHaveBeenCalledWith('tok');

  await user.click(await screen.findByRole('button', { name: 'เพลงขับรถ' }));

  expect(addSongToPlaylist).toHaveBeenCalledWith(5, 7, 'tok');
  expect(await screen.findByRole('status')).toHaveTextContent('เพิ่มลง "เพลงขับรถ" แล้ว');
});

test('ยังไม่มีเพลย์ลิสต์ ต้องมีลิงก์ไปสร้าง', async () => {
  const user = userEvent.setup();
  getMyPlaylists.mockResolvedValue([]);
  renderButton({ loggedIn: true });

  await user.click(screen.getByRole('button', { name: /เพิ่ม Hello Test ลงเพลย์ลิสต์/ }));

  expect(await screen.findByRole('link', { name: 'สร้างเลย' })).toHaveAttribute('href', '/me/playlists');
});

test('เพิ่มไม่สำเร็จ ต้องเห็นข้อความ error จาก server', async () => {
  const user = userEvent.setup();
  getMyPlaylists.mockResolvedValue([{ id: 5, name: 'เพลงขับรถ' }]);
  addSongToPlaylist.mockRejectedValue(new Error('ไม่พบเพลงนี้'));
  renderButton({ loggedIn: true });

  await user.click(screen.getByRole('button', { name: /เพิ่ม Hello Test ลงเพลย์ลิสต์/ }));
  await user.click(await screen.findByRole('button', { name: 'เพลงขับรถ' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('ไม่พบเพลงนี้');
});
