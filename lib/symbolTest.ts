export interface LegendEntry {
  symbol: string;
  value: number;
}

export interface SymbolRound {
  symbols: string[];
  values: number[];
  prefixSums: number[];
}

export interface AnswerCheck {
  correct: boolean;
  matchedCount: number | null;
}

const SYMBOL_POOL = [
  "★", "●", "▲", "■", "◆", "♣", "♠", "♥", "✚", "☀",
  "☁", "⚡", "✈", "❄", "☂", "⌘", "⚓", "✎", "⬟", "☯",
  "☘", "⚑", "♪", "☎", "☕", "✂", "☮", "⌛", "☔", "⚐",
];

export const LEGEND_SIZE = 10;
export const VALUE_MIN = 0;
export const VALUE_MAX = 20;
export const ROUND_LENGTH = 32;
export const TOTAL_ROUNDS = 5;
export const ROUND_TIME = 30; // seconds

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateLegend(): LegendEntry[] {
  const symbols = shuffle(SYMBOL_POOL).slice(0, LEGEND_SIZE);
  const values = shuffle(
    Array.from({ length: VALUE_MAX - VALUE_MIN + 1 }, (_, i) => i + VALUE_MIN)
  ).slice(0, LEGEND_SIZE);
  return symbols.map((symbol, i) => ({ symbol, value: values[i] }));
}

export function generateRound(legend: LegendEntry[], length: number = ROUND_LENGTH): SymbolRound {
  const symbols: string[] = [];
  const values: number[] = [];
  const prefixSums: number[] = [];
  let running = 0;

  for (let i = 0; i < length; i++) {
    const entry = legend[Math.floor(Math.random() * legend.length)];
    symbols.push(entry.symbol);
    values.push(entry.value);
    running += entry.value;
    prefixSums.push(running);
  }

  return { symbols, values, prefixSums };
}

// The tester reports the cumulative sum they reached mentally within the time
// limit, so we can't know which symbol they stopped at directly. We accept the
// answer if it matches the running total at any position, and report the
// furthest matching position as their reading speed.
export function checkAnswer(round: SymbolRound, answer: number): AnswerCheck {
  let matchedCount: number | null = null;
  for (let i = 0; i < round.prefixSums.length; i++) {
    if (round.prefixSums[i] === answer) {
      matchedCount = i + 1;
    }
  }
  return { correct: matchedCount !== null, matchedCount };
}
