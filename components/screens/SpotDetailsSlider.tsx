"use client";
import svgPaths from "./svg/spot-details-paths";
import { getSpotById, spotConfigs } from "@/lib/api/spotsData";
import TideChart, { computeIdealTideWindow } from "@/components/screens/TideChart";
import type { SpotData, ForecastDay } from "@/lib/api/spotsData";
import { scoreTideMultiplier } from "@/lib/scoring";
import type { TideEvent, TideWindowType } from "@/lib/scoring";
import type { SerializedTideEvent } from "@/app/page";

interface SpotDetailsSliderProps {
  spotId: string;
  tideEvents?: SerializedTideEvent[];
  onClose?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#FBBF24";
  return "#FF4F4F";
}

function scoreBgRgba(score: number): string {
  if (score >= 70) return "rgba(74,222,128,0.1)";
  if (score >= 40) return "rgba(251,191,36,0.1)";
  return "rgba(255,90,90,0.1)";
}

function tagBgRgba(tag: string | null): string {
  if (tag && tag.includes("Firing")) return "rgba(249,115,22,0.2)";
  return "rgba(74,222,128,0.1)";
}

function tagTextColor(tag: string | null): string {
  if (tag && tag.includes("Firing")) return "#f97316";
  return "#4ade80";
}

function ConditionBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  const fillPercent = 100 - value;
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
      <div className={`flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] text-right ${label === "Swell Dir." ? "w-auto whitespace-nowrap" : "w-[43.61px]"}`}>
        <p className="leading-none">{label}</p>
      </div>
      <div className="h-[4px] relative shrink-0 w-[283px]">
        <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0.1)] h-[4px] left-[0.39px] overflow-clip right-[-0.39px] rounded-[2px] top-[calc(50%-0.1px)]" data-name="Background">
          <div
            className="absolute rounded-[2px]"
            style={{
              backgroundColor: color,
              inset: `0 ${fillPercent}% 0 0`,
            }}
            data-name="Background"
          />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, size }: { score: number; size: "large" | "small" }) {
  const color = scoreColor(score);
  const percent = score / 100;
  const isLarge = size === "large";
  const ringSize = isLarge ? 89.097 : 45.834;
  const fontSize = isLarge ? "36px" : "18px";
  const circumference = 2 * Math.PI * (ringSize / 2 - 3);
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
      {/* Background ring */}
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${ringSize} ${ringSize}`}>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringSize / 2 - 3}
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth={isLarge ? 6.68 : 3.44}
          fill="none"
        />
      </svg>
      {/* Score number */}
      <div
        className="absolute inset-0 flex items-center justify-center font-['riant-display',sans-serif] font-bold not-italic text-center text-white"
        style={{ fontSize, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
      >
        {score}
      </div>
      {/* Progress arc */}
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringSize / 2 - 3}
          stroke={color}
          strokeWidth={isLarge ? 6.68 : 3.44}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ForecastCard({ day, gridPos }: { day: ForecastDay; gridPos: string }) {
  const color = scoreColor(day.score);
  const bgColor = scoreBgRgba(day.score);
  const borderColor = bgColor;

  return (
    <div className={`${gridPos} justify-self-stretch relative rounded-[6px] self-stretch shrink-0`} style={{ backgroundColor: bgColor }} data-name="Spot Forcast">
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px]" style={{ borderColor }} />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[10px] relative size-full">
          <div className="content-stretch flex flex-col font-['SF_Pro_Display:Regular',sans-serif] gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-[94px]">
            <div className="flex flex-col justify-center relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-full">
              <p className="leading-none">{day.day}</p>
            </div>
            <div className="flex flex-col justify-center relative shrink-0 text-[13px] w-full" style={{ color }}>
              <p className="leading-none">{day.waveInfo}</p>
            </div>
            <div className="flex flex-col justify-center relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-full">
              <p className="leading-none">{day.bestWindow}</p>
            </div>
          </div>
          <ScoreRing score={day.score} size="small" />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342 1">
          <path d="M0 0.5H342" id="Vector 18" stroke="var(--stroke-0, white)" strokeOpacity="0.2" />
        </svg>
      </div>
    </div>
  );
}

// TideCurve and computeIdealTideWindow are imported from TideChart.tsx

function _unused_interpolateTideHeight(timeMs: number, events: TideEvent[]): number {
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

function _localComputeIdealTideWindow(
  tideWindow: TideWindowType,
  events: TideEvent[],
  _currentHeight: number
): { startMs: number; endMs: number; startLabel: string; endLabel: string } | null {
  if (tideWindow.kind === "any") return null;

  const today = new Date();
  const startMs = new Date(today).setHours(6, 0, 0, 0);
  const endMs = new Date(today).setHours(21, 0, 0, 0);

  let windowStart: number | null = null;
  let windowEnd: number | null = null;
  let bestStart: number | null = null;
  let bestEnd: number | null = null;
  let longestLen = 0;

  for (let ms = startMs; ms <= endMs; ms += 15 * 60 * 1000) {
    const slot = new Date(ms);
    // Interpolate the actual tide height at this slot time
    const heightAtSlot = interpolateTideHeight(ms, events);
    const mult = scoreTideMultiplier(tideWindow, slot, events, heightAtSlot);
    if (mult >= 0.85) {
      if (windowStart === null) windowStart = ms;
      windowEnd = ms;
    } else {
      if (windowStart !== null && windowEnd !== null) {
        const len = windowEnd - windowStart;
        if (len > longestLen) {
          longestLen = len;
          bestStart = windowStart;
          bestEnd = windowEnd;
        }
      }
      windowStart = null;
      windowEnd = null;
    }
  }
  if (windowStart !== null && windowEnd !== null) {
    const len = windowEnd - windowStart;
    if (len > longestLen) {
      bestStart = windowStart;
      bestEnd = windowEnd;
    }
  }

  if (bestStart === null || bestEnd === null) return null;

  const fmt = (ms: number) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return { startMs: bestStart, endMs: bestEnd, startLabel: fmt(bestStart), endLabel: fmt(bestEnd) };
}

// ─── Dynamic Tide Curve ──────────────────────────────────────────────────────

function TideCurve({ events, tideWindow, currentHeight }: { events?: SerializedTideEvent[]; tideWindow?: TideWindowType; currentHeight?: number }) {
  const fallback = (
    <div className="h-[68.291px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <div className="absolute bottom-[3.68px] h-[52.84px] left-0 right-[-0.08%]">
        <div className="absolute inset-[-1.89%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 342.275 54.8398">
            <path d={svgPaths.pc6f7000} id="Vector 21" stroke="var(--stroke-0, #007FFF)" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );

  if (!events || events.length < 2) return fallback;

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
  if (relevantEvents.length < 2) return fallback;

  const heights = relevantEvents.map((e) => e.heightFt);
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = maxH - minH || 1;

  function interpolateHeight(timeMs: number): number {
    let before = relevantEvents[0];
    let after = relevantEvents[relevantEvents.length - 1];
    for (let i = 0; i < relevantEvents.length - 1; i++) {
      if (timeMs >= relevantEvents[i].time.getTime() && timeMs <= relevantEvents[i + 1].time.getTime()) {
        before = relevantEvents[i];
        after = relevantEvents[i + 1];
        break;
      }
    }
    const total = after.time.getTime() - before.time.getTime();
    const elapsed = timeMs - before.time.getTime();
    const t = total > 0 ? elapsed / total : 0;
    const cosT = (1 - Math.cos(t * Math.PI)) / 2;
    return before.heightFt + (after.heightFt - before.heightFt) * cosT;
  }

  function timeToX(ms: number): number {
    return ((ms - chartStartMs) / totalMs) * width;
  }
  function heightToY(h: number): number {
    return height - padding - ((h - minH) / range) * (height - padding * 2);
  }

  const chartStartMs = new Date(today).setHours(startHour, 0, 0, 0);
  const chartEndMs = new Date(today).setHours(endHour, 0, 0, 0);
  const totalMs = chartEndMs - chartStartMs;

  // Generate blue tide curve points
  const points: string[] = [];
  for (let ms = chartStartMs; ms <= chartEndMs; ms += 15 * 60 * 1000) {
    points.push(`${timeToX(ms).toFixed(1)},${heightToY(interpolateHeight(ms)).toFixed(1)}`);
  }

  // Compute green ideal window
  const tideEventsForScoring: TideEvent[] = relevantEvents.map((e) => ({
    time: e.time,
    heightFt: e.heightFt,
    type: e.type as "H" | "L",
  }));
  const idealWin = tideWindow
    ? computeIdealTideWindow(tideWindow, tideEventsForScoring)
    : null;

  // Green shaded area coordinates
  let greenX1: number | null = null;
  let greenX2: number | null = null;
  if (idealWin) {
    greenX1 = Math.max(0, timeToX(idealWin.startMs));
    greenX2 = Math.min(width, timeToX(idealWin.endMs));
  }

  // Orange dot — current time position on curve
  const nowMs = today.getTime();
  let orangeDot: { cx: number; cy: number } | null = null;
  if (nowMs >= chartStartMs && nowMs <= chartEndMs) {
    const cx = timeToX(nowMs);
    const cy = heightToY(interpolateHeight(nowMs));
    orangeDot = { cx, cy };
  }

  // Hi/Lo labels
  const todaysEvents = relevantEvents.filter(
    (e) => e.time >= todayStart && e.time <= todayEnd
  );

  return (
    <div className="h-[68.291px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <svg className="block size-full" fill="none" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Green ideal window shading */}
        {greenX1 !== null && greenX2 !== null && (
          <rect x={greenX1} y={0} width={greenX2 - greenX1} height={height} fill="#4ADE80" fillOpacity="0.1" />
        )}
        {/* Green dashed boundary lines */}
        {greenX1 !== null && (
          <line x1={greenX1} y1={0} x2={greenX1} y2={height} stroke="#4ADE80" strokeWidth="1" strokeDasharray="2.97 1.98" />
        )}
        {greenX2 !== null && (
          <line x1={greenX2} y1={0} x2={greenX2} y2={height} stroke="#4ADE80" strokeWidth="1" strokeDasharray="2.97 1.98" />
        )}
        {/* Blue tide curve */}
        <polyline points={points.join(" ")} stroke="#007FFF" strokeWidth="2" fill="none" />
        {/* Orange current-time dot */}
        {orangeDot && (
          <circle cx={orangeDot.cx} cy={orangeDot.cy} r="4" fill="#F97316" />
        )}
      </svg>
      {/* Hi/Lo labels */}
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

export default function SpotDetailsSlider({ spotId, tideEvents, onClose }: SpotDetailsSliderProps) {
  const spot = getSpotById(spotId);
  if (!spot) return null;

  const tagColor = tagTextColor(spot.tag);
  const tagBg = tagBgRgba(spot.tag);
  const gridPositions = ["col-1 row-1", "col-2 row-1", "col-1 row-2", "col-2 row-2"];

  // Look up the spot's tide window config
  const spotConfig = spotConfigs.find((c) => c.id === spotId);
  const tideWindowConfig = spotConfig?.tideWindow;

  // Compute the actual ideal tide window for the label
  const parsedEvents: TideEvent[] = (tideEvents || []).map((e) => ({
    time: new Date(e.time),
    heightFt: e.heightFt,
    type: e.type,
  }));
  const idealWin = tideWindowConfig
    ? computeIdealTideWindow(tideWindowConfig, parsedEvents)
    : null;
  const hasIdealWindow = idealWin !== null || tideWindowConfig?.kind === "any";
  const idealWindowLabel = tideWindowConfig?.kind === "any"
    ? "Any tide"
    : idealWin ? idealWin.label : null;
  const tideWindowColor = hasIdealWindow ? scoreColor(spot.score) : "#FF4F4F";
  const tideWindowBg = hasIdealWindow ? scoreBgRgba(spot.score) : "rgba(255,79,79,0.1)";

  return (
    <div className="bg-[#050b19] border-[rgba(255,255,255,0.1)] border-l border-r border-solid border-t overflow-clip relative rounded-tl-[36px] rounded-tr-[36px] size-full" data-name="Spot Details Slider">
      <button
        onClick={onClose}
        className="absolute left-[339.48px] size-[20px] top-[23px] cursor-pointer z-10 hover:opacity-80 transition-opacity"
        data-name="Icons"
        aria-label="Close"
      >
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <g id="Icons">
            <path d={svgPaths.p3b87bf80} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" strokeWidth="1.5" />
          </g>
        </svg>
      </button>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[30px] items-center left-1/2 top-[53px] w-[342px]">
        <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full">
          {/* Header: Tag + Name + Score Ring */}
          <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-[226px]">
              {spot.tag && (
                <div className="content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" style={{ backgroundColor: tagBg }} data-name="Tags">
                  <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] tracking-[0.8px] uppercase whitespace-nowrap" style={{ color: tagColor }}>
                    <p className="leading-none">{spot.tag}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[36px] text-white w-[min-content]">
                <p className="leading-none">{spot.name}</p>
              </div>
              <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-auto" data-name="Tags">
                <div className="relative shrink-0 size-[7.736px]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.73584 7.73584">
                    <circle cx="3.86792" cy="3.86792" fill="var(--fill-0, #4ADE80)" id="Ellipse 1" r="3.86792" />
                  </svg>
                </div>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">
                  <p className="leading-none">Updated {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}</p>
                </div>
              </div>
            </div>
            <ScoreRing score={spot.score} size="large" />
          </div>
          {/* Condition Bars */}
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
            <ConditionBar label={spot.conditions.swellDir.label} value={spot.conditions.swellDir.value} />
            <ConditionBar label={spot.conditions.wind.label} value={spot.conditions.wind.value} />
            <ConditionBar label={spot.conditions.tide.label} value={spot.conditions.tide.value} />
            <ConditionBar label={spot.conditions.size.label} value={spot.conditions.size.value} />
          </div>
        </div>

        <Divider />

        {/* Tide Chart */}
        <div className="content-stretch flex flex-col gap-[16.82px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[5.607px] items-start justify-center relative shrink-0 w-full">
            <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold h-[11.213px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] tracking-[1.0279px] uppercase w-[289.971px]">
              <p className="leading-[normal]">Tide Today</p>
            </div>
            <TideChart events={tideEvents} tideWindow={tideWindowConfig} />
            <div className="content-stretch flex font-['SF_Pro_Display:Regular',sans-serif] items-center justify-between leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-full whitespace-nowrap">
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">6am</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">9am</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">Noon</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">3pm</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">6pm</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">9pm</p></div>
            </div>
          </div>
          <div className="content-stretch flex items-start justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0 max-w-full overflow-hidden" style={{ backgroundColor: tideWindowBg }}>
            <div className="font-['SF_Pro_Display:Bold',sans-serif] not-italic relative shrink-0 text-[11px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: tideWindowColor, lineHeight: "normal" }}>
              {hasIdealWindow ? `✓ Ideal window: ${idealWindowLabel}` : "✕ No ideal window today"}
            </div>
          </div>
        </div>

        <Divider />

        {/* 4-Day Forecast */}
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-[342px]">
          <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] tracking-[1.0279px] uppercase w-full">
            <p className="leading-[normal]">4-Day Forecast</p>
          </div>
          <div className="gap-x-[8px] gap-y-[8px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(2,fit-content(100%))] h-[139.667px] relative shrink-0 w-full">
            {spot.forecast.map((day, i) => (
              <ForecastCard key={day.day} day={day} gridPos={gridPositions[i]} />
            ))}
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-white bottom-[8.29px] h-[5px] left-1/2 rounded-[100px] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}
