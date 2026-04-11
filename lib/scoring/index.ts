// ─── Types ───────────────────────────────────────────────────────────────────

export type ScoreLabel = "🔥 Firing" | "✅ Good" | "⚠️ Marginal" | "❌ Off" | "Flat";

export type CompassDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export type TideWindowType =
  | { kind: "highPlusMinus"; hoursFromHigh: number }
  | { kind: "lowPlusMinus"; hoursFromLow: number }
  | { kind: "exceptHighPlusMinus"; hoursFromHigh: number }
  | { kind: "lowerPercent"; percent: number }
  | { kind: "middlePercent"; percent: number }
  | { kind: "midHighIncoming"; hoursBeforeHigh: [number, number] }
  | { kind: "beforeHigh"; hoursBeforeHigh: [number, number] }
  | { kind: "midTideWindow"; hours: number }
  | { kind: "aroundHigh"; hoursFromHigh: number }
  | { kind: "any" };

export interface SpotConfig {
  id: string;
  name: string;
  sizeMinFt: number;
  sizeMaxFt: number;
  idealSwellDirections: CompassDirection[];
  idealWindDirections: CompassDirection[];
  tideWindow: TideWindowType;
  isLynkies?: boolean;
}

export interface TideEvent {
  time: Date;
  heightFt: number;
  type: "H" | "L";
}

export interface DailyWind {
  date: string;
  dayLabel: string;
  avgSpeedMph: number;
  avgDirectionDeg: number;
}

export interface DailyWave {
  date: string;
  dayLabel: string;
  avgHeightMeters: number;
  avgPeriodSec: number;
  avgDirectionDeg: number;
}

export interface LiveConditions {
  swell: { heightMeters: number; periodSec: number; directionDeg: number };
  wind: { speedMph: number; directionDeg: number };
  tide: { events: TideEvent[]; currentHeightFt: number };
  forecastWind: DailyWind[];
  forecastWave: DailyWave[];
  timestamp: Date;
}

export interface ScoredSpot {
  id: string;
  name: string;
  score: number;
  label: ScoreLabel;
  tag: string | null;
  sizeScore: number;
  swellScore: number;
  windScore: number;
  tideMultiplier: number;
  faceHeightFt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const COMPASS_DEGREES: Record<CompassDirection, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

function angleDiff(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Find the smallest angular difference between a bearing and a list of ideal compass directions */
function nearestAngleDiff(bearingDeg: number, idealDirs: CompassDirection[]): number {
  let minDiff = 360;
  for (const dir of idealDirs) {
    const diff = angleDiff(bearingDeg, COMPASS_DEGREES[dir]);
    if (diff < minDiff) minDiff = diff;
  }
  return minDiff;
}

/**
 * Interpolate a score from angular difference using the spec's breakpoints.
 * For swell: 0°=100, 22.5°=80, 45°=55, 67.5°=30, 90°+=floor
 */
function directionScore(diffDeg: number, floor: number): number {
  const points: [number, number][] = [
    [0, 100], [22.5, 80], [45, 55], [67.5, 30], [90, floor],
  ];
  if (diffDeg <= 0) return 100;
  if (diffDeg >= 90) return floor;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (diffDeg >= x0 && diffDeg <= x1) {
      const t = (diffDeg - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return floor;
}

export function labelFromScore(score: number): ScoreLabel {
  if (score === 0) return "Flat";
  if (score >= 90) return "🔥 Firing";
  if (score >= 80) return "✅ Good";
  if (score >= 50) return "⚠️ Marginal";
  return "❌ Off";
}

export function tagFromScore(score: number): string | null {
  if (score >= 90) return "🔥 Firing";
  return null;
}

// ─── Size Score ──────────────────────────────────────────────────────────────

export function convertToFaceHeight(
  buoyHeightMeters: number,
  periodSec: number,
  swellDirectionDeg?: number
): number {
  // Step 1 — buoy meters to feet
  const buoyFt = buoyHeightMeters * 3.281;

  // Step 2 — period multiplier (linear interpolation between breakpoints)
  const periodBreakpoints: [number, number][] = [
    [6, 0.50], [7, 0.70], [9, 0.80], [12, 1.10], [14, 1.35], [15, 1.55],
  ];
  let periodMult: number;
  if (periodSec <= periodBreakpoints[0][0]) {
    periodMult = periodBreakpoints[0][1];
  } else if (periodSec >= periodBreakpoints[periodBreakpoints.length - 1][0]) {
    periodMult = periodBreakpoints[periodBreakpoints.length - 1][1];
  } else {
    periodMult = periodBreakpoints[0][1];
    for (let i = 0; i < periodBreakpoints.length - 1; i++) {
      const [x0, y0] = periodBreakpoints[i];
      const [x1, y1] = periodBreakpoints[i + 1];
      if (periodSec >= x0 && periodSec <= x1) {
        const t = (periodSec - x0) / (x1 - x0);
        periodMult = y0 + t * (y1 - y0);
        break;
      }
    }
  }

  let result = buoyFt * periodMult;

  // Step 3 — direction decay for NH coast (beaches face ESE)
  if (swellDirectionDeg !== undefined) {
    const deg = ((swellDirectionDeg % 360) + 360) % 360;
    let dirMult: number;
    if (deg >= 67.5 && deg <= 112.5) {
      dirMult = 1.0;   // E — direct path
    } else if ((deg >= 22.5 && deg < 67.5) || (deg > 112.5 && deg <= 157.5)) {
      dirMult = 0.85;  // NE or SE — slight decay
    } else if ((deg > 337.5 || deg < 22.5) || (deg > 157.5 && deg <= 202.5)) {
      dirMult = 0.65;  // N or S — moderate decay
    } else {
      dirMult = 0.40;  // NW, W, SW — heavy decay
    }
    result *= dirMult;
  }

  // Step 4 — short-period decay for offshore distance (~30nm)
  if (periodSec < 8) {
    result *= 0.85;
  }

  return result;
}

export function scoreSizeForSpot(
  faceHeightFt: number,
  spot: Pick<SpotConfig, "sizeMinFt" | "sizeMaxFt" | "isLynkies">
): number {
  // Lynkies special case
  if (spot.isLynkies) {
    if (faceHeightFt < 6) {
      return Math.max(0, 100 - ((6 - faceHeightFt) * 28));
    }
    return Math.min(100, 70 + ((faceHeightFt - 6) * 6));
  }

  // Triangle: always 100 (min=0, max=Infinity)
  if (spot.sizeMinFt === 0 && spot.sizeMaxFt === Infinity) {
    return 100;
  }

  // Below min — steep penalty
  if (faceHeightFt < spot.sizeMinFt) {
    const deficit = spot.sizeMinFt - faceHeightFt;
    return Math.max(0, 100 - (deficit * 35));
  }

  // Within range — gradient from 55 at min to 100 at max
  if (spot.sizeMaxFt === Infinity) {
    // Infinite max: curve that climbs past minimum, hits 100 ~5ft above min
    return Math.min(100, 55 + ((faceHeightFt - spot.sizeMinFt) * 9));
  }

  if (faceHeightFt <= spot.sizeMaxFt) {
    const range = spot.sizeMaxFt - spot.sizeMinFt;
    if (range === 0) return 100;
    return 55 + ((faceHeightFt - spot.sizeMinFt) / range) * 45;
  }

  // Above max — steep penalty
  const overage = faceHeightFt - spot.sizeMaxFt;
  return Math.max(0, 100 - (overage * 30));
}

// ─── Swell Quality Score ─────────────────────────────────────────────────────

function periodScore(periodSec: number): number {
  if (periodSec >= 18) return 100;
  if (periodSec >= 16) return 95;
  if (periodSec >= 14) return 85;
  if (periodSec >= 12) return 65;
  if (periodSec >= 10) return 40;
  if (periodSec >= 8) return 18;
  if (periodSec >= 6) return 5;
  return 0;
}

function energyScore(faceHeightFt: number, periodSec: number): number {
  const energy = faceHeightFt * periodSec;
  if (energy >= 80) return 100;
  if (energy >= 60) return 80;
  if (energy >= 40) return 60;
  if (energy >= 20) return 35;
  return 10;
}

export function scoreSwellQuality(
  swellDirDeg: number,
  periodSec: number,
  faceHeightFt: number,
  idealSwellDirs: CompassDirection[]
): number {
  const diff = nearestAngleDiff(swellDirDeg, idealSwellDirs);
  const dirScore = directionScore(diff, 0); // floor = 0 for swell
  const perScore = periodScore(periodSec);
  const engScore = energyScore(faceHeightFt, periodSec);

  return (dirScore * 0.30) + (perScore * 0.55) + (engScore * 0.15);
}

// ─── Wind Score ──────────────────────────────────────────────────────────────

function windSpeedModifier(speedMph: number): number {
  if (speedMph <= 5) return 8;
  if (speedMph <= 12) return 0;
  if (speedMph <= 20) return -10;
  if (speedMph <= 30) return -22;
  return -40;
}

export function scoreWind(
  windDirDeg: number,
  windSpeedMph: number,
  idealWindDirs: CompassDirection[]
): number {
  const diff = nearestAngleDiff(windDirDeg, idealWindDirs);
  const dirScore = directionScore(diff, 10); // floor = 10 for wind
  const speedMod = windSpeedModifier(windSpeedMph);
  return clamp(dirScore + speedMod, 0, 100);
}

// ─── Tide Multiplier ─────────────────────────────────────────────────────────

function hoursUntilOrSince(now: Date, events: TideEvent[], type: "H" | "L"): { hoursBefore: number; hoursAfter: number; isRising: boolean } {
  const typed = events.filter((e) => e.type === type);
  let closestBefore = Infinity;
  let closestAfter = Infinity;

  for (const ev of typed) {
    const diffMs = ev.time.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs >= 0 && diffHrs < closestAfter) closestAfter = diffHrs;
    if (diffHrs < 0 && Math.abs(diffHrs) < closestBefore) closestBefore = Math.abs(diffHrs);
  }

  // Determine if tide is rising: if next high is sooner than next low
  const nextHigh = events.filter((e) => e.type === "H" && e.time.getTime() > now.getTime())[0];
  const nextLow = events.filter((e) => e.type === "L" && e.time.getTime() > now.getTime())[0];
  const isRising = nextHigh && nextLow ? nextHigh.time < nextLow.time : !!nextHigh;

  return { hoursBefore: closestBefore, hoursAfter: closestAfter, isRising };
}

function tideWindowMultiplier(hoursFromIdeal: number): number {
  if (hoursFromIdeal <= 0) return 1.0;
  if (hoursFromIdeal <= 0.5) return 0.85;
  if (hoursFromIdeal <= 1.0) return 0.60;
  if (hoursFromIdeal <= 1.5) return 0.35;
  return 0.15;
}

/** Get current position in tidal range (0 = low, 1 = high) */
function tideRangePosition(currentHeight: number, events: TideEvent[]): number {
  const heights = events.map((e) => e.heightFt);
  if (heights.length === 0) return 0.5;
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = maxH - minH;
  if (range === 0) return 0.5;
  return clamp((currentHeight - minH) / range, 0, 1);
}

export function scoreTideMultiplier(
  tideWindow: TideWindowType,
  now: Date,
  events: TideEvent[],
  currentHeight: number
): number {
  if (tideWindow.kind === "any") return 1.0;

  const highInfo = hoursUntilOrSince(now, events, "H");
  const lowInfo = hoursUntilOrSince(now, events, "L");
  const isRising = highInfo.isRising;
  const nearestHighHrs = Math.min(highInfo.hoursBefore, highInfo.hoursAfter);
  const nearestLowHrs = Math.min(lowInfo.hoursBefore, lowInfo.hoursAfter);
  const rangePos = tideRangePosition(currentHeight, events);

  let hoursFromIdeal = Infinity;
  let correctDirection = false;

  switch (tideWindow.kind) {
    case "highPlusMinus": {
      hoursFromIdeal = Math.max(0, nearestHighHrs - tideWindow.hoursFromHigh);
      correctDirection = isRising; // approaching high is good
      break;
    }
    case "lowPlusMinus": {
      hoursFromIdeal = Math.max(0, nearestLowHrs - tideWindow.hoursFromLow);
      correctDirection = !isRising; // approaching low is good
      break;
    }
    case "exceptHighPlusMinus": {
      // Good everywhere EXCEPT near high
      if (nearestHighHrs > tideWindow.hoursFromHigh) {
        hoursFromIdeal = 0; // in window
      } else {
        hoursFromIdeal = tideWindow.hoursFromHigh - nearestHighHrs;
      }
      correctDirection = !isRising; // moving away from high is good
      break;
    }
    case "lowerPercent": {
      const threshold = tideWindow.percent / 100;
      if (rangePos <= threshold) {
        hoursFromIdeal = 0;
      } else {
        hoursFromIdeal = (rangePos - threshold) * 3; // scale to hours-equivalent
      }
      correctDirection = !isRising;
      break;
    }
    case "middlePercent": {
      const halfWindow = (tideWindow.percent / 100) / 2;
      const center = 0.5;
      const distFromCenter = Math.abs(rangePos - center);
      if (distFromCenter <= halfWindow) {
        hoursFromIdeal = 0;
      } else {
        hoursFromIdeal = (distFromCenter - halfWindow) * 3;
      }
      correctDirection = true; // either direction fine for mid
      break;
    }
    case "midHighIncoming": {
      const [minBefore, maxBefore] = tideWindow.hoursBeforeHigh;
      if (isRising && highInfo.hoursAfter >= minBefore && highInfo.hoursAfter <= maxBefore) {
        hoursFromIdeal = 0;
      } else if (isRising && highInfo.hoursAfter < minBefore) {
        hoursFromIdeal = minBefore - highInfo.hoursAfter;
      } else if (isRising && highInfo.hoursAfter > maxBefore) {
        hoursFromIdeal = highInfo.hoursAfter - maxBefore;
      } else {
        hoursFromIdeal = 1.5; // wrong direction
      }
      correctDirection = isRising;
      break;
    }
    case "beforeHigh": {
      const [minB, maxB] = tideWindow.hoursBeforeHigh;
      if (isRising && highInfo.hoursAfter >= minB && highInfo.hoursAfter <= maxB) {
        hoursFromIdeal = 0;
      } else if (isRising) {
        hoursFromIdeal = highInfo.hoursAfter < minB
          ? minB - highInfo.hoursAfter
          : highInfo.hoursAfter - maxB;
      } else {
        hoursFromIdeal = 1.5;
      }
      correctDirection = isRising;
      break;
    }
    case "midTideWindow": {
      const halfWindow = tideWindow.hours / 2;
      const distFromMid = Math.abs(rangePos - 0.5);
      const inWindow = distFromMid <= 0.25; // roughly mid-tide
      hoursFromIdeal = inWindow ? 0 : distFromMid * 3;
      correctDirection = true;
      break;
    }
    case "aroundHigh": {
      if (nearestHighHrs < 0.5) {
        return 0.35; // dead high — too full
      }
      if (nearestHighHrs >= 0.5 && nearestHighHrs < 1) {
        return 0.60; // 30–60min from high
      }
      if (nearestHighHrs >= 1 && nearestHighHrs <= tideWindow.hoursFromHigh) {
        return 1.0; // sweet spot — both incoming and outgoing
      }
      if (nearestHighHrs > tideWindow.hoursFromHigh && nearestHighHrs <= tideWindow.hoursFromHigh + 1) {
        return 0.60; // outer buffer — getting too low
      }
      return 0.35; // near dead low
    }
  }

  let mult = tideWindowMultiplier(hoursFromIdeal);
  if (correctDirection && mult < 1.0) {
    mult = Math.min(1.0, mult + 0.05);
  }
  return mult;
}

// ─── Composite Score ─────────────────────────────────────────────────────────

export function computeSpotScore(
  spot: SpotConfig,
  conditions: LiveConditions
): ScoredSpot {
  const faceHeightFt = convertToFaceHeight(conditions.swell.heightMeters, conditions.swell.periodSec, conditions.swell.directionDeg);

  const sizeScore = scoreSizeForSpot(faceHeightFt, spot);
  const swellScore = scoreSwellQuality(
    conditions.swell.directionDeg,
    conditions.swell.periodSec,
    faceHeightFt,
    spot.idealSwellDirections
  );
  const windScore = scoreWind(
    conditions.wind.directionDeg,
    conditions.wind.speedMph,
    spot.idealWindDirections
  );
  const tideMultiplier = scoreTideMultiplier(
    spot.tideWindow,
    conditions.timestamp,
    conditions.tide.events,
    conditions.tide.currentHeightFt
  );

  const baseScore = (sizeScore * 0.35) + (swellScore * 0.43) + (windScore * 0.22);
  const totalScore = Math.round(clamp(baseScore * tideMultiplier, 0, 100));

  return {
    id: spot.id,
    name: spot.name,
    score: totalScore,
    label: labelFromScore(totalScore),
    tag: tagFromScore(totalScore),
    sizeScore: Math.round(sizeScore),
    swellScore: Math.round(swellScore),
    windScore: Math.round(windScore),
    tideMultiplier: Math.round(tideMultiplier * 100) / 100,
    faceHeightFt: Math.round(faceHeightFt * 10) / 10,
  };
}

// ─── Forecast Size Score (bigger is better, no spot windows) ─────────────────

export function scoreSizeForForecast(faceHeightFt: number): number {
  if (faceHeightFt >= 6) return 100;
  if (faceHeightFt <= 0) return 0;
  return Math.round((faceHeightFt / 6) * 100);
}

// ─── Forecast Score (no tide, no spot-specific size) ─────────────────────────

export function computeForecastScore(
  swell: { heightMeters: number; periodSec: number; directionDeg: number },
  wind: { speedMph: number; directionDeg: number },
  idealSwellDirections: CompassDirection[],
  idealWindDirections: CompassDirection[]
): { score: number; sizeScore: number; swellScore: number; windScore: number; faceHeightFt: number } {
  const faceHeightFt = convertToFaceHeight(swell.heightMeters, swell.periodSec, swell.directionDeg);
  const sizeScore = scoreSizeForForecast(faceHeightFt);
  const swellScore = scoreSwellQuality(swell.directionDeg, swell.periodSec, faceHeightFt, idealSwellDirections);
  const windScore = scoreWind(wind.directionDeg, wind.speedMph, idealWindDirections);

  const base = (sizeScore * 0.35) + (swellScore * 0.45) + (windScore * 0.20);
  const score = Math.round(clamp(base, 0, 100));

  return {
    score,
    sizeScore: Math.round(sizeScore),
    swellScore: Math.round(swellScore),
    windScore: Math.round(windScore),
    faceHeightFt: Math.round(faceHeightFt * 10) / 10,
  };
}

// ─── Score Color Utilities (used by components) ──────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#FBBF24";
  return "#FF4F4F";
}

export function scoreBgColor(score: number): string {
  if (score >= 70) return "rgba(74, 222, 128, 0.10)";
  if (score >= 40) return "rgba(251, 191, 36, 0.10)";
  return "rgba(255, 79, 79, 0.10)";
}

export function scoreBorderColor(score: number): string {
  if (score >= 70) return "rgba(74, 222, 128, 0.3)";
  if (score >= 40) return "rgba(251, 191, 36, 0.3)";
  return "rgba(255, 79, 79, 0.3)";
}
