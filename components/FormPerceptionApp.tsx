"use client";

import { useEffect, useState } from "react";
import {
  generateForm,
  isRowCorrect,
  FormQuestion,
  FormAnswer,
  ROWS_PER_PAGE,
  PAGE_COUNT,
  TOTAL_TIME,
} from "@/lib/formPerceptionTest";
import LineSymbolIcon from "@/components/LineSymbolIcon";

type Phase = "start" | "running" | "result";

export default function FormPerceptionApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [maxMatches, setMaxMatches] = useState<1 | 2>(2);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, FormAnswer>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  function startTest() {
    setQuestions(generateForm(maxMatches));
    setAnswers({});
    setPageIndex(0);
    setPhase("running");
  }

  useEffect(() => {
    if (phase !== "running") return;
    const deadline = Date.now() + TOTAL_TIME * 1000;
    setTimeLeft(TOTAL_TIME);

    const interval = setInterval(() => {
      const remain = Math.max(0, (deadline - Date.now()) / 1000);
      setTimeLeft(remain);
      if (remain <= 0) {
        clearInterval(interval);
        setPhase("result");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  function toggleCandidate(qIndex: number, candIndex: number) {
    setAnswers((prev) => {
      const cur = prev[qIndex] ?? { selected: new Set<number>(), no: false };
      const selected = new Set(cur.selected);
      if (selected.has(candIndex)) {
        selected.delete(candIndex);
      } else {
        if (selected.size >= maxMatches) return prev;
        selected.add(candIndex);
      }
      return { ...prev, [qIndex]: { selected, no: false } };
    });
  }

  function toggleNo(qIndex: number) {
    setAnswers((prev) => {
      const cur = prev[qIndex] ?? { selected: new Set<number>(), no: false };
      return { ...prev, [qIndex]: { selected: new Set(), no: !cur.no } };
    });
  }

  if (phase === "start") {
    return <StartScreen maxMatches={maxMatches} onChangeMaxMatches={setMaxMatches} onStart={startTest} />;
  }

  if (phase === "result") {
    return <ResultScreen questions={questions} answers={answers} onRestart={startTest} />;
  }

  const pageQuestions = questions.slice(pageIndex * ROWS_PER_PAGE, pageIndex * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const pct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft <= 20 ? "bg-red-500" : timeLeft <= 45 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-300">
          <span>
            หารูปที่เหมือน — หน้า {pageIndex + 1} / {PAGE_COUNT}
          </span>
          <button
            type="button"
            onClick={() => setPhase("result")}
            className="text-xs bg-slate-700/60 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
          >
            ส่งคำตอบ
          </button>
        </div>

        <div className="sticky top-14 z-10 bg-white/95 backdrop-blur text-slate-800 border border-slate-300 rounded-2xl p-3 mb-3 shadow-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs sm:text-sm text-slate-700">
              เทียบ 2 รูปทางซ้ายกับ 5 ตัวเลือกทางขวา ติ๊กตัวที่เหมือน (มีได้ 0-{maxMatches} ตัว) ไม่มีให้ติ๊ก NO
            </p>
            <div className="flex-1 min-w-[160px]">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${timerColor} transition-[width] duration-100 ease-linear`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">เหลือเวลา {Math.ceil(timeLeft)} วินาที</p>
            </div>
          </div>
        </div>

        <div className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="flex flex-col divide-y divide-slate-100">
            {pageQuestions.map((q, i) => {
              const globalIndex = pageIndex * ROWS_PER_PAGE + i;
              return (
                <QuestionRow
                  key={globalIndex}
                  globalIndex={globalIndex}
                  question={q}
                  answer={answers[globalIndex]}
                  interactive
                  onToggleCandidate={(ci) => toggleCandidate(globalIndex, ci)}
                  onToggleNo={() => toggleNo(globalIndex)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          {pageIndex < PAGE_COUNT - 1 ? (
            <button
              type="button"
              onClick={() => setPageIndex((p) => p + 1)}
              className="bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl px-6 py-3 font-semibold"
            >
              ไปหน้าถัดไป ({pageIndex + 2}/{PAGE_COUNT}) →
            </button>
          ) : (
            <p className="text-xs text-slate-500">หน้าสุดท้ายแล้ว — กด &quot;ส่งคำตอบ&quot; เมื่อทำเสร็จ</p>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          คลิกตัวเลือกเพื่อติ๊ก/ยกเลิกติ๊ก (สูงสุด {maxMatches} ตัว) — หมดเวลาหรือกดส่งคำตอบแล้วระบบจะตรวจให้ทันที
        </p>
      </div>
    </div>
  );
}

function QuestionRow({
  globalIndex,
  question,
  answer,
  interactive,
  onToggleCandidate,
  onToggleNo,
}: {
  globalIndex: number;
  question: FormQuestion;
  answer: FormAnswer | undefined;
  interactive: boolean;
  onToggleCandidate?: (candIndex: number) => void;
  onToggleNo?: () => void;
}) {
  const selected = answer?.selected ?? new Set<number>();
  const no = answer?.no ?? false;
  const correctSet = new Set(question.correctIndices);
  const rowIsCorrect = !interactive ? isRowCorrect(question, answer) : null;

  return (
    <div className="flex items-center gap-1 py-1.5">
      <span className="w-8 text-right text-xs text-slate-400 shrink-0">{globalIndex + 1}.</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {question.keys.map((k, i) => (
          <span
            key={i}
            className="w-11 h-11 flex items-center justify-center border border-slate-400 rounded-lg bg-slate-50 shrink-0"
          >
            <LineSymbolIcon symbol={k} className="w-7 h-7 text-slate-700" />
          </span>
        ))}
      </div>
      <span className="w-px h-9 bg-slate-300 mx-4 shrink-0" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        {question.candidates.map((c, i) => {
          const isSelected = selected.has(i);
          const isCorrect = correctSet.has(i);
          let cellClass = "border-slate-300 hover:bg-slate-100";
          if (!interactive) {
            if (isCorrect && isSelected) cellClass = "border-emerald-500 bg-emerald-100";
            else if (isCorrect && !isSelected) cellClass = "border-amber-500 bg-amber-100";
            else if (!isCorrect && isSelected) cellClass = "border-rose-500 bg-rose-100";
            else cellClass = "border-slate-200";
          } else if (isSelected) {
            cellClass = "border-indigo-500 bg-indigo-100";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => onToggleCandidate?.(i)}
              className={`relative w-11 h-11 shrink-0 flex items-center justify-center border rounded-lg transition-colors ${cellClass}`}
            >
              <LineSymbolIcon symbol={c} className="w-7 h-7 text-slate-700" />
            </button>
          );
        })}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => onToggleNo?.()}
          className={`w-12 h-11 shrink-0 flex items-center justify-center border rounded-lg text-xs font-bold transition-colors ${
            !interactive
              ? question.correctIndices.length === 0 && no
                ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                : question.correctIndices.length === 0 && !no
                ? "border-amber-500 bg-amber-100 text-amber-700"
                : no
                ? "border-rose-500 bg-rose-100 text-rose-700"
                : "border-slate-200 text-slate-400"
              : no
              ? "border-indigo-500 bg-indigo-100 text-indigo-700"
              : "border-slate-300 hover:bg-slate-100 text-slate-500"
          }`}
        >
          NO
        </button>
      </div>
      {!interactive && (
        <span className={`ml-2 text-sm font-semibold shrink-0 ${rowIsCorrect ? "text-emerald-600" : "text-rose-600"}`}>
          {rowIsCorrect ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}

function StartScreen({
  maxMatches,
  onChangeMaxMatches,
  onStart,
}: {
  maxMatches: 1 | 2;
  onChangeMaxMatches: (v: 1 | 2) => void;
  onStart: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">หารูปที่เหมือนกัน</h1>
        <p className="text-slate-300 mb-6">ฝึกการรับรู้และเปรียบเทียบรูปทรงอย่างรวดเร็ว เตรียมสอบนักบิน กองทัพเรือ</p>

        <div className="text-left mb-6">
          <p className="text-sm text-slate-300 mb-2">เลือกจำนวนตัวเลือกที่อาจเหมือนกันได้สูงสุดต่อข้อ:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChangeMaxMatches(1)}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold border transition-colors ${
                maxMatches === 1
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              0-1 ตัว (ง่ายกว่า)
            </button>
            <button
              type="button"
              onClick={() => onChangeMaxMatches(2)}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold border transition-colors ${
                maxMatches === 2
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              0-2 ตัว (มาตรฐาน)
            </button>
          </div>
        </div>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li>
            • แต่ละข้อมีสัญลักษณ์ <b className="text-white">2 รูป</b> ทางซ้าย และตัวเลือก{" "}
            <b className="text-white">5 รูป</b> ทางขวา
          </li>
          <li>
            • ติ๊กตัวเลือกที่ <b className="text-white">เหมือนกับรูปทางซ้าย</b> ตัวใดตัวหนึ่ง (มีได้ 0
            {maxMatches === 2 ? ", 1 หรือ 2 ตัว" : " หรือ 1 ตัว"})
          </li>
          <li>
            • ถ้าไม่มีตัวเลือกใดเหมือนเลย ให้ติ๊ก <b className="text-white">NO</b> แทน
          </li>
          <li>
            • ทั้งหมด <b className="text-white">60 ข้อ</b> แบ่งเป็น <b className="text-white">6 หน้า</b> (หน้าละ 10
            ข้อ) กด &quot;ไปหน้าถัดไป&quot; เองเมื่อทำหน้าปัจจุบันเสร็จ
          </li>
          <li>
            • จับเวลารวม <b className="text-white">{TOTAL_TIME} วินาที</b> สำหรับทุกหน้ารวมกัน ทำให้เร็วและแม่นที่สุด
          </li>
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
  questions,
  answers,
  onRestart,
}: {
  questions: FormQuestion[];
  answers: Record<number, FormAnswer>;
  onRestart: () => void;
}) {
  const total = questions.length;
  const correctCount = questions.filter((q, i) => isRowCorrect(q, answers[i])).length;

  const pages = Array.from({ length: PAGE_COUNT }, (_, p) =>
    questions.slice(p * ROWS_PER_PAGE, p * ROWS_PER_PAGE + ROWS_PER_PAGE)
  );

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-300 mb-1">สรุปผลการทดสอบ</h2>
          <p className="text-5xl font-extrabold my-3">
            {correctCount} <span className="text-2xl text-slate-400">/ {total}</span>
          </p>
          <p className="text-slate-300 mb-6">
            ความแม่นยำ {total ? ((correctCount / total) * 100).toFixed(1) : 0}%
          </p>

          <button
            onClick={onRestart}
            className="w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-bold"
          >
            ทำแบบทดสอบใหม่ (โจทย์ชุดใหม่)
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          ตรวจคำตอบ: <span className="text-emerald-600 font-semibold">เขียว = ติ๊กถูก</span>{" "}
          <span className="text-rose-600 font-semibold">แดง = ติ๊กผิด</span>{" "}
          <span className="text-amber-600 font-semibold">เหลือง = พลาดไม่ได้ติ๊ก</span>
        </p>

        {pages.map((pageQuestions, p) => (
          <div
            key={p}
            className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl overflow-x-auto mb-4"
          >
            <p className="text-sm font-semibold text-slate-600 mb-2">หน้า {p + 1}</p>
            <div className="flex flex-col divide-y divide-slate-100">
              {pageQuestions.map((q, i) => {
                const globalIndex = p * ROWS_PER_PAGE + i;
                return (
                  <QuestionRow
                    key={globalIndex}
                    globalIndex={globalIndex}
                    question={q}
                    answer={answers[globalIndex]}
                    interactive={false}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
