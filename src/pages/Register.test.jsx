import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Register from './Register';
import { register } from '../api/backend';

jest.mock('../api/backend');

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<h1>หน้า Login</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

async function fill(user, { name = 'Mai', email = 'mai@aniwave.test', pw = 'pass1234', confirm = 'pass1234' } = {}) {
  await user.type(screen.getByLabelText('ชื่อที่แสดง'), name);
  await user.type(screen.getByLabelText('อีเมล'), email);
  await user.type(screen.getByLabelText('รหัสผ่าน'), pw);
  await user.type(screen.getByLabelText('ยืนยันรหัสผ่าน'), confirm);
}

beforeEach(() => localStorage.clear());

test('รหัสผ่านไม่ตรงกัน ต้องขึ้นข้อความและไม่ยิง backend', async () => {
  const user = userEvent.setup();
  renderRegister();

  await fill(user, { confirm: 'different9' });
  await user.click(screen.getByRole('button', { name: 'สมัครสมาชิก' }));

  expect(screen.getByRole('alert')).toHaveTextContent('รหัสผ่านไม่ตรงกัน');
  expect(register).not.toHaveBeenCalled();
});

test('สมัครสำเร็จ ต้องส่ง email รหัสผ่าน ชื่อ ไป backend แล้วพาไปหน้า Login', async () => {
  const user = userEvent.setup();
  register.mockResolvedValue({ id: 3 });
  renderRegister();

  await fill(user);
  await user.click(screen.getByRole('button', { name: 'สมัครสมาชิก' }));

  expect(register).toHaveBeenCalledWith('mai@aniwave.test', 'pass1234', 'Mai');
  expect(await screen.findByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
});

test('อีเมลซ้ำ (409) ต้องเห็นข้อความจาก server และอยู่หน้าเดิม', async () => {
  const user = userEvent.setup();
  register.mockRejectedValue(new Error('อีเมลนี้ถูกใช้แล้ว'));
  renderRegister();

  await fill(user);
  await user.click(screen.getByRole('button', { name: 'สมัครสมาชิก' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('อีเมลนี้ถูกใช้แล้ว');
  expect(screen.queryByRole('heading', { name: 'หน้า Login' })).not.toBeInTheDocument();
});
