import { Relation } from "@/lib/inequalityTest";

// Bold, rounded-stroke icons for the 6 relation symbols, matching the
// reference style: negated relations (≠, ≥, ≤) are drawn as their positive
// counterpart (=, <, >) with a diagonal slash through it, e.g. ≥ ("ไม่น้อยกว่า"
// / not less than) is a slashed "<".
const PATHS: Record<Relation, string[]> = {
  "<": ["M17 5 L8 12 L17 19"],
  ">": ["M7 5 L16 12 L7 19"],
  "=": ["M5 9 L19 9", "M5 15 L19 15"],
  "≠": ["M5 9 L19 9", "M5 15 L19 15", "M6 20 L18 4"],
  "≥": ["M17 5 L8 12 L17 19", "M6 20 L18 4"],
  "≤": ["M7 5 L16 12 L7 19", "M6 20 L18 4"],
};

export default function RelationIcon({ symbol, className }: { symbol: Relation; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[symbol].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
