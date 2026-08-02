"use client";

import TimedQuizApp from "@/components/TimedQuizApp";
import { generateQuestions, OP_LABEL } from "@/lib/generateQuestions";

const TOTAL_QUESTIONS = 50;
const TIME_PER_QUESTION = 30; // seconds

export default function QuizApp() {
  return (
    <TimedQuizApp
      config={{
        title: "ฝึกคิดเลขในใจ",
        subtitle: "เตรียมสอบนักบิน กองทัพเรือ",
        totalQuestions: TOTAL_QUESTIONS,
        timePerQuestion: TIME_PER_QUESTION,
        generateQuestions,
        typeLabel: OP_LABEL,
        bullets: [
          <>
            ทั้งหมด <b className="text-white">50 ข้อ</b> — บวก ลบ คูณ หาร ยกกำลัง ถอดราก (เลข 2-3
            หลัก)
          </>,
          <>
            จับเวลาข้อละ <b className="text-white">30 วินาที</b> หมดเวลาแล้วข้ามอัตโนมัติ
          </>,
          <>
            โจทย์จะ <b className="text-white">สุ่มใหม่ทุกครั้ง</b> ที่กดเริ่ม
          </>,
          <>พิมพ์คำตอบแล้วกด Enter หรือปุ่ม &quot;ตอบ&quot; เพื่อไปข้อถัดไป</>,
          <>เมื่อทำครบจะมีสรุปคะแนน เวลาที่ใช้ และเฉลยรายข้อ</>,
        ],
      }}
    />
  );
}
