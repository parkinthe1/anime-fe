import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../auth/AuthContext';
import Profile from './Profile';
import { updateProfile, changePassword } from '../api/backend';

jest.mock('../api/backend');

const ME = { id: 1, email: 'demo@aniwave.test', displayName: 'Demo', role: 'member' };

function renderProfile() {
  localStorage.setItem('aniwave.token', 'tok');
  localStorage.setItem('aniwave.member', JSON.stringify(ME));
  return render(<AuthProvider><Profile /></AuthProvider>);
}

async function fillPasswords(user, { current = 'old1234', next = 'new5678', confirm = 'new5678' } = {}) {
  await user.type(screen.getByLabelText('รหัสผ่านปัจจุบัน'), current);
  await user.type(screen.getByLabelText('รหัสผ่านใหม่'), next);
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่านใหม่'), confirm);
}

beforeEach(() => localStorage.clear());

test('ต้องแสดงอีเมล บทบาท และชื่อปัจจุบันของสมาชิก', () => {
  renderProfile();

  expect(screen.getByText(/demo@aniwave.test/)).toBeInTheDocument();
  expect(screen.getByText('member')).toBeInTheDocument();
  expect(screen.getByLabelText('ชื่อที่แสดง')).toHaveValue('Demo');
});

test('แก้ชื่อ ต้องเรียก backend ด้วยชื่อใหม่และ token แล้วอัปเดตชื่อที่จำไว้', async () => {
  const user = userEvent.setup();
  updateProfile.mockResolvedValue({ member: { ...ME, displayName: 'ชื่อใหม่' } });
  renderProfile();

  await user.clear(screen.getByLabelText('ชื่อที่แสดง'));
  await user.type(screen.getByLabelText('ชื่อที่แสดง'), 'ชื่อใหม่');
  await user.click(screen.getByRole('button', { name: 'บันทึกชื่อ' }));

  expect(updateProfile).toHaveBeenCalledWith('ชื่อใหม่', 'tok');
  expect(await screen.findByText('บันทึกชื่อเรียบร้อยแล้ว')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('aniwave.member')).displayName).toBe('ชื่อใหม่');
});

test('เปลี่ยนรหัสผ่านสำเร็จ ต้องเรียก backend ด้วยรหัสเก่า รหัสใหม่ token แล้วล้างช่องกรอก', async () => {
  const user = userEvent.setup();
  changePassword.mockResolvedValue({ ok: true });
  renderProfile();

  await fillPasswords(user);
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

  expect(changePassword).toHaveBeenCalledWith('old1234', 'new5678', 'tok');
  expect(await screen.findByText('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')).toBeInTheDocument();
  expect(screen.getByLabelText('รหัสผ่านปัจจุบัน')).toHaveValue('');
});

test('รหัสผ่านใหม่ไม่ตรงกัน ต้องขึ้นข้อความและไม่ยิง backend', async () => {
  const user = userEvent.setup();
  renderProfile();

  await fillPasswords(user, { confirm: 'other9999' });
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

  expect(screen.getByText('รหัสผ่านใหม่ไม่ตรงกัน')).toBeInTheDocument();
  expect(changePassword).not.toHaveBeenCalled();
});

test('รหัสผ่านปัจจุบันผิด ต้องเห็นข้อความจาก server และไม่ขึ้นว่าสำเร็จ', async () => {
  const user = userEvent.setup();
  changePassword.mockRejectedValue(new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง'));
  renderProfile();

  await fillPasswords(user, { current: 'wrong123' });
  await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

  expect(await screen.findByText('รหัสผ่านปัจจุบันไม่ถูกต้อง')).toBeInTheDocument();
  expect(screen.queryByText('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว')).not.toBeInTheDocument();
});
