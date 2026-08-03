export type ShapeKind =
  | "square"
  | "triangle-up"
  | "triangle-down"
  | "circle"
  | "diamond"
  | "pentagon"
  | "star"
  | "digit";

export interface Shape {
  id: string;
  kind: ShapeKind;
  filled: boolean;
  // Explicit color (hex) for the color-based variants. When omitted, ShapeIcon
  // falls back to currentColor so the monochrome panel controls the color.
  color?: string;
  // Only set when kind === "digit" — the number ShapeIcon renders as text.
  digit?: number;
}

export interface Cell {
  shape: Shape;
  isTarget: boolean;
}

export const ROWS = 20;
export const SYMBOLS_PER_ROW = 16;
export const TOTAL_TIME = 120; // seconds

export interface GradeResult {
  totalTargets: number;
  hits: number;
  misses: number;
  falsePositives: number;
  correctRejections: number;
}

export function gradeGrid(grid: Cell[][], marked: Set<string>): GradeResult {
  let totalTargets = 0;
  let hits = 0;
  let misses = 0;
  let falsePositives = 0;
  let correctRejections = 0;

  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      const isMarked = marked.has(`${r}-${c}`);
      if (cell.isTarget) {
        totalTargets++;
        if (isMarked) hits++;
        else misses++;
      } else if (isMarked) {
        falsePositives++;
      } else {
        correctRejections++;
      }
    });
  });

  return { totalTargets, hits, misses, falsePositives, correctRejections };
}

export function generateGrid(
  pool: Shape[],
  targetIds: string[],
  rows: number = ROWS,
  cols: number = SYMBOLS_PER_ROW
): Cell[][] {
  const targetSet = new Set(targetIds);
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      const shape = pool[Math.floor(Math.random() * pool.length)];
      row.push({ shape, isTarget: targetSet.has(shape.id) });
    }
    grid.push(row);
  }
  return grid;
}

// ---- Variant 1: monochrome, filled vs outline (■ filled square / △ outline triangle) ----

const MONO_KINDS: ShapeKind[] = ["square", "triangle-up", "triangle-down", "circle", "diamond", "pentagon"];

export const MONO_SHAPES: Shape[] = MONO_KINDS.flatMap((kind) => [
  { id: `${kind}-filled`, kind, filled: true },
  { id: `${kind}-outline`, kind, filled: false },
]);

export const MONO_TARGET_IDS = ["square-filled", "triangle-up-outline"];

// ---- Shared color palette for the color-based variants ----

const COLORS = {
  red: "#dc2626",
  yellow: "#eab308",
  orange: "#f97316",
  blue: "#0ea5e9",
};

function buildColorPool(kinds: ShapeKind[], colors: { name: string; hex: string }[]): Shape[] {
  return kinds.flatMap((kind) =>
    colors.map((c) => ({ id: `${kind}-${c.name}`, kind, filled: true, color: c.hex }))
  );
}

// ---- Variant 2: red square / yellow triangle ----

export const SQUARE_TRIANGLE_SHAPES: Shape[] = buildColorPool(
  ["square", "triangle-up", "triangle-down", "circle", "diamond"],
  [
    { name: "red", hex: COLORS.red },
    { name: "yellow", hex: COLORS.yellow },
  ]
);

export const SQUARE_TRIANGLE_TARGET_IDS = ["square-red", "triangle-up-yellow"];

// ---- Variant 3: orange star / blue circle ----

export const STAR_CIRCLE_SHAPES: Shape[] = buildColorPool(
  ["star", "circle", "square", "diamond", "pentagon"],
  [
    { name: "orange", hex: COLORS.orange },
    { name: "blue", hex: COLORS.blue },
  ]
);

export const STAR_CIRCLE_TARGET_IDS = ["star-orange", "circle-blue"];

// ---- Variant 4: find digit 6 among other single digits ----

export const DIGIT_SHAPES: Shape[] = Array.from({ length: 10 }, (_, d) => ({
  id: `digit-${d}`,
  kind: "digit" as ShapeKind,
  filled: true,
  digit: d,
}));

export const DIGIT_TARGET_IDS = ["digit-6"];
