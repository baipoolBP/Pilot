"use client";

import TimedQuizApp from "@/components/TimedQuizApp";
import { generateSeriesQuestions, SERIES_TYPE_LABEL } from "@/lib/generateSeries";

const TOTAL_QUESTIONS = 20;
const TIME_PER_QUESTION = 30; // seconds

export default function SeriesTestApp() {
  return (
    <TimedQuizApp
      config={{
        title: "อนุกรมตัวเลข",
        subtitle: "หากฎของลำดับตัวเลข แล้วเติมตัวถัดไป เตรียมสอบนักบิน กองทัพเรือ",
        totalQuestions: TOTAL_QUESTIONS,
        timePerQuestion: TIME_PER_QUESTION,
        generateQuestions: generateSeriesQuestions,
        typeLabel: SERIES_TYPE_LABEL,
        questionTextSizeClass: "text-3xl sm:text-4xl",
        bullets: [
          <>
            ทั้งหมด <b className="text-white">20 ข้อ</b> — โจทย์อนุกรมตัวเลขหลายรูปแบบ (บวก/ลบคงที่,
            คูณ/หารคงที่, ฟีโบนัชชี, กำลังสอง/สาม ฯลฯ)
          </>,
          <>
            จับเวลาข้อละ <b className="text-white">30 วินาที</b> หมดเวลาแล้วข้ามอัตโนมัติ
          </>,
          <>
            โจทย์จะ <b className="text-white">สุ่มใหม่ทุกครั้ง</b> ที่กดเริ่ม
          </>,
          <>ดูตัวเลขที่ให้มา หากฎ แล้วพิมพ์ตัวเลขถัดไป กด Enter หรือปุ่ม &quot;ตอบ&quot;</>,
          <>เมื่อทำครบจะมีสรุปคะแนน เวลาที่ใช้ และเฉลยรายข้อ</>,
        ],
      }}
    />
  );
}
