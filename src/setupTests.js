// รันก่อนทุกไฟล์เทสต์ (CRA หาไฟล์ชื่อนี้เอง) เพิ่ม matcher เช่น toBeInTheDocument()
import '@testing-library/jest-dom';

// react-router 6 เตือนเรื่อง v7 ทุกครั้งที่สร้าง Router ในเทสต์ ปิดเฉพาะข้อความนั้น
const realWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg, ...rest) => {
    if (String(msg).includes('React Router Future Flag Warning')) return;
    realWarn(msg, ...rest);
  });
});
