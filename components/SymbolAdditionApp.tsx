"use client";

import { useEffect, useRef, useState } from "react";
import {
  generateLegend,
  generateRound,
  checkAnswer,
  LegendEntry,
  SymbolRound,
  TOTAL_ROUNDS,
  ROUND_TIME,
  ROUND_LENGTH,
} from "@/lib/symbolTest";

type Phase = "start" | "countdown" | "answer" | "result";

interface RoundRecord {
  round: SymbolRound;
  answer: string;
  correct: boolean;
  matchedCount: number | null;
}

export default function SymbolAdditionApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [legend, setLegend] = useState<LegendEntry[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState<SymbolRound | null>(null);
  const [records, setRecords] = useState<RoundRecord[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  const inputRef = useRef<HTMLInputElement>(null);

  function startTest() {
    const newLegend = generateLegend();
    setLegend(newLegend);
    setRecords([]);
    setRoundIndex(0);
    setCurrentRound(generateRound(newLegend));
    setInput("");
    setPhase("countdown");
  }

  // Countdown timer for the current round
  useEffect(() => {
    if (phase !== "countdown") return;
    const deadline = Date.now() + ROUND_TIME * 1000;
    setTimeLeft(ROUND_TIME);

    const interval = setInterval(() => {
      const remain = Math.max(0, (deadline - Date.now()) / 1000);
      setTimeLeft(remain);
      if (remain <= 0) {
        clearInterval(interval);
        setPhase("answer");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [roundIndex, phase]);

  useEffect(() => {
    if (phase === "answer") {
      inputRef.current?.focus();
    }
  }, [phase]);

  function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentRound) return;
    const trimmed = input.trim();
    const parsed = trimmed === "" ? null : parseInt(trimmed, 10);
    const { correct, matchedCount } =
      parsed !== null ? checkAnswer(currentRound, parsed) : { correct: false, matchedCount: null };

    setRecords((prev) => [...prev, { round: currentRound, answer: trimmed, correct, matchedCount }]);
    setInput("");

    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      setPhase("result");
    } else {
      setCurrentRound(generateRound(legend));
      setRoundIndex((i) => i + 1);
      setPhase("countdown");
    }
  }

  if (phase === "start") {
    return <StartScreen onStart={startTest} />;
  }

  if (phase === "result") {
    return <ResultScreen legend={legend} records={records} onRestart={startTest} />;
  }

  if (!currentRound) return null;

  const halfLength = Math.ceil(currentRound.symbols.length / 2);
  const pct = (timeLeft / ROUND_TIME) * 100;
  const timerColor =
    timeLeft <= 8 ? "bg-red-500" : timeLeft <= 15 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3 text-sm text-slate-300">
          <span>
            รอบที่ <span className="font-bold text-white">{roundIndex + 1}</span> / {TOTAL_ROUNDS}
          </span>
          <span className="uppercase tracking-wide text-xs bg-slate-700/60 px-2 py-1 rounded">
            บวกเลขสัญลักษณ์
          </span>
        </div>

        {/* legend, visible for the whole test */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 mb-4 shadow-xl">
          <p className="text-xs text-slate-400 mb-2">
            ตารางสัญลักษณ์แทนตัวเลข (จำไว้ให้แม่น จะใช้ตลอดการทดสอบ)
          </p>
          <div className="grid grid-cols-10 gap-2">
            {legend.map((e) => (
              <div
                key={e.symbol}
                className="aspect-square flex items-center justify-center text-xl sm:text-2xl bg-slate-900/60 rounded-lg"
              >
                {e.symbol}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-2 mt-1">
            {legend.map((e) => (
              <div key={e.symbol} className="text-center text-sm text-sky-400 font-semibold">
                {e.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl">
          {phase === "countdown" ? (
            <>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${timerColor} transition-[width] duration-100 ease-linear`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-sm text-slate-400 mb-4">
                เหลือเวลา {timeLeft.toFixed(1)} วินาที — บวกสะสมในใจจากสัญลักษณ์แรกสุดไปเรื่อยๆ
              </p>
            </>
          ) : (
            <p className="text-center text-sm font-semibold text-amber-400 mb-4">
              ⏰ หมดเวลาแล้ว! กรอกผลรวมที่บวกได้จากสัญลักษณ์แรกสุดจนถึงตัวที่คุณบวกถึง
            </p>
          )}

          <div className="rounded-xl bg-slate-900/50 border border-slate-700 p-2 space-y-1">
            {[0, halfLength].map((start) => (
              <div
                key={start}
                className="grid grid-cols-8 sm:grid-cols-[repeat(16,minmax(0,1fr))] gap-1"
              >
                {currentRound.symbols.slice(start, start + halfLength).map((s, i) => (
                  <div key={start + i} className="text-lg sm:text-2xl font-bold text-center py-2">
                    {s}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {phase === "answer" && (
            <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-3 mt-5">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="พิมพ์ผลบวกสะสม..."
                className="w-full text-center text-2xl font-semibold bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-semibold"
              >
                {roundIndex + 1 >= TOTAL_ROUNDS ? "ส่งคำตอบและดูสรุปผล" : "ส่งคำตอบ (Enter) → รอบถัดไป"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          ทั้งหมด {ROUND_LENGTH} สัญลักษณ์ต่อรอบ — ไม่จำเป็นต้องบวกครบทุกตัว ใส่เท่าที่บวกได้ในเวลา
        </p>
      </div>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">บวกเลขสัญลักษณ์</h1>
        <p className="text-slate-300 mb-6">ฝึกความเร็วในการบวกเลขสะสม เตรียมสอบนักบิน กองทัพเรือ</p>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li>
            • ระบบจะสุ่ม <b className="text-white">สัญลักษณ์ 10 ตัว</b> แทนตัวเลข 0-20 ให้จำไว้ —
            ตารางนี้จะอยู่ให้ดูตลอดการทดสอบ
          </li>
          <li>
            • แต่ละรอบจะมีสัญลักษณ์เรียงกันแนวตั้ง <b className="text-white">{ROUND_LENGTH} ตัว</b> ให้บวกค่าสะสมในใจ
            ไปเรื่อยๆ จากตัวบนสุด
          </li>
          <li>
            • จับเวลา <b className="text-white">{ROUND_TIME} วินาที</b>/รอบ พอหมดเวลาให้พิมพ์ผลบวกสะสมที่ทำได้ถึง ณ
            ตำแหน่งที่บวกถึง (ไม่ต้องบวกครบทุกตัวก็ได้)
          </li>
          <li>
            • ทำทั้งหมด <b className="text-white">{TOTAL_ROUNDS} รอบ</b> แล้วระบบจะตรวจให้ว่าคำตอบตรงกับผลบวกสะสม ณ
            ตำแหน่งใดหรือไม่
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
  legend,
  records,
  onRestart,
}: {
  legend: LegendEntry[];
  records: RoundRecord[];
  onRestart: () => void;
}) {
  const score = records.filter((r) => r.correct).length;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-300 mb-1">สรุปผลการทดสอบ</h2>
          <p className="text-5xl font-extrabold my-3">
            {score} <span className="text-2xl text-slate-400">/ {records.length}</span>
          </p>
          <p className="text-slate-300 mb-6">
            ความแม่นยำ {records.length ? ((score / records.length) * 100).toFixed(1) : 0}%
          </p>

          <button
            onClick={onRestart}
            className="w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-bold"
          >
            ทำแบบทดสอบใหม่ (สัญลักษณ์และโจทย์ชุดใหม่)
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {records.map((r, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 shadow-xl ${
                r.correct ? "bg-emerald-950/20 border-emerald-800/50" : "bg-rose-950/20 border-rose-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="font-semibold">รอบที่ {i + 1}</span>
                <span>{r.correct ? "✅ ถูกต้อง" : "❌ ไม่ถูกต้อง"}</span>
              </div>
              <div className="text-sm text-slate-300 mb-3 space-y-1">
                <p>
                  คำตอบของคุณ:{" "}
                  <span className="font-semibold text-white">{r.answer === "" ? "(ไม่ได้ตอบ)" : r.answer}</span>
                </p>
                {r.correct && r.matchedCount !== null && (
                  <p>
                    บวกถูกต้องถึงสัญลักษณ์ที่{" "}
                    <span className="font-semibold text-white">
                      {r.matchedCount} / {r.round.symbols.length}
                    </span>
                  </p>
                )}
                <p>
                  ผลรวมทั้งหมด {r.round.symbols.length} สัญลักษณ์ (ถ้าบวกครบ):{" "}
                  <span className="font-semibold text-white">
                    {r.round.prefixSums[r.round.prefixSums.length - 1]}
                  </span>
                </p>
              </div>

              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer text-sky-400 mb-2">ดูลำดับสัญลักษณ์และผลบวกสะสม</summary>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                  {r.round.symbols.map((s, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-2 text-center ${
                        r.matchedCount === idx + 1 ? "bg-sky-600/40 ring-1 ring-sky-400" : "bg-slate-900/50"
                      }`}
                    >
                      <div className="text-lg">{s}</div>
                      <div className="text-slate-500">={r.round.values[idx]}</div>
                      <div className="font-semibold text-slate-200">Σ{r.round.prefixSums[idx]}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 mt-6 text-xs text-slate-400">
          <p className="mb-2 font-semibold text-slate-300">ตารางสัญลักษณ์ที่ใช้ในการทดสอบนี้</p>
          <div className="flex flex-wrap gap-3">
            {legend.map((e) => (
              <span key={e.symbol} className="bg-slate-900/50 px-2 py-1 rounded">
                {e.symbol} = {e.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
