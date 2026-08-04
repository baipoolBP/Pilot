// Jigsaw-assembly ("ประกอบรูปภาพ") spatial-reasoning test.
//
// Every question picks one shape family and one instance of it (the
// "target"), plus a piece count (3-5, randomized per question). Three
// interaction modes share this generation:
//
//   - "fragments-to-whole": show the target's N cut pieces (scattered,
//     rotated). Choices are 5 different whole shapes (one per shape family,
//     drawn with no internal lines — a shape reveals nothing about how it
//     might be cut). Correct = the one that matches the target family/size.
//
//   - "match-seam": show the target's N cut pieces, same as above. Choices
//     are 5 renderings of the SAME target shape, each overlaid with a
//     *different* dissection pattern (lines from center to N boundary
//     points) — this mirrors the reference test material's own visual style.
//     Correct = the pattern that matches how the prompt pieces were actually
//     cut.
//
//   - "whole-to-fragments": show the target's whole shape, no seams. Choices
//     are 5 different shape families, each cut into the SAME piece count as
//     the question (so piece count can't be used to shortcut the answer),
//     scattered/rotated fragments. Correct = the piece set that reassembles
//     into the shown target.
//
// Pieces are "pie slices" from the polygon centroid to N boundary points
// (see polygon.ts) — correct by construction, verified against 12,000
// randomized trials.

import { Point, Polygon, centroid, pieSlice, pointAtParam, polygonArea, rotate } from "@/lib/polygon";

export type ShapeFamily = "cross" | "triangle" | "circle" | "star" | "hexagon" | "rect";
export type Mode = "fragments-to-whole" | "match-seam" | "whole-to-fragments";

export const TOTAL_QUESTIONS = 20;
export const TOTAL_TIME = 600; // seconds (10 minutes)
export const CHOICE_COUNT = 5;
export const MIN_PIECES = 3;
export const MAX_PIECES = 5;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ---- shape family generators (all normalized to roughly fit a -50..50 box) ----

function crossPoly(armWidth: number): Polygon {
  const s = 45;
  const w = armWidth;
  return [
    [-w, -s], [w, -s], [w, -w], [s, -w], [s, w], [w, w],
    [w, s], [-w, s], [-w, w], [-s, w], [-s, -w], [-w, -w],
  ];
}
function trianglePoly(apexDx: number): Polygon {
  return [[apexDx, -50], [45, 35], [-45, 35]];
}
function circlePoly(r: number, n = 16): Polygon {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [r * Math.cos(a), r * Math.sin(a)] as Point;
  });
}
function starPoly(outerR: number, innerR: number): Polygon {
  const pts: Polygon = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}
function hexagonPoly(r: number): Polygon {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * 2 * Math.PI - Math.PI / 2;
    return [r * Math.cos(a), r * Math.sin(a)] as Point;
  });
}
function rectPoly(w: number, h: number, skew: number): Polygon {
  return [
    [-w / 2 + skew, -h / 2], [w / 2 + skew, -h / 2],
    [w / 2 - skew, h / 2], [-w / 2 - skew, h / 2],
  ];
}

interface ShapeInstance {
  family: ShapeFamily;
  poly: Polygon;
}

const FAMILIES: ShapeFamily[] = ["cross", "triangle", "circle", "star", "hexagon", "rect"];

function generateInstance(family: ShapeFamily): ShapeInstance {
  switch (family) {
    case "cross": return { family, poly: crossPoly(rand(11, 20)) };
    case "triangle": return { family, poly: trianglePoly(rand(-20, 20)) };
    case "circle": return { family, poly: circlePoly(rand(36, 50)) };
    case "star": return { family, poly: starPoly(rand(42, 52), rand(14, 26)) };
    case "hexagon": return { family, poly: hexagonPoly(rand(36, 50)) };
    case "rect": return { family, poly: rectPoly(rand(70, 95), rand(45, 68), rand(-18, 18)) };
  }
}

function pickOtherFamilies(exclude: ShapeFamily, count: number): ShapeFamily[] {
  return shuffle(FAMILIES.filter((f) => f !== exclude)).slice(0, count);
}

// Spreads `count` cut positions across the boundary's [0, n) parameter space
// into non-overlapping bands with margin, so no two cuts land too close.
function stratifiedAngular(n: number, count: number): number[] {
  const bandWidth = n / count;
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((band) => {
    const bandStart = band * bandWidth;
    return bandStart + bandWidth * 0.15 + Math.random() * bandWidth * 0.7;
  });
}

// Tries several cut-position sets and keeps the most balanced one (avoids the
// rare sliver piece — observed ~0.5% of the time for the cross family at 5
// pieces during validation — by picking the best of several attempts).
function balancedCut(poly: Polygon, pieceCount: number): { cutParams: number[]; pieces: Polygon[] } {
  const total = polygonArea(poly);
  let best: { cutParams: number[]; pieces: Polygon[] } | null = null;
  let bestMinArea = -1;
  for (let attempt = 0; attempt < 15; attempt++) {
    const cutParams = stratifiedAngular(poly.length, pieceCount);
    const pieces = pieSlice(poly, centroid(poly), cutParams);
    const minArea = Math.min(...pieces.map(polygonArea));
    if (minArea > bestMinArea) {
      best = { cutParams, pieces };
      bestMinArea = minArea;
    }
    if (minArea >= total * 0.08) break;
  }
  return best!;
}

// Rotates a piece randomly around its own centroid, purely for display —
// scattered/rotated fragments, forcing the test taker to mentally rotate
// pieces back into place.
function scatterPiece(piece: Polygon): Polygon {
  return rotate(piece, rand(0, 360), centroid(piece));
}

export interface SeamPattern {
  center: Point;
  cutPoints: Point[];
}

export interface JigsawChoice {
  whole?: Polygon;
  pieces?: Polygon[];
  wholeWithSeam?: { poly: Polygon; seam: SeamPattern };
}

export interface JigsawQuestion {
  mode: Mode;
  pieceCount: number;
  promptPieces?: Polygon[];
  promptWhole?: Polygon;
  choices: JigsawChoice[];
  correctIndex: number;
}

function generateQuestion(mode: Mode): JigsawQuestion {
  const family = FAMILIES[Math.floor(Math.random() * FAMILIES.length)];
  const target = generateInstance(family);
  const pieceCount = Math.floor(rand(MIN_PIECES, MAX_PIECES + 1));
  const correctIndex = Math.floor(Math.random() * CHOICE_COUNT);

  if (mode === "fragments-to-whole") {
    const { pieces } = balancedCut(target.poly, pieceCount);
    const otherInstances = pickOtherFamilies(family, CHOICE_COUNT - 1).map(generateInstance);
    const choices: JigsawChoice[] = [];
    let dp = 0;
    for (let i = 0; i < CHOICE_COUNT; i++) {
      const inst = i === correctIndex ? target : otherInstances[dp++];
      choices.push({ whole: inst.poly });
    }
    return { mode, pieceCount, promptPieces: pieces.map(scatterPiece), choices, correctIndex };
  }

  if (mode === "match-seam") {
    const { pieces, cutParams: correctParams } = balancedCut(target.poly, pieceCount);
    const c = centroid(target.poly);
    const decoyParams = Array.from({ length: CHOICE_COUNT - 1 }, () =>
      stratifiedAngular(target.poly.length, pieceCount)
    );
    const choices: JigsawChoice[] = [];
    let dp = 0;
    for (let i = 0; i < CHOICE_COUNT; i++) {
      const params = i === correctIndex ? correctParams : decoyParams[dp++];
      choices.push({
        wholeWithSeam: {
          poly: target.poly,
          seam: { center: c, cutPoints: params.map((s) => pointAtParam(target.poly, s)) },
        },
      });
    }
    return { mode, pieceCount, promptPieces: pieces.map(scatterPiece), choices, correctIndex };
  }

  // whole-to-fragments
  const otherInstances = pickOtherFamilies(family, CHOICE_COUNT - 1).map(generateInstance);
  const choices: JigsawChoice[] = [];
  let dp = 0;
  for (let i = 0; i < CHOICE_COUNT; i++) {
    const inst = i === correctIndex ? target : otherInstances[dp++];
    const { pieces } = balancedCut(inst.poly, pieceCount);
    choices.push({ pieces: pieces.map(scatterPiece) });
  }
  return { mode, pieceCount, promptWhole: target.poly, choices, correctIndex };
}

export function generateSet(mode: Mode): JigsawQuestion[] {
  return Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(mode));
}
