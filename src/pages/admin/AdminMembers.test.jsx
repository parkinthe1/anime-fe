import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../auth/AuthContext';
import AdminMembers from './AdminMembers';
import { getAdminMembers, setMemberRole } from '../../api/backend';

jest.mock('../../api/backend');

const ME = { id: 2, displayName: 'Admin', role: 'admin' };
const MEMBERS = [
  { id: 1, email: 'demo@aniwave.test', displayName: 'Demo', role: 'member', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 2, email: 'admin@aniwave.test', displayName: 'Admin', role: 'admin', createdAt: '2026-09-01T09:00:00.000Z' },
];

function renderPage() {
  localStorage.setItem('aniwave.token', 'mock.2.abc');
  localStorage.setItem('aniwave.member', JSON.stringify(ME));
  return render(<AuthProvider><AdminMembers /></AuthProvider>);
}

beforeEach(() => localStorage.clear());

test('โหลดรายชื่อแล้วต้องเห็นทุกคน แนบ token ของ admin และปุ่มของตัวเองกดไม่ได้', async () => {
  getAdminMembers.mockResolvedValue(MEMBERS);
  renderPage();

  expect(await screen.findByText('demo@aniwave.test')).toBeInTheDocument();
  expect(screen.getByText('admin@aniwave.test')).toBeInTheDocument();
  expect(getAdminMembers).toHaveBeenCalledWith('mock.2.abc');

  const myRow = screen.getByText('admin@aniwave.test').closest('tr');
  expect(within(myRow).getByRole('button', { name: 'ลดเป็น member' })).toBeDisabled();
});

test('เลื่อน member เป็น admin ต้องถามยืนยันก่อน แล้วค่อยเรียก backend และอัปเดตแถว', async () => {
  const user = userEvent.setup();
  getAdminMembers.mockResolvedValue(MEMBERS);
  setMemberRole.mockResolvedValue({ ...MEMBERS[0], role: 'admin' });
  renderPage();
  await screen.findByText('demo@aniwave.test');

  await user.click(screen.getByRole('button', { name: 'เลื่อนเป็น admin' }));
  expect(setMemberRole).not.toHaveBeenCalled();           // แค่กดปุ่มยังไม่ยิง ต้องยืนยันก่อน

  await user.click(screen.getByRole('button', { name: 'ยืนยัน' }));

  expect(setMemberRole).toHaveBeenCalledWith(1, 'admin', 'mock.2.abc');
  const demoRow = (await screen.findByText('demo@aniwave.test')).closest('tr');
  expect(await within(demoRow).findByRole('button', { name: 'ลดเป็น member' })).toBeInTheDocument();
});

test('backend ตอบ error ต้องเห็นข้อความ และบทบาทในตารางไม่เปลี่ยน', async () => {
  const user = userEvent.setup();
  getAdminMembers.mockResolvedValue(MEMBERS);
  setMemberRole.mockRejectedValue(new Error('สำหรับ admin เท่านั้น'));
  renderPage();
  await screen.findByText('demo@aniwave.test');

  await user.click(screen.getByRole('button', { name: 'เลื่อนเป็น admin' }));
  await user.click(screen.getByRole('button', { name: 'ยืนยัน' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('สำหรับ admin เท่านั้น');
  const demoRow = screen.getByText('demo@aniwave.test').closest('tr');
  expect(within(demoRow).getByRole('button', { name: 'เลื่อนเป็น admin' })).toBeInTheDocument();
});

test('โหลดรายชื่อไม่สำเร็จ ต้องเห็น error และกดลองใหม่แล้วโหลดได้', async () => {
  const user = userEvent.setup();
  getAdminMembers.mockRejectedValueOnce(new Error('server ล่ม')).mockResolvedValueOnce(MEMBERS);
  renderPage();

  expect(await screen.findByText('server ล่ม')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('demo@aniwave.test')).toBeInTheDocument();
});
