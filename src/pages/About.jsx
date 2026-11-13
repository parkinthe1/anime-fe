function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เกี่ยวกับ MusicKen</h1>
      <p className="mt-4 leading-relaxed text-slate-300">
        MusicKen เป็นเว็บเพลย์ลิสต์เพลงที่ทำเป็นโปรเจกต์ประกอบวิชา 520 341 Client Side Web Programming
        ผู้ชมทั่วไปค้นหาและฟังตัวอย่างเพลงได้ สมาชิกสร้างเพลย์ลิสต์ของตัวเอง จัดลำดับเพลง กดถูกใจเพลย์ลิสต์ของคนอื่น และดูประวัติการฟัง
        ส่วนผู้ดูแลระบบจัดการเพลง ศิลปิน เพลย์ลิสต์ และสมาชิกในหลังบ้าน
      </p>
      <h2 className="mt-8 font-medium text-white">เทคโนโลยี</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
        <li>Frontend: React + React Router + Tailwind CSS (Vercel)</li>
        <li>Backend: Go (Render)</li>
        <li>ฐานข้อมูล: Supabase (PostgreSQL)</li>
        <li>ข้อมูลเพลงนำเข้าจาก iTunes Search API ผ่าน Go แล้วเก็บในฐานข้อมูลของเรา</li>
      </ul>
    </div>
  );
}

export default About;
