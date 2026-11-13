import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import MyPlaylistDetail from './MyPlaylistDetail';
import { deletePlaylist, getMyPlaylist, removeSongFromPlaylist, reorderPlaylist, updatePlaylist } from '../api/backend';
import { usePlayer } from '../player/PlayerContext';

jest.mock('../api/backend');
jest.mock('../player/PlayerContext', () => ({ usePlayer: jest.fn() }));

const S1 = { id: 1, title: 'Morning Demo', artistId: 10, artistName: 'Demo Band', previewUrl: null, durationSec: 100 };
const S2 = { id: 2, title: 'Night Sample', artistId: 10, artistName: 'Demo Band', previewUrl: null, durationSec: 120 };
const PLAYLIST = {
  id: 3, name: 'เพลงขับรถ', description: 'ฟังตอนเดินทาง', isPublic: false,
  ownerId: 1, ownerName: 'Demo', songCount: 2, likeCount: 0, songs: [S1, S2],
};

function renderPage() {
  localStorage.setItem('musicken.token', 'tok');
  localStorage.setItem('musicken.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/me/playlists/3']}>
        <Routes>
          <Route path="/me/playlists/:id" element={<MyPlaylistDetail />} />
          <Route path="/me/playlists" element={<h1>เพลย์ลิสต์ของฉัน</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

const titlesInOrder = () => screen.getAllByRole('listitem').map((li) => within(li).getAllByRole('link')[0].textContent);

beforeEach(() => {
  localStorage.clear();
  usePlayer.mockReturnValue({ current: null, playing: false, play: jest.fn(), pause: jest.fn() });
});

test('โหลดเพลย์ลิสต์ของตัวเองด้วย token แล้วแสดงชื่อ คำอธิบาย และเพลงตามลำดับ', async () => {
  getMyPlaylist.mockResolvedValue(PLAYLIST);
  renderPage();

  expect(await screen.findByRole('heading', { name: /เพลงขับรถ/ })).toBeInTheDocument();
  expect(getMyPlaylist).toHaveBeenCalledWith('3', 'tok');
  expect(screen.getByLabelText('คำอธิบาย')).toHaveValue('ฟังตอนเดินทาง');
  expect(titlesInOrder()).toEqual(['Morning Demo', 'Night Sample']);
  expect(screen.getByRole('button', { name: 'เลื่อน Morning Demo ขึ้น' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'เลื่อน Night Sample ลง' })).toBeDisabled();
});

test('เลื่อนเพลงลง ต้องส่งลำดับใหม่ไป backend แล้วแสดงลำดับที่ server ตอบกลับ', async () => {
  const user = userEvent.setup();
  getMyPlaylist.mockResolvedValue(PLAYLIST);
  reorderPlaylist.mockResolvedValue({ ...PLAYLIST, songs: [S2, S1] });
  renderPage();
  await screen.findByRole('heading', { name: /เพลงขับรถ/ });

  await user.click(screen.getByRole('button', { name: 'เลื่อน Morning Demo ลง' }));

  expect(reorderPlaylist).toHaveBeenCalledWith('3', [2, 1], 'tok');
  expect(await screen.findByRole('button', { name: 'เลื่อน Morning Demo ขึ้น' })).toBeEnabled();
  expect(titlesInOrder()).toEqual(['Night Sample', 'Morning Demo']);
});

test('เอาเพลงออก ต้องเรียก backend แล้วเพลงนั้นหายจากรายการ', async () => {
  const user = userEvent.setup();
  getMyPlaylist.mockResolvedValue(PLAYLIST);
  removeSongFromPlaylist.mockResolvedValue(null);
  renderPage();
  await screen.findByRole('heading', { name: /เพลงขับรถ/ });

  await user.click(screen.getByRole('button', { name: 'เอา Night Sample ออก' }));

  expect(removeSongFromPlaylist).toHaveBeenCalledWith('3', 2, 'tok');
  expect(screen.queryByRole('link', { name: 'Night Sample' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Morning Demo' })).toBeInTheDocument();
});

test('แก้ชื่อและตั้งเป็นสาธารณะ แล้วบันทึก ต้องส่งค่าใหม่ไป backend และแจ้งว่าบันทึกแล้ว', async () => {
  const user = userEvent.setup();
  getMyPlaylist.mockResolvedValue(PLAYLIST);
  updatePlaylist.mockResolvedValue({ ...PLAYLIST, name: 'เพลงขับรถไกล', isPublic: true });
  renderPage();
  await screen.findByRole('heading', { name: /เพลงขับรถ/ });

  const nameInput = screen.getByLabelText('ชื่อเพลย์ลิสต์');
  await user.clear(nameInput);
  await user.type(nameInput, 'เพลงขับรถไกล');
  await user.click(screen.getByLabelText('ตั้งเป็นสาธารณะ'));
  await user.click(screen.getByRole('button', { name: 'บันทึก' }));

  expect(updatePlaylist).toHaveBeenCalledWith('3', { name: 'เพลงขับรถไกล', description: 'ฟังตอนเดินทาง', isPublic: true }, 'tok');
  expect(await screen.findByRole('status')).toHaveTextContent('บันทึกเรียบร้อยแล้ว');
  // เพลงเดิมยังอยู่ ไม่หายตอนบันทึกข้อมูลลิสต์
  expect(screen.getByRole('link', { name: 'Morning Demo' })).toBeInTheDocument();
});

test('เพลย์ลิสต์ของคนอื่นหรือไม่มีอยู่ (server ตอบ 404) ต้องเห็นกล่อง error', async () => {
  getMyPlaylist.mockRejectedValue(new Error('ไม่พบเพลย์ลิสต์นี้'));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('ไม่พบเพลย์ลิสต์นี้');
});

test('ลบเพลย์ลิสต์ ต้องถามยืนยันก่อน แล้วค่อยเรียก backend และกลับไปหน้ารายการ', async () => {
  const user = userEvent.setup();
  getMyPlaylist.mockResolvedValue(PLAYLIST);
  deletePlaylist.mockResolvedValue(null);
  renderPage();
  await screen.findByRole('heading', { name: /เพลงขับรถ/ });

  await user.click(screen.getByRole('button', { name: 'ลบเพลย์ลิสต์' }));
  expect(deletePlaylist).not.toHaveBeenCalled();           // แค่กดปุ่มยังไม่ลบ ต้องยืนยันก่อน

  await user.click(screen.getByRole('button', { name: 'ลบ' }));

  expect(deletePlaylist).toHaveBeenCalledWith('3', 'tok');
  expect(await screen.findByRole('heading', { name: 'เพลย์ลิสต์ของฉัน' })).toBeInTheDocument();
});
