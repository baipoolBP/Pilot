import { ShapeKind } from "@/lib/cancellationTest";

const PATHS: Record<Exclude<ShapeKind, "circle" | "digit">, string> = {
  square: "M4 4 H20 V20 H4 Z",
  "triangle-up": "M12 3 L21 20 L3 20 Z",
  "triangle-down": "M12 21 L3 4 L21 4 Z",
  diamond: "M12 2 L22 12 L12 22 L2 12 Z",
  pentagon: "M12 2 L22 9.6 L18.1 21 L5.9 21 L2 9.6 Z",
  star: "M12 2 L14.35 8.76 L21.51 8.91 L15.8 13.24 L17.88 20.09 L12 16 L6.12 20.09 L8.2 13.24 L2.49 8.91 L9.65 8.76 Z",
};

export default function ShapeIcon({
  kind,
  filled,
  color,
  digit,
  className,
}: {
  kind: ShapeKind;
  filled: boolean;
  /** Explicit hex color for the color-based test variants. Omit to inherit currentColor. */
  color?: string;
  /** Only used when kind === "digit" — the number to render as text. */
  digit?: number;
  className?: string;
}) {
  if (kind === "digit") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <text
          x="12"
          y="13"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="17"
          fontWeight="700"
          fill={color ?? "currentColor"}
        >
          {digit}
        </text>
      </svg>
    );
  }

  const fill = color ?? (filled ? "currentColor" : "none");

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke={color ?? "currentColor"}
      strokeWidth={fill === "none" ? 2 : 0}
      strokeLinejoin="round"
    >
      {kind === "circle" ? <circle cx="12" cy="12" r="9" /> : <path d={PATHS[kind]} />}
    </svg>
  );
}
