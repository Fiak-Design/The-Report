"use client";

import { scoreColor } from "@/lib/scoring";

interface ScoreRingProps {
  score: number;
  size?: number;       // diameter in px
  strokeWidth?: number;
  showLabel?: boolean;
  labelSize?: number;
}

export default function ScoreRing({
  score,
  size = 67,
  strokeWidth = 5,
  showLabel = true,
  labelSize,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const center = size / 2;
  const fs = labelSize ?? Math.round(size * 0.28);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontSize: fs,
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          {score}
        </div>
      )}
    </div>
  );
}
