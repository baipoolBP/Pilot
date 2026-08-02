import { ShapeKind } from "@/lib/cancellationTest";

const PATHS: Record<Exclude<ShapeKind, "circle">, string> = {
  square: "M4 4 H20 V20 H4 Z",
  "triangle-up": "M12 3 L21 20 L3 20 Z",
  "triangle-down": "M12 21 L3 4 L21 4 Z",
  diamond: "M12 2 L22 12 L12 22 L2 12 Z",
  pentagon: "M12 2 L22 9.6 L18.1 21 L5.9 21 L2 9.6 Z",
};

export default function ShapeIcon({
  kind,
  filled,
  className,
}: {
  kind: ShapeKind;
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinejoin="round"
    >
      {kind === "circle" ? <circle cx="12" cy="12" r="9" /> : <path d={PATHS[kind]} />}
    </svg>
  );
}
