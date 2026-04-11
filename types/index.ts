// ─── Score & Conditions ───────────────────────────────────────────────────────

export type ScoreGrade = "firing" | "good" | "fair" | "poor";

export interface ConditionScore {
  label: string;
  value: number; // 0–100
  grade: ScoreGrade;
}

// ─── Surf Data ────────────────────────────────────────────────────────────────

export interface SwellCondition {
  heightFt: number;
  periodSec: number;
  directionDeg: number; // 0–360, meteorological (where swell comes FROM)
}

export interface WindCondition {
  speedMph: number;
  directionDeg: number;
  type: "offshore" | "onshore" | "cross" | "calm";
}

export interface TideReading {
  time: string; // ISO 8601
  heightFt: number;
  type?: "high" | "low";
}

export interface ForecastDay {
  date: string; // ISO 8601 date
  swellHeightFt: number;
  swellPeriodSec: number;
  bestWindowStart: string; // e.g. "6am"
  bestWindowEnd: string;   // e.g. "10am"
  score: number;           // 0–100
}

// ─── Spot ─────────────────────────────────────────────────────────────────────

export interface SpotConditions {
  swell: SwellCondition;
  wind: WindCondition;
  tide: TideReading;
  tideReadings: TideReading[]; // full day curve
}

export interface Spot {
  id: string;
  name: string;
  region: string;
  score: number;             // 0–100, computed
  rank?: number;             // 1-based ranking among all spots
  conditions: SpotConditions;
  conditionScores: {
    swellDirection: ConditionScore;
    wind: ConditionScore;
    tide: ConditionScore;
    size: ConditionScore;
  };
  bestWindowStart: string;
  bestWindowEnd: string;
  updatedAt: string;         // ISO 8601
  forecast: ForecastDay[];
  idealSwellDirectionDeg: number; // spot's ideal swell angle
  idealWindDirectionDeg: number;  // spot's ideal wind angle (offshore)
}
