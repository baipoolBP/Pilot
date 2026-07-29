# ฝึกคิดเลขในใจ — เตรียมสอบนักบินกองทัพเรือ

เว็บแอปฝึกคำนวณเลขในใจ (บวก ลบ คูณ หาร ยกกำลัง ถอดราก เลข 2-3 หลัก) 50 ข้อ จับเวลาข้อละ 30 วินาที โจทย์สุ่มใหม่ทุกครั้งที่เริ่มทำ พร้อมระบบตรวจคะแนนและเฉลยรายข้อ

## รันทดสอบในเครื่อง

ต้องมี [Node.js](https://nodejs.org/) เวอร์ชัน 18 ขึ้นไป

```bash
npm install
npm run dev
```

แล้วเปิด http://localhost:3000

## Deploy ขึ้น Vercel

1. สร้าง repository บน GitHub แล้ว push โค้ดโปรเจกต์นี้ขึ้นไป:
   ```bash
   git init
   git add .
   git commit -m "init: navy pilot mental math trainer"
   git branch -M main
   git remote add origin <URL ของ repo คุณ>
   git push -u origin main
   ```
2. เข้า https://vercel.com แล้วกด **Add New... > Project**
3. เลือก repo ที่เพิ่ง push ขึ้นไป Vercel จะตรวจพบว่าเป็นโปรเจกต์ Next.js อัตโนมัติ (ไม่ต้องตั้งค่าอะไรเพิ่ม)
4. กด **Deploy** รอสักครู่ก็จะได้ลิงก์ `https://<ชื่อโปรเจกต์>.vercel.app` ใช้งานได้ทันที

หรือใช้ Vercel CLI:
```bash
npm i -g vercel
vercel
```

## ปรับแต่งความยาก / จำนวนข้อ / เวลา

แก้ไขได้ที่:
- `app/QuizApp.tsx` — ค่าคงที่ `TOTAL_QUESTIONS` (จำนวนข้อ) และ `TIME_PER_QUESTION` (วินาทีต่อข้อ)
- `lib/generateQuestions.ts` — ช่วงตัวเลขของแต่ละโจทย์ (บวก ลบ คูณ หาร ยกกำลัง ถอดราก)
