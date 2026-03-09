import { useId } from "react";
import { cn } from "@/lib/utils";

interface StaticGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
}

export function StaticGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
}: StaticGridPatternProps) {
  const id = useId();

  // Deterministic positions based on index — no state, no randomness
  const squares = Array.from({ length: numSquares }, (_, i) => ({
    x: ((i * 7 + 3) % 25) * width + 1,
    y: ((i * 13 + 5) % 20) * height + 1,
  }));

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map((sq, i) => (
          <rect
            key={i}
            width={width - 1}
            height={height - 1}
            x={sq.x}
            y={sq.y}
            fill="currentColor"
            strokeWidth="0"
            opacity={maxOpacity}
          />
        ))}
      </svg>
    </svg>
  );
}
