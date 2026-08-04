// Minimal 2D polygon utilities used by the jigsaw-assembly test. All shapes
// are simple closed polygons; cuts are made by connecting two existing
// vertices (or, for triangles, a vertex to a point on the opposite edge),
// so a split is correct by construction — no float-precision line-clipping
// that could leave a gap or overlap between pieces.

export type Point = [number, number];
export type Polygon = Point[];

export function polygonArea(poly: Polygon): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

export function centroid(poly: Polygon): Point {
  let cx = 0;
  let cy = 0;
  for (const [x, y] of poly) {
    cx += x;
    cy += y;
  }
  return [cx / poly.length, cy / poly.length];
}

export function rotate(poly: Polygon, angleDeg: number, origin: Point): Polygon {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const [ox, oy] = origin;
  return poly.map(([x, y]) => {
    const dx = x - ox;
    const dy = y - oy;
    return [ox + dx * cos - dy * sin, oy + dx * sin + dy * cos] as Point;
  });
}

export function boundingBox(poly: Polygon) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

// Splits a polygon into two pieces along the diagonal connecting vertex i to
// vertex j. Valid (interior, reasonably balanced) index pairs are precomputed
// per shape family in jigsawTest.ts.
export function splitAtVertices(poly: Polygon, i: number, j: number): [Polygon, Polygon] {
  const n = poly.length;
  const pieceA: Polygon = [];
  for (let k = i; k !== j; k = (k + 1) % n) pieceA.push(poly[k]);
  pieceA.push(poly[j]);
  const pieceB: Polygon = [];
  for (let k = j; k !== i; k = (k + 1) % n) pieceB.push(poly[k]);
  pieceB.push(poly[i]);
  return [pieceA, pieceB];
}

// Splits a triangle via a cevian from vertex `vertexIndex` to a point at
// parameter t (0-1) along the opposite edge — always valid for a convex
// triangle.
export function splitTriangle(poly: Polygon, vertexIndex: number, t: number): [Polygon, Polygon] {
  const other1 = (vertexIndex + 1) % 3;
  const other2 = (vertexIndex + 2) % 3;
  const p1 = poly[other1];
  const p2 = poly[other2];
  const cutPoint: Point = [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
  const pieceA: Polygon = [poly[vertexIndex], p1, cutPoint];
  const pieceB: Polygon = [poly[vertexIndex], cutPoint, p2];
  return [pieceA, pieceB];
}
