import { Point, Polygon, boundingBox } from "@/lib/polygon";

export interface SeamPattern {
  center: Point;
  cutPoints: Point[];
}

// Normalizes any polygon (whole shape or a single cut piece, at whatever
// scale/position/rotation it was generated at) to fit centered in its own
// square viewBox — each shape or fragment renders as an independent icon.
// Pass `seam` to additionally draw lines from its center to each cut point,
// using the same transform so they align with the outline (used by the
// "match-seam" mode, where the dissection pattern itself is the thing being
// compared, not just the outer shape).
export default function PolygonIcon({
  points,
  seam,
  className,
}: {
  points: Polygon;
  seam?: SeamPattern;
  className?: string;
}) {
  const bbox = boundingBox(points);
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;
  const scale = 42 / Math.max(w, h, 1);

  const project = ([x, y]: Point): Point => [(x - cx) * scale, (y - cy) * scale];

  const d =
    points
      .map((p, i) => {
        const [nx, ny] = project(p);
        return `${i === 0 ? "M" : "L"}${nx.toFixed(2)},${ny.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <svg viewBox="-25 -25 50 50" className={className}>
      <path d={d} fill="white" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
      {seam &&
        seam.cutPoints.map((cp, i) => {
          const [cx0, cy0] = project(seam.center);
          const [x1, y1] = project(cp);
          return (
            <line
              key={i}
              x1={cx0}
              y1={cy0}
              x2={x1}
              y2={y1}
              stroke="currentColor"
              strokeWidth={1.3}
              strokeDasharray="2.5,1.8"
            />
          );
        })}
    </svg>
  );
}
