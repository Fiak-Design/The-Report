import { scoreColor } from "@/lib/scoring";
import type { ConditionScore } from "@/types";

interface ScoreBarProps {
  condition: ConditionScore;
}

export default function ScoreBar({ condition }: ScoreBarProps) {
  const color = scoreColor(condition.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.03em" }}>
          {condition.label.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{condition.value}</span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${condition.value}%`,
            backgroundColor: color,
            borderRadius: 2,
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
    </div>
  );
}
