"use client";

import type { Spot } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";
import ConditionChip from "@/components/ui/ConditionChip";
import { scoreBgColor, scoreBorderColor, scoreColor } from "@/lib/scoring";

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

export default function SpotCard({ spot, onClick }: SpotCardProps) {
  const bg     = scoreBgColor(spot.score);
  const border = scoreBorderColor(spot.score);
  const isFiring  = spot.score >= 90;
  const isTopPick = spot.rank === 1;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 20,
        borderRadius: 20,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Badge row */}
      {(isFiring || isTopPick) && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isFiring && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: scoreColor(spot.score),
              backgroundColor: scoreBgColor(spot.score),
              border: `1px solid ${scoreBorderColor(spot.score)}`,
              padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em",
            }}>
              🔥 FIRING
            </span>
          )}
          {isTopPick && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#FFD60A",
              backgroundColor: "rgba(255,214,10,0.10)",
              border: "1px solid rgba(255,214,10,0.20)",
              padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em",
            }}>
              ⭐ TOP PICK
            </span>
          )}
        </div>
      )}

      {/* Main content row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Left: info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            {spot.name}
          </span>

          {/* Condition chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <ConditionChip condition={spot.conditionScores.swellDirection} />
            <ConditionChip condition={spot.conditionScores.wind} />
            <ConditionChip condition={spot.conditionScores.tide} />
            <ConditionChip condition={spot.conditionScores.size} />
          </div>

          {/* Best window */}
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
            Best {spot.bestWindowStart}–{spot.bestWindowEnd}
          </span>
        </div>

        {/* Right: score ring */}
        <ScoreRing score={spot.score} size={67} />
      </div>
    </button>
  );
}
