"use client";

import { useEffect, useState } from "react";
import { generateSet, JigsawQuestion, Mode, TOTAL_QUESTIONS, TOTAL_TIME } from "@/lib/jigsawTest";
import PolygonIcon from "@/components/PolygonIcon";

type Phase = "start" | "running" | "result";

const CHOICE_LABELS = ["ก", "ข", "ค", "ง", "จ"];

export default function JigsawTestApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [mode, setMode] = useState<Mode>("fragments-to-whole");
  const [questions, setQuestions] = useState<JigsawQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  function startTest() {
    setQuestions(generateSet(mode));
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

  function selectAnswer(qIndex: number, choiceIndex: number) {
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIndex }));
  }

  if (phase === "start") {
    return <StartScreen mode={mode} onChangeMode={setMode} onStart={startTest} />;
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
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-300">
          <span>ประกอบรูปภาพ — {TOTAL_QUESTIONS} ข้อ</span>
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
              {mode === "fragments-to-whole"
                ? "ชิ้นส่วนซ้ายประกอบกันเป็นรูปใดในตัวเลือกขวา"
                : "ตัวเลือกชุดใดประกอบกันเป็นรูปทางซ้ายได้"}
            </p>
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
                onSelect={(ci) => selectAnswer(i, ci)}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          คลิกเลือกคำตอบแต่ละข้อ — หมดเวลาหรือกดส่งคำตอบแล้วระบบจะตรวจให้ทันที
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
  question: JigsawQuestion;
  selected: number | undefined;
  interactive: boolean;
  onSelect?: (choiceIndex: number) => void;
}) {
  const isRowCorrect = !interactive && selected === question.correctIndex;

  return (
    <div className="flex items-center gap-4 py-4 flex-wrap lg:flex-nowrap">
      <span className="w-7 text-right text-xs text-slate-400 shrink-0">{index + 1}.</span>

      <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-2">
        {question.mode === "fragments-to-whole" ? (
          question.promptPieces!.map((piece, i) => (
            <PolygonIcon key={i} points={piece} className="w-12 h-12 text-slate-700" />
          ))
        ) : (
          <PolygonIcon points={question.promptWhole!} className="w-14 h-14 text-slate-700" />
        )}
      </div>

      <span className="text-slate-400 shrink-0">→</span>

      <div className="flex items-center gap-2 flex-wrap">
        {question.choices.map((c, ci) => {
          const isSelected = selected === ci;
          let cls = "border-slate-300 hover:bg-slate-100";
          if (!interactive) {
            if (ci === question.correctIndex && isSelected) cls = "border-emerald-500 bg-emerald-100";
            else if (ci === question.correctIndex && !isSelected) cls = "border-amber-500 bg-amber-100";
            else if (ci !== question.correctIndex && isSelected) cls = "border-rose-500 bg-rose-100";
            else cls = "border-slate-200";
          } else if (isSelected) {
            cls = "border-indigo-500 bg-indigo-100";
          }
          return (
            <button
              key={ci}
              type="button"
              disabled={!interactive}
              onClick={() => onSelect?.(ci)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border-2 p-1.5 transition-colors ${cls}`}
            >
              {c.whole ? (
                <PolygonIcon points={c.whole} className="w-11 h-11 text-slate-700" />
              ) : (
                <div className="flex items-center gap-0.5">
                  {c.pieces!.map((piece, pi) => (
                    <PolygonIcon key={pi} points={piece} className="w-8 h-8 text-slate-700" />
                  ))}
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-500">{CHOICE_LABELS[ci]}</span>
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

function StartScreen({
  mode,
  onChangeMode,
  onStart,
}: {
  mode: Mode;
  onChangeMode: (m: Mode) => void;
  onStart: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">ประกอบรูปภาพ</h1>
        <p className="text-slate-300 mb-6">ฝึกจินตนาการเชิงมิติ ประกอบชิ้นส่วนกลับเป็นรูปทรงเดิม เตรียมสอบนักบิน กองทัพเรือ</p>

        <div className="text-left mb-6">
          <p className="text-sm text-slate-300 mb-2">เลือกรูปแบบการทำ:</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onChangeMode("fragments-to-whole")}
              className={`rounded-xl py-3 px-4 text-sm font-semibold border text-left transition-colors ${
                mode === "fragments-to-whole"
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              แบบ 1: มีชิ้นส่วนจิ๊กซอทางซ้าย → เลือกรูปที่ประกอบได้จากตัวเลือกขวา
            </button>
            <button
              type="button"
              onClick={() => onChangeMode("whole-to-fragments")}
              className={`rounded-xl py-3 px-4 text-sm font-semibold border text-left transition-colors ${
                mode === "whole-to-fragments"
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              แบบ 2: มีรูปสำเร็จทางซ้าย → เลือกชิ้นส่วนจิ๊กซอที่ประกอบเป็นรูปนั้นได้จากตัวเลือกขวา
            </button>
          </div>
        </div>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li>• รูปที่ประกอบสำเร็จแล้วจะไม่มีรอยต่อให้เห็น ต้องจินตนาการประกอบเอง</li>
          <li>
            • ทั้งหมด <b className="text-white">{TOTAL_QUESTIONS} ข้อ</b> เรียงลงมาในหน้าเดียว มีตัวเลือกให้ 5 ข้อ (ก-จ)
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
  questions: JigsawQuestion[];
  answers: Record<number, number>;
  onRestart: () => void;
}) {
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correctIndex).length;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl">
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
          ตรวจคำตอบ: <span className="text-emerald-600 font-semibold">เขียว = ตอบถูก</span>{" "}
          <span className="text-rose-600 font-semibold">แดง = คำตอบที่คุณเลือก (ผิด)</span>{" "}
          <span className="text-amber-600 font-semibold">เหลือง = คำตอบที่ถูกต้อง (ไม่ได้เลือกไว้)</span>
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
