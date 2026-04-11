"use client";

import { scoreTideMultiplier } from "@/lib/scoring";
import type { TideEvent, TideWindowType } from "@/lib/scoring";
import type { SerializedTideEvent } from "@/app/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function interpolateTideHeight(timeMs: number, events: { time: Date; heightFt: number }[]): number {
  if (events.length === 0) return 3.0;
  if (events.length === 1) return events[0].heightFt;

  let before = events[0];
  let after = events[events.length - 1];
  for (let i = 0; i < events.length - 1; i++) {
    if (timeMs >= events[i].time.getTime() && timeMs <= events[i + 1].time.getTime()) {
      before = events[i];
      after = events[i + 1];
      break;
    }
  }
  const total = after.time.getTime() - before.time.getTime();
  const elapsed = timeMs - before.time.getTime();
  const t = total > 0 ? elapsed / total : 0;
  const cosT = (1 - Math.cos(t * Math.PI)) / 2;
  return before.heightFt + (after.heightFt - before.heightFt) * cosT;
}

export interface IdealWindow {
  startMs: number;
  endMs: number;
  startLabel: string;
  endLabel: string;
}

export interface IdealWindowResult {
  windows: IdealWindow[];
  label: string; // formatted label for display
}

const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

export function computeIdealTideWindow(
  tideWindow: TideWindowType,
  events: TideEvent[],
): IdealWindowResult | null {
  if (tideWindow.kind === "any") return null;

  const today = new Date();
  const startMs = new Date(today).setHours(6, 0, 0, 0);
  const endMs = new Date(today).setHours(21, 0, 0, 0);

  // Collect all contiguous windows where multiplier >= 0.85
  const allWindows: IdealWindow[] = [];
  let windowStart: number | null = null;
  let windowEnd: number | null = null;

  for (let ms = startMs; ms <= endMs; ms += 15 * 60 * 1000) {
    const slot = new Date(ms);
    const heightAtSlot = interpolateTideHeight(ms, events);
    const mult = scoreTideMultiplier(tideWindow, slot, events, heightAtSlot);
    if (mult >= 0.85) {
      if (windowStart === null) windowStart = ms;
      windowEnd = ms;
    } else {
      if (windowStart !== null && windowEnd !== null) {
        allWindows.push({ startMs: windowStart, endMs: windowEnd, startLabel: fmtTime(windowStart), endLabel: fmtTime(windowEnd) });
      }
      windowStart = null; windowEnd = null;
    }
  }
  if (windowStart !== null && windowEnd !== null) {
    allWindows.push({ startMs: windowStart, endMs: windowEnd, startLabel: fmtTime(windowStart), endLabel: fmtTime(windowEnd) });
  }

  if (allWindows.length === 0) return null;

  // Cap to 2 windows — keep the 2 longest (highest-quality) ones
  if (allWindows.length > 2) {
    allWindows.sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs));
    allWindows.splice(2);
    // Re-sort chronologically for display
    allWindows.sort((a, b) => a.startMs - b.startMs);
  }

  const label = allWindows.map((w) => `${w.startLabel} – ${w.endLabel}`).join("  &  ");

  return { windows: allWindows, label };
}

// ─── Tide Chart Component ────────────────────────────────────────────────────

interface TideChartProps {
  events?: SerializedTideEvent[];
  tideWindow?: TideWindowType;
}

export default function TideChart({ events, tideWindow }: TideChartProps) {
  if (!events || events.length < 2) return <FallbackChart />;

  const today = new Date();
  const startHour = 6;
  const endHour = 21;
  const width = 342;
  const height = 55;
  const padding = 4;

  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

  const allEvents = events.map((e) => ({ ...e, time: new Date(e.time) }));
  const relevantEvents = allEvents.filter(
    (e) => e.time >= new Date(todayStart.getTime() - 6 * 3600000) &&
           e.time <= new Date(todayEnd.getTime() + 6 * 3600000)
  );
  if (relevantEvents.length < 2) return <FallbackChart />;

  const heights = relevantEvents.map((e) => e.heightFt);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = maxH - minH || 1;

  const chartStartMs = new Date(today).setHours(startHour, 0, 0, 0);
  const chartEndMs = new Date(today).setHours(endHour, 0, 0, 0);
  const totalMs = chartEndMs - chartStartMs;

  function timeToX(ms: number): number { return ((ms - chartStartMs) / totalMs) * width; }
  function heightToY(h: number): number { return height - padding - ((h - minH) / range) * (height - padding * 2); }

  // Blue tide curve points
  const points: string[] = [];
  for (let ms = chartStartMs; ms <= chartEndMs; ms += 15 * 60 * 1000) {
    const h = interpolateTideHeight(ms, relevantEvents);
    points.push(`${timeToX(ms).toFixed(1)},${heightToY(h).toFixed(1)}`);
  }

  // Green ideal window shading
  const tideEventsForScoring: TideEvent[] = relevantEvents.map((e) => ({
    time: e.time, heightFt: e.heightFt, type: e.type as "H" | "L",
  }));
  const idealWin = tideWindow ? computeIdealTideWindow(tideWindow, tideEventsForScoring) : null;

  // Compute green window rectangles (may be multiple for aroundHigh)
  const greenRects: { x1: number; x2: number }[] = [];
  if (idealWin) {
    for (const w of idealWin.windows) {
      const x1 = Math.max(0, timeToX(w.startMs));
      const x2 = Math.min(width, timeToX(w.endMs));
      greenRects.push({ x1, x2 });
    }
  }

  // Orange dot — current time on curve (as percentage for absolute positioning)
  const nowMs = today.getTime();
  let orangeDot: { xPct: number; yPct: number } | null = null;
  if (nowMs >= chartStartMs && nowMs <= chartEndMs) {
    const cx = timeToX(nowMs);
    const cy = heightToY(interpolateTideHeight(nowMs, relevantEvents));
    orangeDot = { xPct: (cx / width) * 100, yPct: (cy / height) * 100 };
  }

  // Hi/Lo labels
  const todaysEvents = relevantEvents.filter((e) => e.time >= todayStart && e.time <= todayEnd);

  return (
    <div className="h-[68.291px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <svg className="block size-full" fill="none" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {greenRects.map((rect, i) => (
          <g key={i}>
            <rect x={rect.x1} y={0} width={rect.x2 - rect.x1} height={height} fill="#4ADE80" fillOpacity="0.1" />
            <line x1={rect.x1} y1={0} x2={rect.x1} y2={height} stroke="#4ADE80" strokeWidth="1" strokeDasharray="2.97 1.98" />
            <line x1={rect.x2} y1={0} x2={rect.x2} y2={height} stroke="#4ADE80" strokeWidth="1" strokeDasharray="2.97 1.98" />
          </g>
        ))}
        <polyline points={points.join(" ")} stroke="#007FFF" strokeWidth="2" fill="none" />
      </svg>
      {orangeDot && (
        <div style={{
          position: "absolute",
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#F97316",
          left: `calc(${orangeDot.xPct}% - 5px)`,
          top: `calc(${orangeDot.yPct}% - 5px)`,
          flexShrink: 0,
        }} />
      )}
      {todaysEvents.map((ev, i) => {
        const evMs = ev.time.getTime();
        if (evMs < chartStartMs || evMs > chartEndMs) return null;
        const xPct = ((evMs - chartStartMs) / totalMs) * 100;
        const label = ev.type === "H" ? "H" : "L";
        const timeStr = ev.time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
        return (
          <p key={i} className="absolute font-['SF_Pro_Display:Regular',sans-serif] leading-none not-italic text-[9px] text-[rgba(255,255,255,0.75)]" style={{ left: `${Math.min(90, Math.max(0, xPct - 5))}%`, bottom: "2px" }}>
            {timeStr} {label}
          </p>
        );
      })}
    </div>
  );
}

function FallbackChart() {
  return (
    <div className="h-[68.291px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <svg className="block size-full" fill="none" viewBox="0 0 342 55" preserveAspectRatio="none">
        <line x1="0" y1="27.5" x2="342" y2="27.5" stroke="#007FFF" strokeWidth="2" strokeOpacity="0.3" />
      </svg>
    </div>
  );
}
