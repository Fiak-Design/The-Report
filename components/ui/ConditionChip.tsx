import { scoreColor, scoreBgColor } from "@/lib/scoring";
import type { ConditionScore } from "@/types";

interface ConditionChipProps {
  condition: ConditionScore;
}

function gradeSymbol(grade: ConditionScore["grade"]): string {
  switch (grade) {
    case "firing":
    case "good":  return "✓";
    case "fair":  return "~";
    case "poor":  return "✕";
  }
}

export default function ConditionChip({ condition }: ConditionChipProps) {
  const color = scoreColor(condition.value);
  const bg    = scoreBgColor(condition.value);
  const symbol = gradeSymbol(condition.grade);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 7px",
        borderRadius: 4,
        backgroundColor: bg,
        fontSize: 11,
        fontWeight: 600,
        color,
        whiteSpace: "nowrap",
      }}
    >
      <span>{condition.label}</span>
      <span>{symbol}</span>
    </div>
  );
}
