import { computeForecastScore, tagFromScore } from "@/lib/scoring";
import { spotConfigs } from "@/lib/api/spotsData";
import type { LiveConditions } from "@/lib/scoring";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ForecastConditions {
  swellDir: { label: string; value: number };
  wind: { label: string; value: number };
  size: { label: string; value: number };
}

export interface ForecastDayData {
  id: string;
  dayLabel: string;
  date: string;
  score: number;
  tag: string | null;
  waveHeightFt: string;
  wavePeriodSec: string;
  swellDir: string;
  windSpeedMph: string;
  windDir: string;
  idealWindow: string;
  idealSpot: string;
  conditions: ForecastConditions;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function degToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function formatDate(dateStr: string, dayLabel: string): string {
  const d = new Date(dateStr + "T12:00:00");
  if (dayLabel === "Today" || dayLabel === "Tomorrow") {
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

// ─── Compute forecast from live data ─────────────────────────────────────────

export function computeForecastDays(conditions: LiveConditions): ForecastDayData[] {
  const { forecastWave, forecastWind } = conditions;
  const days = Math.min(4, forecastWave.length, forecastWind.length);
  if (days === 0) return [];

  const result: ForecastDayData[] = [];

  for (let i = 0; i < days; i++) {
    const wave = forecastWave[i];
    const wind = forecastWind[i];

    // For Today (index 0), use live buoy/wind readings to match the home widget
    const useLive = i === 0;
    const daySwell = useLive
      ? conditions.swell
      : { heightMeters: wave.avgHeightMeters, periodSec: wave.avgPeriodSec, directionDeg: wave.avgDirectionDeg };
    const dayWind = useLive
      ? conditions.wind
      : { speedMph: wind.avgSpeedMph, directionDeg: wind.avgDirectionDeg };

    // Score all spots with this day's swell/wind (no tide)
    const spotScores = spotConfigs.map((config) => ({
      config,
      result: computeForecastScore(daySwell, dayWind, config.idealSwellDirections, config.idealWindDirections),
    }));
    spotScores.sort((a, b) => b.result.score - a.result.score);
    const topSpot = spotScores[0];

    const score = topSpot.result.score;

    const idMap = ["today", "tomorrow"];
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const d = new Date(wave.date + "T12:00:00");
    const id = i < 2 ? idMap[i] : dayNames[d.getDay()];

    result.push({
      id,
      dayLabel: wave.dayLabel,
      date: formatDate(wave.date, wave.dayLabel),
      score,
      tag: tagFromScore(score),
      waveHeightFt: topSpot.result.faceHeightFt.toFixed(1),
      wavePeriodSec: Math.round(daySwell.periodSec).toString(),
      swellDir: degToCompass(daySwell.directionDeg),
      windSpeedMph: Math.round(dayWind.speedMph).toString(),
      windDir: degToCompass(dayWind.directionDeg),
      idealWindow: "10:00am – 2:00pm",
      idealSpot: topSpot.config.name,
      conditions: {
        swellDir: { label: "Swell Dir.", value: topSpot.result.swellScore },
        wind: { label: "Wind", value: topSpot.result.windScore },
        size: { label: "Size", value: topSpot.result.sizeScore },
      },
    });
  }

  return result;
}

// ─── Client-side store ───────────────────────────────────────────────────────

let _forecastData: ForecastDayData[] = [];

export function setForecastData(data: ForecastDayData[]) {
  _forecastData = data;
}

export function getForecastData(): ForecastDayData[] {
  return _forecastData;
}

export function getForecastById(id: string): ForecastDayData | undefined {
  return _forecastData.find((day) => day.id === id);
}
