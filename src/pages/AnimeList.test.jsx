import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AnimeList from './AnimeList';
import { getAnimeList } from '../api/backend';

jest.mock('../api/backend');

const FAKE = [
  { id: 1, title: 'Frieren', titleTh: 'คำอำลาของฟรีเรน', genre: 'Fantasy', year: 2023, rating: 9.3, episodes: 28, poster: null },
  { id: 2, title: 'Spy x Family', titleTh: 'สปาย x แฟมิลี่', genre: 'Comedy', year: 2022, rating: 8.6, episodes: 25, poster: null },
  { id: 3, title: 'Frieren Special', titleTh: null, genre: 'Fantasy', year: 2026, rating: null, episodes: null, poster: null },
];

function renderPage() {
  return render(<MemoryRouter><AnimeList /></MemoryRouter>);
}

test('ระหว่างรอ backend ต้องเห็นสถานะ loading', () => {
  getAnimeList.mockReturnValue(new Promise(() => {}));   // promise ที่ไม่เคยจบ = ค้างอยู่ที่ loading
  renderPage();

  expect(screen.getByRole('status', { name: 'กำลังโหลด' })).toBeInTheDocument();
});

test('โหลดสำเร็จ ต้องเห็นการ์ดครบและปุ่มแนวที่สร้างจากข้อมูล', async () => {
  getAnimeList.mockResolvedValue(FAKE);
  renderPage();

  expect(await screen.findByText('Spy x Family')).toBeInTheDocument();
  expect(screen.getAllByRole('link')).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Fantasy' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Comedy' })).toBeInTheDocument();
});

test('พิมพ์ค้นหา ต้องกรองในเครื่องโดยไม่เรียก backend ซ้ำ', async () => {
  const user = userEvent.setup();
  getAnimeList.mockResolvedValue(FAKE);
  renderPage();
  await screen.findByText('Spy x Family');

  await user.type(screen.getByPlaceholderText(/พิมพ์ชื่ออนิเมะ/), 'spy');

  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByText('Spy x Family')).toBeInTheDocument();
  expect(getAnimeList).toHaveBeenCalledTimes(1);
});

test('เลือกแนว ต้องเหลือเฉพาะเรื่องในแนวนั้น', async () => {
  const user = userEvent.setup();
  getAnimeList.mockResolvedValue(FAKE);
  renderPage();
  await screen.findByText('Spy x Family');

  await user.click(screen.getByRole('button', { name: 'Fantasy' }));

  expect(screen.getAllByRole('link')).toHaveLength(2);
  expect(screen.queryByText('Spy x Family')).not.toBeInTheDocument();
});

test('ค้นหาแล้วไม่เจอ ต้องเห็นข้อความว่าไม่พบ', async () => {
  const user = userEvent.setup();
  getAnimeList.mockResolvedValue(FAKE);
  renderPage();
  await screen.findByText('Spy x Family');

  await user.type(screen.getByPlaceholderText(/พิมพ์ชื่ออนิเมะ/), 'zzzz');

  expect(screen.getByText(/ไม่พบอนิเมะที่ค้นหา/)).toBeInTheDocument();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
});

test('backend ไม่มีข้อมูลเลย ต้องเห็นข้อความ empty state', async () => {
  getAnimeList.mockResolvedValue([]);
  renderPage();

  expect(await screen.findByText('ยังไม่มีอนิเมะในระบบ')).toBeInTheDocument();
});

test('backend ล่ม ต้องเห็นข้อความ error และปุ่มลองใหม่ที่โหลดอีกครั้งได้', async () => {
  const user = userEvent.setup();
  getAnimeList
    .mockRejectedValueOnce(new Error('server ไม่ได้ตอบเป็น JSON'))
    .mockResolvedValueOnce(FAKE);
  renderPage();

  expect(await screen.findByText('server ไม่ได้ตอบเป็น JSON')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('Spy x Family')).toBeInTheDocument();
  expect(getAnimeList).toHaveBeenCalledTimes(2);
});
