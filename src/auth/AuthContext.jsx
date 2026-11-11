import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../api/backend';

const AuthContext = createContext(null);

export const TOKEN_KEY = 'aniwave.token';
export const MEMBER_KEY = 'aniwave.member';

function readMember() {
  try {
    return JSON.parse(localStorage.getItem(MEMBER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(readMember);

  function clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
    setToken(null);
    setMember(null);
  }

  // ตรวจตั๋วที่จำไว้กับ server ตอนเปิดเว็บ: หมดอายุ (401) ถึงจะออกจากระบบ
  // server ล่มชั่วคราวไม่ควรเตะคนออก จึงไม่ทำอะไรกับ error อื่น
  useEffect(() => {
    if (!token) return;
    let ignore = false;
    Promise.resolve(getMe(token))
      .then(data => {
        if (ignore || !data) return;
        const fresh = data.member ?? data;
        setMember(fresh);
        localStorage.setItem(MEMBER_KEY, JSON.stringify(fresh));
      })
      .catch(err => {
        if (!ignore && err?.status === 401) clear();
      });
    return () => { ignore = true; };
  }, [token]);

  async function login(email, password) {
    const data = await loginApi(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(data.member));
    setToken(data.token);
    setMember(data.member);
    return data;
  }

  const register = (email, password, displayName) => registerApi(email, password, displayName);

  // ใช้หลังแก้โปรไฟล์ เพื่อให้ Navbar เปลี่ยนชื่อทันที
  function updateMember(next) {
    setMember(next);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(next));
  }

  // isAdmin ใช้แค่ "โชว์/ซ่อน" เมนูและหน้า การป้องกันจริงอยู่ที่ Go: แก้ localStorage เป็น admin ก็ยิง /api/admin ไม่ผ่าน
  const value = {
    token,
    member,
    isLoggedIn: Boolean(token),
    isAdmin: member?.role === 'admin',
    login,
    register,
    logout: clear,
    updateMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
