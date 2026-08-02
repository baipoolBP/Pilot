export type ShapeKind = "square" | "triangle-up" | "triangle-down" | "circle" | "diamond" | "pentagon";

export interface Shape {
  id: string;
  kind: ShapeKind;
  filled: boolean;
}

export interface Cell {
  shape: Shape;
  isTarget: boolean;
}

export const ROWS = 20;
export const SYMBOLS_PER_ROW = 16;
export const TOTAL_TIME = 120; // seconds

const KINDS: ShapeKind[] = ["square", "triangle-up", "triangle-down", "circle", "diamond", "pentagon"];

const SHAPES: Shape[] = KINDS.flatMap((kind) => [
  { id: `${kind}-filled`, kind, filled: true },
  { id: `${kind}-outline`, kind, filled: false },
]);

const TARGET_IDS = ["square-filled", "triangle-up-outline"];

export const TARGET_SHAPES = SHAPES.filter((s) => TARGET_IDS.includes(s.id));

export function generateGrid(rows: number = ROWS, cols: number = SYMBOLS_PER_ROW): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      row.push({ shape, isTarget: TARGET_IDS.includes(shape.id) });
    }
    grid.push(row);
  }
  return grid;
}

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
