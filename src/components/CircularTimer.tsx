// src/components/CircularTimer.tsx
import React from "react";
import { mmss } from "../utils/time";

type Props = {
  remaining: number;
  total: number;
  size?: number;        // outer square in px
  strokeWidth?: number; // ring thickness
  phase?: "work" | "rest";
};

export default function CircularTimer({
  remaining,
  total,
  size = 240,
  strokeWidth = 14,
  phase = "work",
}: Props) {
  // Ring geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Progress = elapsed / total (so the arc grows from 0 to full)
  const elapsed = Math.max(0, Math.min(total, total - remaining));
  const progress = total > 0 ? elapsed / total : 0;

  // How much of the ring is hidden
  const dashOffset = circumference * (1 - progress);

  const ringColor =
    phase === "work" ? "#2563eb" /* blue-600 */ : "#f59e0b" /* amber-500 */;
  const trackColor = "#e5e7eb"; // gray-200

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute top-0 left-0"
        // Start stroke at 12 o’clock
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          // Smooth between second ticks
          style={{
            transition: "stroke-dashoffset 1s linear",
            willChange: "stroke-dashoffset",
          }}
        />
      </svg>

      {/* Time overlay */}
      <div
        className="select-none tabular-nums font-semibold text-gray-900"
        style={{ fontSize: size * 0.22 }}
      >
        {mmss(remaining)}
      </div>
    </div>
  );
}
