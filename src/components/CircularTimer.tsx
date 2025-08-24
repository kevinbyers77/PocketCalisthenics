// src/components/CircularTimer.tsx
import React from "react";

type CircularTimerProps = {
  remaining: number;          // seconds remaining this segment
  total: number;              // total seconds for this segment
  phase?: "work" | "rest";    // optional: picks stroke color for the ring
  size?: number;              // px width/height of the whole circle (default 240)
};

export default function CircularTimer({
  remaining,
  total,
  phase = "work",
  size = 240,
}: CircularTimerProps) {
  // Stroke colors that match your theme
  const stroke = phase === "work" ? "#16a34a" /* green-600 */ : "#d97706" /* amber-600 */;

  const strokeTrack = "#e5e7eb"; // gray-200
  const strokeWidth = 12;

  const radius = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * radius;

  const clamped = Math.max(0, Math.min(remaining, total));
  const progress = total > 0 ? clamped / total : 0;
  const offset = C * (1 - progress);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          // smooth 1-second tick; matches your 1s timer interval
          style={{ transition: "stroke-dashoffset 1000ms linear" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // make it start at 12 o'clock
        />
      </svg>

      {/* timer text in the center */}
      <span
        className="tabular-nums font-semibold text-gray-900"
        style={{ fontSize: "min(20vw, 96px)", lineHeight: 1 }}
      >
        {format(remaining)}
      </span>
    </div>
  );
}

function format(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${ss}`;
}
