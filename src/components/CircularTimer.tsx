// src/components/CircularTimer.tsx
import React from "react";
import { mmss } from "../utils/time";

type Props = {
  remaining: number;
  total: number;
  size?: number;        // px
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
  // Geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Per-current-segment progress (0..1)
  const elapsed = Math.max(0, Math.min(total, total - remaining));
  const segProgress = total > 0 ? elapsed / total : 0;

  // Colors
  const blue = "#2563eb";      // work arc
  const grayTrack = "#e5e7eb"; // background track
  const restGray = "#9ca3af";  // rest arc

  // Frozen work progress: during WORK use segProgress; during REST clamp to 1
  const workProgress = phase === "work" ? segProgress : 1;
  const workDashOffset = circumference * (1 - workProgress);

  // REST progress: only animate during REST; zero elsewhere
  const restProgress = phase === "rest" ? segProgress : 0;
  const restDashOffset = circumference * (1 - restProgress);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0"
        style={{ transform: "rotate(-90deg)" }} // start at 12 o'clock
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={grayTrack}
          strokeWidth={strokeWidth}
        />

        {/* Frozen WORK arc (blue). During REST this stays at full circle. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={blue}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={workDashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />

        {/* REST arc (gray). Only animates during REST. */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={restGray}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={restDashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>

      {/* Time text overlay */}
      <div
        className="select-none tabular-nums font-semibold text-gray-900"
        style={{ fontSize: size * 0.22 }}
      >
        {mmss(remaining)}
      </div>
    </div>
  );
}
