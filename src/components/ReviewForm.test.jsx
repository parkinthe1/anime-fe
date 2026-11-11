import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

test('ยังไม่พิมพ์อะไร ปุ่มส่งต้องกดไม่ได้', () => {
  render(<ReviewForm animeTitle="Frieren" onSubmit={jest.fn()} />);

  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
});

test('พิมพ์แล้วกดส่ง ต้องเรียก onSubmit ด้วยข้อความที่พิมพ์ แล้วขึ้นข้อความขอบคุณ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockResolvedValue();
  render(<ReviewForm animeTitle="Frieren" onSubmit={onSubmit} />);

  await user.type(screen.getByPlaceholderText(/ดูแล้วรู้สึกอย่างไร/), 'สนุกมาก เนื้อเรื่องดี');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(onSubmit).toHaveBeenCalledWith('สนุกมาก เนื้อเรื่องดี');
  expect(await screen.findByText(/ขอบคุณสำหรับรีวิว Frieren/)).toBeInTheDocument();
});

test('ถ้า onSubmit โยน Error ต้องโชว์ข้อความนั้น และฟอร์มยังอยู่ให้แก้ต่อ', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn().mockRejectedValue(new Error('รีวิวสั้นเกินไป'));
  render(<ReviewForm animeTitle="Frieren" onSubmit={onSubmit} />);

  await user.type(screen.getByPlaceholderText(/ดูแล้วรู้สึกอย่างไร/), 'สั้นไป');
  await user.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

  expect(await screen.findByText('รีวิวสั้นเกินไป')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeInTheDocument();
  expect(screen.queryByText(/ขอบคุณสำหรับรีวิว/)).not.toBeInTheDocument();
});
