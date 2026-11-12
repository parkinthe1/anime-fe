/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // โทนน้ำทะเลตามชื่อ AniWave: หมึกกรมท่า + เขียวทะเล + ส้มปะการังเป็นจุดเน้น
      colors: {
        ink: '#14213D',     // ตัวอักษรหลัก และแถบเมนูด้านข้าง
        paper: '#EDF2F5',   // พื้นหลังหน้าเว็บ
        foam: '#D9EBEE',    // พื้นรอง ป้าย ช่องว่างของรูป
        sea: '#0B6B74',     // ลิงก์ และสถานะที่เลือกอยู่
        coral: '#F25C54',   // จุดเน้น: ปุ่มหลัก ป้ายคะแนน
        mute: '#556479',    // ตัวอักษรรอง
        line: '#C9D5DE',    // เส้นแบ่งบาง ๆ
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        display: ['Mitr', '"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
      },
      // เงาทึบแบบกรอบมังงะ ใช้กับปุ่มหลัก ฟอร์มสมาชิก และกล่องรีวิวเท่านั้น
      boxShadow: {
        panel: '4px 4px 0 0 #14213D',
        press: '2px 2px 0 0 #14213D',
      },
    },
  },
  plugins: [],
};
