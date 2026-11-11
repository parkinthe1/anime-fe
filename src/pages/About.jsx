function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-white">เกี่ยวกับ AniWave</h1>
      <p className="mt-4 leading-relaxed text-slate-300">
        AniWave เป็นเว็บรวมอนิเมะที่ทำเป็นโปรเจกต์ประกอบวิชา 520 341 Client Side Web Programming
        ผู้ชมทั่วไปดูรายการได้ สมาชิกให้คะแนน รีวิว และเก็บรายการที่อยากดูได้ ส่วนผู้ดูแลระบบจัดการอนิเมะและสมาชิกได้ในหลังบ้าน
      </p>
      <h2 className="mt-8 font-medium text-white">เทคโนโลยี</h2>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
        <li>Frontend: React + React Router + Tailwind CSS (Vercel)</li>
        <li>Backend: Go (Render)</li>
        <li>ฐานข้อมูล: Supabase (PostgreSQL)</li>
        <li>ข้อมูลอนิเมะ: Jikan API (กำลังจะเชื่อมต่อ)</li>
      </ul>
    </div>
  );
}

export default About;
