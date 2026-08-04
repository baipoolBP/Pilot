import { Polygon, boundingBox } from "@/lib/polygon";

// Normalizes any polygon (whole shape or a single cut piece, at whatever
// scale/position/rotation it was generated at) to fit centered in its own
// square viewBox — each shape or fragment renders as an independent icon.
export default function PolygonIcon({ points, className }: { points: Polygon; className?: string }) {
  const bbox = boundingBox(points);
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;
  const scale = 42 / Math.max(w, h, 1);

  const d =
    points
      .map(([x, y], i) => {
        const nx = (x - cx) * scale;
        const ny = (y - cy) * scale;
        return `${i === 0 ? "M" : "L"}${nx.toFixed(2)},${ny.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <svg viewBox="-25 -25 50 50" className={className}>
      <path d={d} fill="white" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}
