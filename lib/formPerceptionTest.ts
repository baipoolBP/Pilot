// Abstract line-figure "which one matches" perception test — reminiscent of the
// classic paper-based form-perception (Wonderlic-style) subtest, not a literal
// trace of any particular source. Each symbol is a stroke-only SVG glyph.

export interface LineSymbol {
  id: string;
  paths: string[];
  circle?: { cx: number; cy: number; r: number };
}

export const SYMBOL_POOL: LineSymbol[] = [
  { id: "chevron-right", paths: ["M8 5 L16 12 L8 19"] },
  { id: "chevron-left", paths: ["M16 5 L8 12 L16 19"] },
  { id: "chevron-up", paths: ["M5 15 L12 8 L19 15"] },
  { id: "chevron-down", paths: ["M5 9 L12 16 L19 9"] },
  { id: "wave", paths: ["M3 12 C 6 6, 9 18, 12 12 C 15 6, 18 18, 21 12"] },
  { id: "hook", paths: ["M4 6 C 4 14, 12 20, 20 14"] },
  { id: "circle-plus", paths: ["M12 4 L12 20", "M4 12 L20 12"], circle: { cx: 12, cy: 12, r: 8 } },
  { id: "circle-x", paths: ["M6.3 6.3 L17.7 17.7", "M17.7 6.3 L6.3 17.7"], circle: { cx: 12, cy: 12, r: 8 } },
  { id: "circle-dash", paths: ["M7 12 L17 12"], circle: { cx: 12, cy: 12, r: 8 } },
  { id: "circle-only", paths: [], circle: { cx: 12, cy: 12, r: 7 } },
  { id: "bracket-l", paths: ["M8 4 L8 20", "M8 20 L18 20"] },
  { id: "bracket-gamma", paths: ["M6 4 L18 4", "M6 4 L6 20"] },
  { id: "bracket-f", paths: ["M6 4 L6 20", "M6 4 L16 4", "M6 12 L14 12"] },
  { id: "double-chevron-right", paths: ["M6 5 L12 12 L6 19", "M12 5 L18 12 L12 19"] },
  { id: "double-chevron-left", paths: ["M18 5 L12 12 L18 19", "M12 5 L6 12 L12 19"] },
  { id: "arrow-right", paths: ["M4 9 L16 9", "M4 15 L16 15", "M12 4 L20 12 L12 20"] },
  { id: "arrow-left", paths: ["M20 9 L8 9", "M20 15 L8 15", "M12 4 L4 12 L12 20"] },
  { id: "lens", paths: ["M4 12 Q 12 2 20 12 Q 12 22 4 12"] },
  { id: "asterisk", paths: ["M12 3 L12 21", "M4.4 7.5 L19.6 16.5", "M19.6 7.5 L4.4 16.5"] },
  { id: "horseshoe-u", paths: ["M6 6 L6 16 A6 6 0 0 0 18 16 L18 6"] },
  { id: "horseshoe-n", paths: ["M6 18 L6 8 A6 6 0 0 1 18 8 L18 18"] },
  { id: "crescent", paths: ["M16 5 A8 8 0 1 0 16 19"] },
  { id: "cross", paths: ["M12 4 L12 20", "M4 12 L20 12"] },
  { id: "zigzag", paths: ["M4 6 L9 18 L14 6 L19 18"] },
  { id: "hash", paths: ["M8 4 L8 20", "M16 4 L16 20", "M4 9 L20 9", "M4 16 L20 16"] },
];

export interface FormQuestion {
  keys: [LineSymbol, LineSymbol];
  candidates: LineSymbol[];
  // indices (0-4) into `candidates` that match one of the two keys — 0, 1, or 2 of them
  correctIndices: number[];
}

export const TOTAL_QUESTIONS = 60;
export const ROWS_PER_PAGE = 10;
export const PAGE_COUNT = TOTAL_QUESTIONS / ROWS_PER_PAGE;
export const TOTAL_TIME = 120; // seconds, shared across all pages

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickRandom(n: number, excludeIds: Set<string>): LineSymbol[] {
  return shuffle(SYMBOL_POOL.filter((s) => !excludeIds.has(s.id))).slice(0, n);
}

export function generateQuestion(): FormQuestion {
  const [key1, key2] = pickRandom(2, new Set());
  const matchCount = Math.floor(Math.random() * 3); // 0, 1, or 2

  const matches: LineSymbol[] =
    matchCount === 2 ? [key1, key2] : matchCount === 1 ? [Math.random() < 0.5 ? key1 : key2] : [];

  const distractors = pickRandom(5 - matches.length, new Set([key1.id, key2.id]));
  const candidates = shuffle([...matches, ...distractors]);

  const correctIndices = candidates
    .map((c, i) => (c.id === key1.id || c.id === key2.id ? i : -1))
    .filter((i) => i >= 0);

  return { keys: [key1, key2], candidates, correctIndices };
}

export function generateForm(): FormQuestion[] {
  return Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion());
}

export interface FormAnswer {
  selected: Set<number>;
  no: boolean;
}

export function isRowCorrect(q: FormQuestion, answer: FormAnswer | undefined): boolean {
  const selected = answer?.selected ?? new Set<number>();
  const no = answer?.no ?? false;

  if (q.correctIndices.length === 0) {
    return no && selected.size === 0;
  }
  if (no || selected.size !== q.correctIndices.length) return false;
  return q.correctIndices.every((i) => selected.has(i));
}
