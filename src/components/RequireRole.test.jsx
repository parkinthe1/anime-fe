import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import RequireRole from './RequireRole';

jest.mock('../api/backend');

function Backoffice() { return <h1>หลังบ้าน</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireRole role="admin"><Backoffice /></RequireRole>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

function loginAs(member) {
  localStorage.setItem('aniwave.token', 'mock.1.abc');
  localStorage.setItem('aniwave.member', JSON.stringify(member));
}

beforeEach(() => localStorage.clear());

test('guest เข้า /admin ต้องถูกพาไปหน้า Login', () => {
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หลังบ้าน')).not.toBeInTheDocument();
});

test('member เข้า /admin ต้องเห็นหน้า 403 ไม่ใช่หลังบ้าน และไม่ถูกส่งไป Login', () => {
  loginAs({ id: 1, displayName: 'Demo', role: 'member' });
  renderAt('/admin');

  expect(screen.getByText('403')).toBeInTheDocument();
  expect(screen.queryByText('หลังบ้าน')).not.toBeInTheDocument();
  expect(screen.queryByText('หน้า Login')).not.toBeInTheDocument();
});

test('admin เข้า /admin ต้องเห็นหลังบ้าน', () => {
  loginAs({ id: 2, displayName: 'Admin', role: 'admin' });
  renderAt('/admin');

  expect(screen.getByRole('heading', { name: 'หลังบ้าน' })).toBeInTheDocument();
});
