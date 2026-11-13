import { formatDuration } from './format';

test('แปลงวินาทีเป็น นาที:วินาที และเติมศูนย์ให้วินาทีหลักเดียว', () => {
  expect(formatDuration(205)).toBe('3:25');
  expect(formatDuration(60)).toBe('1:00');
  expect(formatDuration(65)).toBe('1:05');
});

test('ไม่มีค่าหรือค่าไม่ใช่ตัวเลข แสดงเป็น "-" ไม่ใช่ NaN', () => {
  expect(formatDuration(null)).toBe('-');
  expect(formatDuration(undefined)).toBe('-');
  expect(formatDuration('abc')).toBe('-');
});

test('ค่าติดลบถูกปัดเป็น 0:00', () => {
  expect(formatDuration(-5)).toBe('0:00');
});
