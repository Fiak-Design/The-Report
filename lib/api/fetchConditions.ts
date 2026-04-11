import type { LiveConditions, TideEvent, DailyWind, DailyWave } from "@/lib/scoring";

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cachedConditions: LiveConditions | null = null;
let cachedAt = 0;

// ─── NDBC Buoy 44098 (Swell) ────────────────────────────────────────────────

async function fetchSwell(): Promise<LiveConditions["swell"]> {
  const url = "https://www.ndbc.noaa.gov/data/realtime2/44098.txt";
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const text = await res.text();
  const lines = text.trim().split("\n");

  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].trim().split(/\s+/);
    if (cols.length < 12) continue;
    const wvht = parseFloat(cols[8]);
    const dpd = parseFloat(cols[9]);
    const mwd = parseFloat(cols[11]);
    if (wvht > 50 || dpd > 50 || mwd > 360) continue;
    return { heightMeters: wvht, periodSec: dpd, directionDeg: mwd };
  }
  throw new Error("No valid NDBC data rows found");
}

// ─── Open-Meteo (Wind — 5 days) ─────────────────────────────────────────────

interface WindResult {
  current: { speedMph: number; directionDeg: number };
  daily: DailyWind[];
}

async function fetchWind(): Promise<WindResult> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=42.99&longitude=-70.74&hourly=windspeed_10m,winddirection_10m&wind_speed_unit=mph&forecast_days=5&timezone=America/New_York";
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const json = await res.json();

  const now = new Date();
  const currentHour = now.getHours();
  const hourly = json.hourly;

  // Current wind
  let idx = 0;
  if (hourly?.time) {
    for (let i = 0; i < hourly.time.length; i++) {
      const t = new Date(hourly.time[i]);
      if (t.getDate() === now.getDate() && t.getHours() === currentHour) {
        idx = i;
        break;
      }
    }
  }

  const current = {
    speedMph: hourly?.windspeed_10m?.[idx] ?? 10,
    directionDeg: hourly?.winddirection_10m?.[idx] ?? 270,
  };

  // Daily averages for forecast
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dailyMap = new Map<string, { speeds: number[]; dirs: number[] }>();

  if (hourly?.time) {
    for (let i = 0; i < hourly.time.length; i++) {
      const date = hourly.time[i].split("T")[0];
      if (!dailyMap.has(date)) dailyMap.set(date, { speeds: [], dirs: [] });
      const entry = dailyMap.get(date)!;
      // Only use daytime hours (6am-8pm) for surf-relevant averages
      const hour = new Date(hourly.time[i]).getHours();
      if (hour >= 6 && hour <= 20) {
        if (hourly.windspeed_10m?.[i] != null) entry.speeds.push(hourly.windspeed_10m[i]);
        if (hourly.winddirection_10m?.[i] != null) entry.dirs.push(hourly.winddirection_10m[i]);
      }
    }
  }

  const todayStr = now.toISOString().split("T")[0];
  const daily: DailyWind[] = [];
  let dayIndex = 0;

  for (const [date, data] of Array.from(dailyMap)) {
    const avgSpeed = data.speeds.length > 0 ? data.speeds.reduce((a: number, b: number) => a + b, 0) / data.speeds.length : 10;
    const avgDir = data.dirs.length > 0 ? data.dirs.reduce((a: number, b: number) => a + b, 0) / data.dirs.length : 270;
    const d = new Date(date + "T12:00:00");
    let label: string;
    if (date === todayStr) {
      label = "Today";
    } else if (dayIndex === 1) {
      label = "Tomorrow";
    } else {
      label = dayNames[d.getDay()];
    }
    daily.push({ date, dayLabel: label, avgSpeedMph: Math.round(avgSpeed), avgDirectionDeg: Math.round(avgDir) });
    dayIndex++;
  }

  return { current, daily };
}

// ─── NOAA Tides (Station 8429489 — 5 days) ─────────────────────────────────

async function fetchTides(): Promise<LiveConditions["tide"]> {
  const now = new Date();
  const begin = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead

  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?station=8429489&product=predictions&datum=MLLW` +
    `&time_zone=lst_ldt&interval=hilo&units=english&format=json` +
    `&begin_date=${encodeURIComponent(fmt(begin))}&end_date=${encodeURIComponent(fmt(end))}`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  const json = await res.json();

  const events: TideEvent[] = (json.predictions || []).map((p: { t: string; v: string; type: string }) => ({
    time: new Date(p.t),
    heightFt: parseFloat(p.v),
    type: p.type === "H" ? "H" as const : "L" as const,
  }));

  let currentHeightFt = 3.0;
  if (events.length >= 2) {
    const nowMs = now.getTime();
    let before: TideEvent | null = null;
    let after: TideEvent | null = null;
    for (const ev of events) {
      if (ev.time.getTime() <= nowMs) before = ev;
      if (ev.time.getTime() > nowMs && !after) after = ev;
    }
    if (before && after) {
      const total = after.time.getTime() - before.time.getTime();
      const elapsed = nowMs - before.time.getTime();
      const t = total > 0 ? elapsed / total : 0;
      const cos_t = (1 - Math.cos(t * Math.PI)) / 2;
      currentHeightFt = before.heightFt + (after.heightFt - before.heightFt) * cos_t;
    } else if (before) {
      currentHeightFt = before.heightFt;
    }
  }

  return { events, currentHeightFt };
}

// ─── Open-Meteo Marine (Wave Forecast — 5 days) ─────────────────────────────

async function fetchWaveForecast(): Promise<DailyWave[]> {
  const url =
    "https://marine-api.open-meteo.com/v1/marine?latitude=42.99&longitude=-70.74&hourly=wave_height,wave_period,wave_direction&forecast_days=5&timezone=America/New_York";
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const json = await res.json();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hourly = json.hourly;

  const dailyMap = new Map<string, { heights: number[]; periods: number[]; dirs: number[] }>();

  if (hourly?.time) {
    for (let i = 0; i < hourly.time.length; i++) {
      const date = hourly.time[i].split("T")[0];
      const hour = new Date(hourly.time[i]).getHours();
      if (hour < 6 || hour > 18) continue; // daytime only
      if (!dailyMap.has(date)) dailyMap.set(date, { heights: [], periods: [], dirs: [] });
      const entry = dailyMap.get(date)!;
      if (hourly.wave_height?.[i] != null) entry.heights.push(hourly.wave_height[i]);
      if (hourly.wave_period?.[i] != null) entry.periods.push(hourly.wave_period[i]);
      if (hourly.wave_direction?.[i] != null) entry.dirs.push(hourly.wave_direction[i]);
    }
  }

  const result: DailyWave[] = [];
  let dayIndex = 0;
  for (const [date, data] of Array.from(dailyMap)) {
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a: number, b: number) => a + b, 0) / arr.length : 0;
    const d = new Date(date + "T12:00:00");
    let label: string;
    if (date === todayStr) label = "Today";
    else if (dayIndex === 1) label = "Tomorrow";
    else label = dayNames[d.getDay()];

    result.push({
      date,
      dayLabel: label,
      avgHeightMeters: avg(data.heights),
      avgPeriodSec: avg(data.periods),
      avgDirectionDeg: avg(data.dirs),
    });
    dayIndex++;
  }

  return result;
}

// ─── Main Fetch (with cache & fallback) ──────────────────────────────────────

export async function fetchLiveConditions(): Promise<LiveConditions> {
  const now = Date.now();
  if (cachedConditions && now - cachedAt < CACHE_TTL_MS) {
    return cachedConditions;
  }

  try {
    const [swell, windResult, tide, waveForecast] = await Promise.all([
      fetchSwell(),
      fetchWind(),
      fetchTides(),
      fetchWaveForecast(),
    ]);

    const conditions: LiveConditions = {
      swell,
      wind: windResult.current,
      tide,
      forecastWind: windResult.daily,
      forecastWave: waveForecast,
      timestamp: new Date(),
    };

    cachedConditions = conditions;
    cachedAt = now;
    return conditions;
  } catch (err) {
    console.error("Failed to fetch live conditions:", err);

    if (cachedConditions) {
      console.warn("Using stale cached conditions");
      return cachedConditions;
    }

    return {
      swell: { heightMeters: 0.9, periodSec: 10, directionDeg: 135 },
      wind: { speedMph: 8, directionDeg: 270 },
      tide: {
        events: [
          { time: new Date(new Date().setHours(6, 0)), heightFt: 0.5, type: "L" },
          { time: new Date(new Date().setHours(12, 0)), heightFt: 8.5, type: "H" },
          { time: new Date(new Date().setHours(18, 30)), heightFt: 0.8, type: "L" },
        ],
        currentHeightFt: 3.0,
      },
      forecastWind: [],
      forecastWave: [],
      timestamp: new Date(),
    };
  }
}
