"use client";

import { useEffect, useState } from "react";
import { generateSet, InequalityQuestion, Verdict, TOTAL_QUESTIONS, TOTAL_TIME } from "@/lib/inequalityTest";

type Phase = "start" | "running" | "result";

export default function InequalityTestApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [questions, setQuestions] = useState<InequalityQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, Verdict>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  function startTest() {
    setQuestions(generateSet());
    setAnswers({});
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

  function selectAnswer(qIndex: number, verdict: Verdict) {
    setAnswers((prev) => ({ ...prev, [qIndex]: verdict }));
  }

  if (phase === "start") {
    return <StartScreen onStart={startTest} />;
  }

  if (phase === "result") {
    return <ResultScreen questions={questions} answers={answers} onRestart={startTest} />;
  }

  const pct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft <= 60 ? "bg-red-500" : timeLeft <= 180 ? "bg-yellow-400" : "bg-emerald-500";
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.ceil(timeLeft % 60);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-300">
          <span>พิจารณาอสมการ — {TOTAL_QUESTIONS} ข้อ</span>
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
            <p className="text-xs sm:text-sm text-slate-700">พิจารณาว่าข้อสรุปเป็น True, False หรือ ? (สรุปแน่นอนไม่ได้)</p>
            <div className="flex-1 min-w-[160px]">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${timerColor} transition-[width] duration-100 ease-linear`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">
                เหลือเวลา {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col divide-y divide-slate-100">
            {questions.map((q, i) => (
              <QuestionRow
                key={i}
                index={i}
                question={q}
                selected={answers[i]}
                interactive
                onSelect={(v) => selectAnswer(i, v)}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          คลิกเลือกคำตอบ True / False / ? แต่ละข้อ — หมดเวลาหรือกดส่งคำตอบแล้วระบบจะตรวจให้ทันที
        </p>
      </div>
    </div>
  );
}

function QuestionRow({
  index,
  question,
  selected,
  interactive,
  onSelect,
}: {
  index: number;
  question: InequalityQuestion;
  selected: Verdict | undefined;
  interactive: boolean;
  onSelect?: (v: Verdict) => void;
}) {
  const isRowCorrect = !interactive && selected === question.answer;

  return (
    <div className="flex items-center gap-3 py-2 flex-wrap sm:flex-nowrap">
      <span className="w-7 text-right text-xs text-slate-400 shrink-0">{index + 1}.</span>
      <span className="font-mono text-base sm:text-lg text-slate-800 shrink-0">
        A {question.a} B {question.b} C
      </span>
      <span className="text-slate-400 shrink-0">∴</span>
      <span className="font-mono text-base sm:text-lg text-slate-800 shrink-0">A {question.conclusion} C</span>
      <div className="flex items-center gap-1.5 sm:ml-auto">
        {(["True", "False", "?"] as Verdict[]).map((v) => {
          const isSelected = selected === v;
          let cls = "border-slate-300 text-slate-600 hover:bg-slate-100";
          if (!interactive) {
            if (v === question.answer) cls = "border-emerald-500 bg-emerald-100 text-emerald-700";
            else if (isSelected) cls = "border-rose-500 bg-rose-100 text-rose-700";
            else cls = "border-slate-200 text-slate-300";
          } else if (isSelected) {
            cls = "border-indigo-500 bg-indigo-100 text-indigo-700";
          }
          return (
            <button
              key={v}
              type="button"
              disabled={!interactive}
              onClick={() => onSelect?.(v)}
              className={`w-14 h-9 shrink-0 flex items-center justify-center border rounded-lg text-xs font-bold transition-colors ${cls}`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {!interactive && (
        <span className={`text-sm font-semibold shrink-0 ${isRowCorrect ? "text-emerald-600" : "text-rose-600"}`}>
          {isRowCorrect ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">พิจารณาอสมการ</h1>
        <p className="text-slate-300 mb-6">ฝึกการให้เหตุผลเชิงตรรกะจากอสมการ เตรียมสอบนักบิน กองทัพเรือ</p>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li>
            • แต่ละข้อกำหนดความสัมพันธ์ระหว่าง <b className="text-white">A, B, C</b> เช่น{" "}
            <span className="font-mono text-white">A &lt; B &gt; C</span>
          </li>
          <li>
            • แล้วให้พิจารณาข้อสรุปที่กำหนด เช่น <span className="font-mono text-white">A = C</span> ว่าเป็นจริงเสมอ (
            <b className="text-white">True</b>), เป็นเท็จเสมอ (<b className="text-white">False</b>) หรือสรุปแน่นอนไม่ได้ (
            <b className="text-white">?</b>)
          </li>
          <li>
            • ทั้งหมด <b className="text-white">{TOTAL_QUESTIONS} ข้อ</b> เรียงลงมาในหน้าเดียว
          </li>
          <li>
            • จับเวลารวม <b className="text-white">10 นาที</b> ทำให้เร็วและแม่นที่สุด
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
  questions: InequalityQuestion[];
  answers: Record<number, Verdict>;
  onRestart: () => void;
}) {
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.answer).length;

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
          ตรวจคำตอบ: <span className="text-emerald-600 font-semibold">เขียว = คำตอบที่ถูกต้อง</span>{" "}
          <span className="text-rose-600 font-semibold">แดง = คำตอบที่คุณเลือก (ผิด)</span>
        </p>

        <div className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col divide-y divide-slate-100">
            {questions.map((q, i) => (
              <QuestionRow key={i} index={i} question={q} selected={answers[i]} interactive={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
