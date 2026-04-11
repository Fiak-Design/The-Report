"use client";

import { useEffect } from "react";
import type { Spot } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";
import ScoreBar from "@/components/ui/ScoreBar";
import { scoreColor, scoreBgColor, scoreBorderColor } from "@/lib/scoring";

interface SpotDetailSheetProps {
  spot: Spot;
  onClose: () => void;
}

function TideCurve({ readings }: { readings: Spot["conditions"]["tideReadings"] }) {
  if (!readings?.length) return null;
  const heights = readings.map((r) => r.heightFt);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const W = 320, H = 70, pad = 4;

  const points = readings.map((r, i) => {
    const x = pad + (i / (readings.length - 1)) * (W - pad * 2);
    const y = H - pad - ((r.heightFt - minH) / (maxH - minH)) * (H - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const fillD = `${pathD} L ${W - pad},${H} L ${pad},${H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#tide-fill)" />
      <path d={pathD} fill="none" stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForecastMiniCard({ day, spot }: { day: Spot["forecast"][0]; spot: Spot }) {
  const date = new Date(day.date);
  const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
  const color = scoreColor(day.score);

  return (
    <div style={{
      padding: 10, borderRadius: 6,
      backgroundColor: "rgba(255,255,255,0.05)",
      display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
        {dayLabel}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>
        {day.swellHeightFt}ft @{day.swellPeriodSec}s
      </span>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
        {day.bestWindowStart}–{day.bestWindowEnd}
      </span>
      <ScoreRing score={day.score} size={46} strokeWidth={4} labelSize={13} />
    </div>
  );
}

export default function SpotDetailSheet({ spot, onClose }: SpotDetailSheetProps) {
  const isFiring = spot.score >= 90;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#050B19",
          borderRadius: "36px 36px 0 0",
          zIndex: 50,
          padding: "24px 20px 40px",
          display: "flex", flexDirection: "column", gap: 24,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            width: 32, height: 32, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {isFiring && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: scoreColor(spot.score),
                backgroundColor: scoreBgColor(spot.score),
                border: `1px solid ${scoreBorderColor(spot.score)}`,
                padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em",
                alignSelf: "flex-start",
              }}>
                🔥 FIRING
              </span>
            )}
            <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.05 }}>
              {spot.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#34C759" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                Updated just now · {spot.region}
              </span>
            </div>
          </div>
          <ScoreRing score={spot.score} size={89} strokeWidth={6} />
        </div>

        {/* Score bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <ScoreBar condition={spot.conditionScores.swellDirection} />
          <ScoreBar condition={spot.conditionScores.wind} />
          <ScoreBar condition={spot.conditionScores.tide} />
          <ScoreBar condition={spot.conditionScores.size} />
        </div>

        {/* Tide Today */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.03em", textTransform: "uppercase",
          }}>
            Tide Today
          </span>
          <TideCurve readings={spot.conditions.tideReadings} />
        </div>

        {/* 4-Day Forecast */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.03em", textTransform: "uppercase",
          }}>
            4-Day Forecast
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {spot.forecast.map((day) => (
              <ForecastMiniCard key={day.date} day={day} spot={spot} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
