"use client";

import { useEffect, useRef, useState } from "react";
import { generateQuestions, OP_LABEL, Question, OpType } from "@/lib/generateQuestions";

const TOTAL_QUESTIONS = 50;
const TIME_PER_QUESTION = 30; // seconds

type Phase = "start" | "quiz" | "result";

interface AnswerRecord {
  question: Question;
  userAnswer: string;
  correct: boolean;
  timeUsed: number;
  timedOut: boolean;
}

interface Toast {
  key: number;
  correct: boolean;
  text: string;
}

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [toast, setToast] = useState<Toast | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<(timedOut: boolean) => void>(() => {});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startQuiz() {
    setQuestions(generateQuestions(TOTAL_QUESTIONS));
    setRecords([]);
    setCurrentIndex(0);
    setInput("");
    setToast(null);
    setPhase("quiz");
  }

  function submitAnswer(timedOut: boolean) {
    const q = questions[currentIndex];
    if (!q) return;
    const userVal = input.trim();
    const correct = !timedOut && userVal !== "" && parseInt(userVal, 10) === q.answer;
    const timeUsed = Math.min(
      TIME_PER_QUESTION,
      Math.round((TIME_PER_QUESTION - timeLeft) * 10) / 10
    );

    setRecords((prev) => [
      ...prev,
      { question: q, userAnswer: timedOut ? "" : userVal, correct, timeUsed, timedOut },
    ]);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({
      key: Date.now(),
      correct,
      text: correct ? "ถูกต้อง ✅" : `ผิด — เฉลย ${q.answer} ❌`,
    });
    toastTimerRef.current = setTimeout(() => setToast(null), 1400);

    setInput("");

    if (currentIndex + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  useEffect(() => {
    submitRef.current = submitAnswer;
  });

  // Timer per question
  useEffect(() => {
    if (phase !== "quiz") return;
    const deadline = Date.now() + TIME_PER_QUESTION * 1000;
    setTimeLeft(TIME_PER_QUESTION);

    const interval = setInterval(() => {
      const remain = Math.max(0, (deadline - Date.now()) / 1000);
      setTimeLeft(remain);
      if (remain <= 0) {
        clearInterval(interval);
        submitRef.current(true);
      }
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase]);

  useEffect(() => {
    if (phase === "quiz") {
      inputRef.current?.focus();
    }
  }, [currentIndex, phase]);

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    submitAnswer(false);
  }

  function handleSkip() {
    submitAnswer(true);
  }

  if (phase === "start") {
    return <StartScreen onStart={startQuiz} />;
  }

  if (phase === "result") {
    return <ResultScreen records={records} onRestart={startQuiz} />;
  }

  const q = questions[currentIndex];
  const pct = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerColor =
    timeLeft <= 8 ? "bg-red-500" : timeLeft <= 15 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {toast && (
        <div
          key={toast.key}
          className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold ${
            toast.correct ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-300">
          <span>
            ข้อที่ <span className="font-bold text-white">{currentIndex + 1}</span> / {questions.length}
          </span>
          <span className="uppercase tracking-wide text-xs bg-slate-700/60 px-2 py-1 rounded">
            {OP_LABEL[q.type as OpType]}
          </span>
        </div>

        {/* overall progress */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-sky-500 transition-all duration-200"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <p className="text-4xl sm:text-5xl font-bold tracking-wide">{q.text}</p>
          </div>

          {/* timer bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${timerColor} transition-[width] duration-100 ease-linear`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-400 mb-6">
            เหลือเวลา {timeLeft.toFixed(1)} วินาที
          </p>

          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="พิมพ์คำตอบ..."
              className="w-full text-center text-2xl font-semibold bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-semibold"
              >
                ตอบ (Enter)
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-5 bg-slate-700 hover:bg-slate-600 transition-colors rounded-xl py-3 font-semibold text-slate-200"
              >
                ข้าม
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          ถูกแล้ว {records.filter((r) => r.correct).length} ข้อ จากที่ตอบไปแล้ว {records.length} ข้อ
        </p>
      </div>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">ฝึกคิดเลขในใจ</h1>
        <p className="text-slate-300 mb-6">เตรียมสอบนักบิน กองทัพเรือ</p>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li>• ทั้งหมด <b className="text-white">50 ข้อ</b> — บวก ลบ คูณ หาร ยกกำลัง ถอดราก (เลข 2-3 หลัก)</li>
          <li>• จับเวลาข้อละ <b className="text-white">30 วินาที</b> หมดเวลาแล้วข้ามอัตโนมัติ</li>
          <li>• โจทย์จะ <b className="text-white">สุ่มใหม่ทุกครั้ง</b> ที่กดเริ่ม</li>
          <li>• พิมพ์คำตอบแล้วกด Enter หรือปุ่ม &quot;ตอบ&quot; เพื่อไปข้อถัดไป</li>
          <li>• เมื่อทำครบจะมีสรุปคะแนน เวลาที่ใช้ และเฉลยรายข้อ</li>
        </ul>

        <button
          onClick={onStart}
          className="w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-4 font-bold text-lg"
        >
          เริ่มทำแบบทดสอบ
        </button>
      </div>
    </div>
  );
}

function ResultScreen({
  records,
  onRestart,
}: {
  records: AnswerRecord[];
  onRestart: () => void;
}) {
  const score = records.filter((r) => r.correct).length;
  const totalTime = records.reduce((s, r) => s + r.timeUsed, 0);
  const avgTime = records.length ? totalTime / records.length : 0;

  const byType: Record<string, { correct: number; total: number }> = {};
  for (const r of records) {
    const t = r.question.type;
    byType[t] = byType[t] || { correct: 0, total: 0 };
    byType[t].total += 1;
    if (r.correct) byType[t].correct += 1;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-300 mb-1">สรุปผลการทดสอบ</h2>
          <p className="text-5xl font-extrabold my-3">
            {score} <span className="text-2xl text-slate-400">/ {records.length}</span>
          </p>
          <p className="text-slate-300 mb-4">
            ความแม่นยำ {records.length ? ((score / records.length) * 100).toFixed(1) : 0}%
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400">เวลารวมที่ใช้</p>
              <p className="text-lg font-bold text-white">{totalTime.toFixed(1)} วินาที</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-slate-400">เวลาเฉลี่ยต่อข้อ</p>
              <p className="text-lg font-bold text-white">{avgTime.toFixed(1)} วินาที</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
            {Object.entries(byType).map(([type, v]) => (
              <div key={type} className="bg-slate-900/50 rounded-lg p-2">
                <p className="text-slate-400">{OP_LABEL[type as OpType]}</p>
                <p className="font-bold text-white">
                  {v.correct}/{v.total}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="mt-6 w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-bold"
          >
            ทำแบบทดสอบใหม่ (โจทย์ชุดใหม่)
          </button>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">โจทย์</th>
                  <th className="px-3 py-2 text-left">คำตอบคุณ</th>
                  <th className="px-3 py-2 text-left">เฉลย</th>
                  <th className="px-3 py-2 text-left">เวลา (วิ)</th>
                  <th className="px-3 py-2 text-center">ผล</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-t border-slate-700/60 ${
                      r.correct ? "bg-emerald-950/20" : "bg-rose-950/20"
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">{r.question.text}</td>
                    <td className="px-3 py-2">
                      {r.timedOut ? (
                        <span className="text-slate-500 italic">หมดเวลา</span>
                      ) : (
                        r.userAnswer || "-"
                      )}
                    </td>
                    <td className="px-3 py-2 font-semibold">{r.question.answer}</td>
                    <td className="px-3 py-2 text-slate-400">{r.timeUsed.toFixed(1)}</td>
                    <td className="px-3 py-2 text-center">{r.correct ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
