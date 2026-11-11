import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Login from './Login';
import { login } from '../api/backend';

jest.mock('../api/backend');

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h1>หน้าแรก</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => localStorage.clear());

test('login สำเร็จ ต้องเรียก backend จำ token ไว้ แล้วพาไปหน้าแรก', async () => {
  const user = userEvent.setup();
  login.mockResolvedValue({ token: 't1', member: { id: 1, displayName: 'Demo', role: 'member' } });
  renderLogin();

  await user.type(screen.getByLabelText('อีเมล'), 'demo@aniwave.test');
  await user.type(screen.getByLabelText('รหัสผ่าน'), '1234');
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(login).toHaveBeenCalledWith('demo@aniwave.test', '1234');
  expect(await screen.findByRole('heading', { name: 'หน้าแรก' })).toBeInTheDocument();
  expect(localStorage.getItem('aniwave.token')).toBe('t1');
});

test('รหัสผิด ต้องเห็นข้อความจาก server อยู่หน้าเดิม และไม่จำ token', async () => {
  const user = userEvent.setup();
  login.mockRejectedValue(new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
  renderLogin();

  await user.type(screen.getByLabelText('อีเมล'), 'demo@aniwave.test');
  await user.type(screen.getByLabelText('รหัสผ่าน'), 'wrong1');
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  expect(screen.queryByRole('heading', { name: 'หน้าแรก' })).not.toBeInTheDocument();
  expect(localStorage.getItem('aniwave.token')).toBeNull();
});
