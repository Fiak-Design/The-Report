import { computeSpotScore, convertToFaceHeight, scoreTideMultiplier } from "@/lib/scoring";
import type { SpotConfig, LiveConditions, TideWindowType, CompassDirection, TideEvent } from "@/lib/scoring";

// ─── 19 NH Seacoast Spot Configs ─────────────────────────────────────────────

export const spotConfigs: SpotConfig[] = [
  {
    id: "triangle",
    name: "Triangle",
    sizeMinFt: 0,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["SE", "E"],
    idealWindDirections: ["SW"],
    tideWindow: { kind: "midHighIncoming", hoursBeforeHigh: [1, 3] },
  },
  {
    id: "southside",
    name: "SouthSide",
    sizeMinFt: 6,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["SE", "E", "NE"],
    idealWindDirections: ["N", "NE"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1.5 },
  },
  {
    id: "the-wall",
    name: "The Wall",
    sizeMinFt: 1.5,
    sizeMaxFt: 4,
    idealSwellDirections: ["SE", "E", "NE"],
    idealWindDirections: ["W", "NW"],
    tideWindow: { kind: "aroundHigh", hoursFromHigh: 4 },
  },
  {
    id: "pcove",
    name: "Pcove",
    sizeMinFt: 2,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["SE", "E", "NE"],
    idealWindDirections: ["W", "NW"],
    tideWindow: { kind: "lowerPercent", percent: 40 },
  },
  {
    id: "low-tide-freaks",
    name: "Low-Tide Freaks",
    sizeMinFt: 6,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["SE", "E", "NE"],
    idealWindDirections: ["N", "NE", "NW"],
    tideWindow: { kind: "lowPlusMinus", hoursFromLow: 1.5 },
  },
  {
    id: "freaks",
    name: "Freaks",
    sizeMinFt: 5,
    sizeMaxFt: 8,
    idealSwellDirections: ["SE", "E", "NE"],
    idealWindDirections: ["SW", "W", "NW", "N"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1.5 },
  },
  {
    id: "costellos",
    name: "Costello's",
    sizeMinFt: 5,
    sizeMaxFt: 12,
    idealSwellDirections: ["S", "SE", "E", "NE", "N"],
    idealWindDirections: ["SW", "W", "NW"],
    tideWindow: { kind: "beforeHigh", hoursBeforeHigh: [1, 5] },
  },
  {
    id: "fox-hill",
    name: "Fox Hill",
    sizeMinFt: 5,
    sizeMaxFt: 10,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["W", "NW"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1.5 },
  },
  {
    id: "lynkies",
    name: "Lynkies",
    sizeMinFt: 6,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["SW", "W", "NW"],
    tideWindow: { kind: "lowPlusMinus", hoursFromLow: 1.5 },
    isLynkies: true,
  },
  {
    id: "rye-rocks",
    name: "Rye Rocks",
    sizeMinFt: 2,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["SW", "W", "N", "NW"],
    tideWindow: { kind: "middlePercent", percent: 60 },
  },
  {
    id: "sawyers",
    name: "Sawyers",
    sizeMinFt: 4,
    sizeMaxFt: 6,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["S", "SW", "W"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1 },
  },
  {
    id: "jenness",
    name: "Jenness",
    sizeMinFt: 2,
    sizeMaxFt: 6,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["W"],
    tideWindow: { kind: "any" },
  },
  {
    id: "straws",
    name: "Straws",
    sizeMinFt: 4,
    sizeMaxFt: 9,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["N", "NW", "W"],
    tideWindow: { kind: "midTideWindow", hours: 3 },
  },
  {
    id: "luckys",
    name: "Lucky's",
    sizeMinFt: 5,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["SW", "W", "NW"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1.5 },
  },
  {
    id: "picnic-tables",
    name: "Picnic Tables",
    sizeMinFt: 3,
    sizeMaxFt: 12,
    idealSwellDirections: ["S", "SE", "NE"],
    idealWindDirections: ["SW", "W", "NW"],
    tideWindow: { kind: "highPlusMinus", hoursFromHigh: 1.5 },
  },
  {
    id: "odiorne-point",
    name: "Odiorne Point",
    sizeMinFt: 4,
    sizeMaxFt: Infinity,
    idealSwellDirections: ["E", "SE"],
    idealWindDirections: ["W", "NW"],
    tideWindow: { kind: "midHighIncoming", hoursBeforeHigh: [1, 3] },
  },
];

// ─── Computed output types (what components consume) ─────────────────────────

export interface SpotCondition {
  label: string;
  value: number;
}

export interface ForecastDay {
  day: string;
  waveInfo: string;
  bestWindow: string;
  score: number;
}

export interface SpotData {
  id: string;
  name: string;
  score: number;
  tag: string | null;
  topPick: boolean;
  faceHeightFt: number;
  conditions: {
    swellDir: SpotCondition;
    wind: SpotCondition;
    tide: SpotCondition;
    size: SpotCondition;
  };
  bestWindow: string;
  tideWindow: string;
  forecast: ForecastDay[];
}

// ─── Build SpotData from live conditions ─────────────────────────────────────

function tideWindowLabel(tw: TideWindowType): string {
  switch (tw.kind) {
    case "highPlusMinus": return `High ±${tw.hoursFromHigh}hr`;
    case "lowPlusMinus": return `Low ±${tw.hoursFromLow}hr`;
    case "exceptHighPlusMinus": return "All except near high";
    case "lowerPercent": return `Lower ${tw.percent}% of range`;
    case "middlePercent": return `Middle ${tw.percent}% of range`;
    case "midHighIncoming": return `${tw.hoursBeforeHigh[0]}–${tw.hoursBeforeHigh[1]}hr before high`;
    case "beforeHigh": return `${tw.hoursBeforeHigh[0]}–${tw.hoursBeforeHigh[1]}hr before high`;
    case "midTideWindow": return `Mid-tide ${tw.hours}hr window`;
    case "aroundHigh": return `1–${tw.hoursFromHigh}hr from high`;
    case "any": return "Any tide";
  }
}

// ─── Best window calculation ─────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

/** Interpolate tide height at a given time using cosine between hi/lo events */
function interpolateTideHeight(timeMs: number, events: TideEvent[]): number {
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

function computeBestWindow(
  tideWindow: TideWindowType,
  events: TideEvent[],
  _currentHeight: number
): string {
  if (tideWindow.kind === "any") return "Any tide";

  const today = new Date();
  const allWindows: { start: Date; end: Date }[] = [];
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;

  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      const slot = new Date(today);
      slot.setHours(h, m, 0, 0);
      const heightAtSlot = interpolateTideHeight(slot.getTime(), events);
      const mult = scoreTideMultiplier(tideWindow, slot, events, heightAtSlot);
      if (mult >= 0.85) {
        if (!windowStart) windowStart = slot;
        windowEnd = slot;
      } else {
        if (windowStart && windowEnd) {
          allWindows.push({ start: windowStart, end: windowEnd });
        }
        windowStart = null;
        windowEnd = null;
      }
    }
  }
  if (windowStart && windowEnd) {
    allWindows.push({ start: windowStart, end: windowEnd });
  }

  if (allWindows.length === 0) return "No ideal window today";

  // Cap to 2 longest windows
  if (allWindows.length > 2) {
    allWindows.sort((a, b) => (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime()));
    allWindows.splice(2);
    allWindows.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  return allWindows.map((w) => `${formatTime(w.start)} – ${formatTime(w.end)}`).join("  &  ");
}

// ─── Forecast generation ─────────────────────────────────────────────────────

function buildForecast(config: SpotConfig, conditions: LiveConditions): ForecastDay[] {
  const { forecastWind, forecastWave } = conditions;
  const days = Math.min(4, forecastWind?.length ?? 0, forecastWave?.length ?? 0);
  if (days === 0) return [];

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return Array.from({ length: days }, (_, i) => {
    // Day 0 (Today): use live buoy + live wind; Days 1–3: use forecast model
    const useLive = i === 0;
    const daySwell = useLive
      ? conditions.swell
      : { heightMeters: forecastWave[i].avgHeightMeters, periodSec: forecastWave[i].avgPeriodSec, directionDeg: forecastWave[i].avgDirectionDeg };
    const dayWind = useLive
      ? conditions.wind
      : { speedMph: forecastWind[i].avgSpeedMph, directionDeg: forecastWind[i].avgDirectionDeg };

    const dayConditions: LiveConditions = {
      ...conditions,
      swell: daySwell,
      wind: dayWind,
    };
    const result = computeSpotScore(config, dayConditions);
    const faceHeight = convertToFaceHeight(daySwell.heightMeters, daySwell.periodSec, daySwell.directionDeg);

    let dayLabel: string;
    if (i === 0) dayLabel = "Today";
    else if (i === 1) dayLabel = "Tomorrow";
    else {
      const d = new Date(forecastWave[i].date + "T12:00:00");
      dayLabel = dayNames[d.getDay()];
    }

    const bestWin = computeBestWindow(config.tideWindow, conditions.tide.events, conditions.tide.currentHeightFt);

    return {
      day: dayLabel,
      waveInfo: `${faceHeight.toFixed(1)}ft @${Math.round(daySwell.periodSec)} sec`,
      bestWindow: bestWin !== "No ideal window today" ? `Best: ${bestWin}` : "—",
      score: result.score,
    };
  });
}

// ─── Main compute ────────────────────────────────────────────────────────────

export function computeAllSpots(conditions: LiveConditions): SpotData[] {
  const scored = spotConfigs.map((config) => {
    const result = computeSpotScore(config, conditions);
    const bestWindow = computeBestWindow(config.tideWindow, conditions.tide.events, conditions.tide.currentHeightFt);
    const forecast = buildForecast(config, conditions);

    return {
      id: config.id,
      name: config.name,
      score: result.score,
      tag: result.tag,
      topPick: false,
      faceHeightFt: result.faceHeightFt,
      conditions: {
        swellDir: { label: "Swell Dir.", value: result.swellScore },
        wind: { label: "Wind", value: result.windScore },
        tide: { label: "Tide", value: Math.round(result.tideMultiplier * 100) },
        size: { label: "Size", value: result.sizeScore },
      },
      bestWindow,
      tideWindow: tideWindowLabel(config.tideWindow),
      forecast,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    scored[0].topPick = true;
  }

  return scored;
}

// ─── Lookup helper ───────────────────────────────────────────────────────────

let _computedSpots: SpotData[] = [];

export function setComputedSpots(spots: SpotData[]) {
  _computedSpots = spots;
}

export function getComputedSpots(): SpotData[] {
  return _computedSpots;
}

export function getSpotById(id: string): SpotData | undefined {
  return _computedSpots.find((s) => s.id === id);
}
