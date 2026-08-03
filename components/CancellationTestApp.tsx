"use client";

import { useEffect, useState } from "react";
import { generateGrid, gradeGrid, ROWS, TOTAL_TIME, Cell, Shape } from "@/lib/cancellationTest";
import ShapeIcon from "@/components/ShapeIcon";

type Phase = "start" | "running" | "result";

export interface CancellationConfig {
  title: string;
  subtitle: string;
  shapePool: Shape[];
  targetIds: string[];
}

export default function CancellationTestApp({ config }: { config: CancellationConfig }) {
  const targetShapes = config.shapePool.filter((s) => config.targetIds.includes(s.id));

  const [phase, setPhase] = useState<Phase>("start");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  function startTest() {
    setGrid(generateGrid(config.shapePool, config.targetIds));
    setMarked(new Set());
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

  function toggleMark(r: number, c: number) {
    if (phase !== "running") return;
    const key = `${r}-${c}`;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (phase === "start") {
    return <StartScreen config={config} targetShapes={targetShapes} onStart={startTest} />;
  }

  if (phase === "result") {
    return <ResultScreen grid={grid} marked={marked} onRestart={startTest} />;
  }

  const pct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor =
    timeLeft <= 20 ? "bg-red-500" : timeLeft <= 45 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-2 text-sm text-slate-300">
          <span>{config.title} — {ROWS} แถว</span>
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
            <p className="text-sm text-slate-700 flex items-center whitespace-nowrap">
              ติ๊กเฉพาะสัญลักษณ์นี้:
              {targetShapes.map((s) => (
                <ShapeIcon key={s.id} kind={s.kind} filled={s.filled} color={s.color} digit={s.digit} className="w-7 h-7 mx-1.5" />
              ))}
              เท่านั้น
            </p>
            <div className="flex-1 min-w-[160px]">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${timerColor} transition-[width] duration-100 ease-linear`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">
                เหลือเวลา {Math.ceil(timeLeft)} วินาที
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="flex flex-col gap-1 min-w-max">
            {grid.map((row, r) => (
              <div key={r} className="flex items-center gap-1">
                <span className="w-7 text-right text-xs text-slate-400 mr-1 shrink-0">{r + 1}.</span>
                {row.map((cell, c) => {
                  const key = `${r}-${c}`;
                  const isMarked = marked.has(key);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleMark(r, c)}
                      className={`relative w-9 h-9 shrink-0 flex items-center justify-center rounded transition-colors ${
                        isMarked ? "bg-indigo-100" : "hover:bg-slate-100"
                      }`}
                    >
                      <ShapeIcon
                        kind={cell.shape.kind}
                        filled={cell.shape.filled}
                        color={cell.shape.color}
                        digit={cell.shape.digit}
                        className="w-6 h-6"
                      />
                      {isMarked && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-full h-[2.5px] bg-indigo-600 rotate-45" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          คลิกสัญลักษณ์เพื่อติ๊ก/ยกเลิกติ๊ก — หมดเวลาหรือกดส่งคำตอบแล้วระบบจะตรวจให้ทันที
        </p>
      </div>
    </div>
  );
}

function StartScreen({
  config,
  targetShapes,
  onStart,
}: {
  config: CancellationConfig;
  targetShapes: Shape[];
  onStart: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{config.title}</h1>
        <p className="text-slate-300 mb-6">{config.subtitle}</p>

        <ul className="text-left text-sm text-slate-300 space-y-2 mb-8 bg-slate-900/50 rounded-xl p-5">
          <li className="flex items-center gap-2">
            <span>• ติ๊กเฉพาะสัญลักษณ์</span>
            {targetShapes.map((s) => (
              <ShapeIcon
                key={s.id}
                kind={s.kind}
                filled={s.filled}
                color={s.color}
                digit={s.digit}
                className={`w-5 h-5 ${s.color ? "" : "text-sky-300"}`}
              />
            ))}
            <span>เท่านั้น ที่ปรากฏอยู่ในตาราง</span>
          </li>
          <li>
            • มีทั้งหมด <b className="text-white">{ROWS} แถว</b> ตำแหน่งสัญลักษณ์จะสุ่มใหม่ทุกครั้งที่เริ่มทำ
          </li>
          <li>
            • จับเวลารวม <b className="text-white">{TOTAL_TIME} วินาที</b> ทำให้เร็วและแม่นที่สุด
          </li>
          <li>• เมื่อหมดเวลาหรือกด &quot;ส่งคำตอบ&quot; ระบบจะตรวจว่าติ๊กถูก ติ๊กผิด หรือพลาดไม่ได้ติ๊กข้อไหนบ้าง</li>
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
  grid,
  marked,
  onRestart,
}: {
  grid: Cell[][];
  marked: Set<string>;
  onRestart: () => void;
}) {
  const result = gradeGrid(grid, marked);
  const netScore = Math.max(0, result.hits - result.falsePositives);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl mb-6 text-center">
          <h2 className="text-xl font-semibold text-slate-300 mb-1">สรุปผลการทดสอบ</h2>
          <p className="text-5xl font-extrabold my-3">
            {result.hits} <span className="text-2xl text-slate-400">/ {result.totalTargets}</span>
          </p>
          <p className="text-slate-300 mb-4">
            ติ๊กถูก {result.totalTargets ? ((result.hits / result.totalTargets) * 100).toFixed(1) : 0}%
          </p>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
              <p className="text-emerald-400 font-semibold">ติ๊กถูก</p>
              <p className="text-2xl font-bold text-white">{result.hits}</p>
            </div>
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4">
              <p className="text-rose-400 font-semibold">ติ๊กผิด</p>
              <p className="text-2xl font-bold text-white">{result.falsePositives}</p>
            </div>
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
              <p className="text-amber-400 font-semibold">พลาด (ไม่ได้ติ๊ก)</p>
              <p className="text-2xl font-bold text-white">{result.misses}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">คะแนนสุทธิ (ติ๊กถูก − ติ๊กผิด): {netScore}</p>

          <button
            onClick={onRestart}
            className="mt-6 w-full bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl py-3 font-bold"
          >
            ทำแบบทดสอบใหม่ (ตำแหน่งสุ่มใหม่)
          </button>
        </div>

        <div className="bg-white text-slate-800 border border-slate-300 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <p className="text-xs text-slate-500 mb-3">
            ตรวจคำตอบ: <span className="text-emerald-600 font-semibold">เขียว = ติ๊กถูก</span>{" "}
            <span className="text-rose-600 font-semibold">แดง = ติ๊กผิด</span>{" "}
            <span className="text-amber-600 font-semibold">เหลือง = พลาดไม่ได้ติ๊ก</span>
          </p>
          <div className="flex flex-col gap-1 min-w-max">
            {grid.map((row, r) => (
              <div key={r} className="flex items-center gap-1">
                <span className="w-7 text-right text-xs text-slate-400 mr-1 shrink-0">{r + 1}.</span>
                {row.map((cell, c) => {
                  const key = `${r}-${c}`;
                  const isMarked = marked.has(key);
                  let cellBg = "";
                  let slashColor = "";
                  if (cell.isTarget && isMarked) {
                    cellBg = "bg-emerald-100";
                    slashColor = "bg-emerald-600";
                  } else if (cell.isTarget && !isMarked) {
                    cellBg = "bg-amber-100 ring-2 ring-amber-400";
                  } else if (!cell.isTarget && isMarked) {
                    cellBg = "bg-rose-100";
                    slashColor = "bg-rose-600";
                  }
                  return (
                    <span
                      key={c}
                      className={`relative w-9 h-9 shrink-0 flex items-center justify-center rounded ${cellBg}`}
                    >
                      <ShapeIcon
                        kind={cell.shape.kind}
                        filled={cell.shape.filled}
                        color={cell.shape.color}
                        digit={cell.shape.digit}
                        className="w-6 h-6"
                      />
                      {slashColor && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`w-full h-[2.5px] ${slashColor} rotate-45`} />
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
