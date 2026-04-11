import type { Spot } from "@/types";
import { computeSpotScore } from "@/lib/scoring";

const rawSpots = [
  {
    id: "trestles",
    name: "Trestles",
    region: "San Clemente, CA",
    idealSwellDirectionDeg: 270,
    idealWindDirectionDeg: 90,
    conditions: {
      swell: { heightFt: 5, periodSec: 14, directionDeg: 265 },
      wind: { speedMph: 8, directionDeg: 95, type: "offshore" as const },
      tide: { time: new Date().toISOString(), heightFt: 2.8 },
      tideReadings: [
        { time: "00:00", heightFt: 4.2 },
        { time: "02:00", heightFt: 3.8 },
        { time: "04:00", heightFt: 2.9 },
        { time: "06:00", heightFt: 2.1 },
        { time: "08:00", heightFt: 1.8 },
        { time: "10:00", heightFt: 2.4 },
        { time: "12:00", heightFt: 3.6 },
        { time: "14:00", heightFt: 4.8 },
        { time: "16:00", heightFt: 5.1 },
        { time: "18:00", heightFt: 4.6 },
        { time: "20:00", heightFt: 3.9 },
        { time: "22:00", heightFt: 4.3 },
      ],
    },
    bestWindowStart: "6am",
    bestWindowEnd: "10am",
    updatedAt: new Date().toISOString(),
    forecast: [
      { date: "2026-04-12", swellHeightFt: 5, swellPeriodSec: 14, bestWindowStart: "6am", bestWindowEnd: "10am", score: 92 },
      { date: "2026-04-13", swellHeightFt: 4, swellPeriodSec: 13, bestWindowStart: "7am", bestWindowEnd: "11am", score: 78 },
      { date: "2026-04-14", swellHeightFt: 3, swellPeriodSec: 12, bestWindowStart: "6am", bestWindowEnd: "9am",  score: 65 },
      { date: "2026-04-15", swellHeightFt: 6, swellPeriodSec: 15, bestWindowStart: "5am", bestWindowEnd: "10am", score: 88 },
    ],
  },
  {
    id: "blackies",
    name: "Blackies",
    region: "Newport Beach, CA",
    idealSwellDirectionDeg: 255,
    idealWindDirectionDeg: 80,
    conditions: {
      swell: { heightFt: 3, periodSec: 11, directionDeg: 240 },
      wind: { speedMph: 12, directionDeg: 180, type: "cross" as const },
      tide: { time: new Date().toISOString(), heightFt: 3.5 },
      tideReadings: [
        { time: "00:00", heightFt: 3.2 },
        { time: "02:00", heightFt: 2.8 },
        { time: "04:00", heightFt: 2.2 },
        { time: "06:00", heightFt: 1.9 },
        { time: "08:00", heightFt: 2.5 },
        { time: "10:00", heightFt: 3.4 },
        { time: "12:00", heightFt: 4.2 },
        { time: "14:00", heightFt: 4.8 },
        { time: "16:00", heightFt: 4.5 },
        { time: "18:00", heightFt: 3.8 },
        { time: "20:00", heightFt: 3.2 },
        { time: "22:00", heightFt: 3.0 },
      ],
    },
    bestWindowStart: "7am",
    bestWindowEnd: "11am",
    updatedAt: new Date().toISOString(),
    forecast: [
      { date: "2026-04-12", swellHeightFt: 3, swellPeriodSec: 11, bestWindowStart: "7am", bestWindowEnd: "11am", score: 62 },
      { date: "2026-04-13", swellHeightFt: 2, swellPeriodSec: 10, bestWindowStart: "8am", bestWindowEnd: "12pm", score: 48 },
      { date: "2026-04-14", swellHeightFt: 4, swellPeriodSec: 12, bestWindowStart: "6am", bestWindowEnd: "10am", score: 70 },
      { date: "2026-04-15", swellHeightFt: 3, swellPeriodSec: 11, bestWindowStart: "7am", bestWindowEnd: "11am", score: 58 },
    ],
  },
  {
    id: "huntington",
    name: "Huntington Pier",
    region: "Huntington Beach, CA",
    idealSwellDirectionDeg: 270,
    idealWindDirectionDeg: 90,
    conditions: {
      swell: { heightFt: 1.5, periodSec: 9, directionDeg: 200 },
      wind: { speedMph: 18, directionDeg: 270, type: "onshore" as const },
      tide: { time: new Date().toISOString(), heightFt: 4.8 },
      tideReadings: [
        { time: "00:00", heightFt: 3.8 },
        { time: "02:00", heightFt: 3.2 },
        { time: "04:00", heightFt: 3.0 },
        { time: "06:00", heightFt: 3.5 },
        { time: "08:00", heightFt: 4.2 },
        { time: "10:00", heightFt: 5.0 },
        { time: "12:00", heightFt: 5.4 },
        { time: "14:00", heightFt: 5.1 },
        { time: "16:00", heightFt: 4.5 },
        { time: "18:00", heightFt: 3.9 },
        { time: "20:00", heightFt: 3.5 },
        { time: "22:00", heightFt: 3.7 },
      ],
    },
    bestWindowStart: "5am",
    bestWindowEnd: "8am",
    updatedAt: new Date().toISOString(),
    forecast: [
      { date: "2026-04-12", swellHeightFt: 2, swellPeriodSec: 9,  bestWindowStart: "5am", bestWindowEnd: "8am",  score: 32 },
      { date: "2026-04-13", swellHeightFt: 3, swellPeriodSec: 11, bestWindowStart: "6am", bestWindowEnd: "9am",  score: 55 },
      { date: "2026-04-14", swellHeightFt: 2, swellPeriodSec: 10, bestWindowStart: "6am", bestWindowEnd: "9am",  score: 40 },
      { date: "2026-04-15", swellHeightFt: 4, swellPeriodSec: 13, bestWindowStart: "5am", bestWindowEnd: "9am",  score: 72 },
    ],
  },
];

export function getMockSpots(): Spot[] {
  const spots = rawSpots.map((raw) => {
    const { overall, conditionScores } = computeSpotScore(
      raw.conditions,
      raw.idealSwellDirectionDeg
    );
    return {
      ...raw,
      score: overall,
      conditionScores,
    } as Spot;
  });

  // Sort by score descending and assign rank
  spots.sort((a, b) => b.score - a.score);
  spots.forEach((s, i) => (s.rank = i + 1));
  return spots;
}
