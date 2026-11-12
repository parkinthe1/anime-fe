import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ครอบหน้าที่เฉพาะบทบาท (เช่น admin) ยังไม่ login -> /login, login แล้วแต่บทบาทไม่พอ -> 403
// หมายเหตุ: เป็นแค่การซ่อนหน้า สิทธิ์จริงตรวจที่ Go ทุก endpoint /api/admin
function RequireRole({ role, children }) {
  const { isLoggedIn, member } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (member?.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-mute/70">403</p>
        <p className="mt-2 text-mute">หน้านี้สำหรับ {role} เท่านั้น บัญชีของคุณเป็น {member?.role ?? 'member'}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-sea hover:underline">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default RequireRole;
