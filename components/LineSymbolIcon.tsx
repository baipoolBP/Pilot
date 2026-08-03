import { LineSymbol } from "@/lib/formPerceptionTest";

export default function LineSymbolIcon({ symbol, className }: { symbol: LineSymbol; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {symbol.circle && <circle cx={symbol.circle.cx} cy={symbol.circle.cy} r={symbol.circle.r} />}
      {symbol.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
