import { fetchLiveConditions } from "@/lib/api/fetchConditions";
import { computeAllSpots } from "@/lib/api/spotsData";
import { computeForecastDays } from "@/lib/api/forecastData";
import type { ForecastDayData } from "@/lib/api/forecastData";
import AppShell from "@/components/AppShell";

export const revalidate = 1800; // revalidate every 30 minutes

export interface SerializedTideEvent {
  time: string;
  heightFt: number;
  type: "H" | "L";
}

export interface SerializedConditions {
  swell: { heightMeters: number; periodSec: number; directionDeg: number };
  wind: { speedMph: number; directionDeg: number };
  tideEvents: SerializedTideEvent[];
  currentTideHeightFt: number;
  fetchedAt: string; // ISO timestamp of when live data was fetched
}

export default async function Home() {
  const conditions = await fetchLiveConditions();
  const spots = computeAllSpots(conditions);
  const forecast = computeForecastDays(conditions);

  const serialized: SerializedConditions = {
    swell: conditions.swell,
    wind: conditions.wind,
    tideEvents: conditions.tide.events.map((e) => ({
      time: e.time.toISOString(),
      heightFt: e.heightFt,
      type: e.type,
    })),
    currentTideHeightFt: conditions.tide.currentHeightFt,
    fetchedAt: new Date().toISOString(),
  };

  return <AppShell spots={spots} conditions={serialized} forecast={forecast} />;
}
