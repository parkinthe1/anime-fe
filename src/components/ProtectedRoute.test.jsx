import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';

jest.mock('../api/backend');   // AuthProvider ตรวจตั๋วด้วย getMe ให้เป็นของปลอม ไม่ยิง server จริง

function Secret() { return <h1>หน้าลับ</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => localStorage.clear());

test('guest (ยังไม่ login) ต้องถูกพาไปหน้า Login และไม่เห็นหน้าลับ', () => {
  renderAt('/me');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าลับ')).not.toBeInTheDocument();
});

test('มี token ใน localStorage แล้ว ต้องเห็นหน้าลับ', () => {
  localStorage.setItem('aniwave.token', 'mock.1.abc');
  localStorage.setItem('aniwave.member', JSON.stringify({ id: 1, displayName: 'Demo', role: 'member' }));

  renderAt('/me');

  expect(screen.getByRole('heading', { name: 'หน้าลับ' })).toBeInTheDocument();
});
