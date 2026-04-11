"use client";
import svgPaths from "./svg/forecast-details-paths";
import { getForecastById } from "@/lib/api/forecastData";
import TideChart from "@/components/screens/TideChart";
import type { SerializedTideEvent } from "@/app/page";

interface ForecastDetailsSliderProps {
  forecastId: string;
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

function ConditionBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  const fillPercent = 100 - value;
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
      <div className={`flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] text-right ${label === "Swell Dir." ? "w-auto whitespace-nowrap" : "w-[43.61px]"}`}>
        <p className="leading-[normal]">{label}</p>
      </div>
      <div className="h-[4px] relative shrink-0 w-[283px]">
        <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0.1)] h-[4px] left-[0.39px] overflow-clip right-[-0.39px] rounded-[2px] top-[calc(50%-0.1px)]" data-name="Background">
          <div
            className="absolute rounded-[2px]"
            style={{ backgroundColor: color, inset: `0 ${fillPercent}% 0 0` }}
            data-name="Background"
          />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const ringSize = 89.097;
  const r = ringSize / 2 - 3;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="relative shrink-0 size-[89.097px]">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${ringSize} ${ringSize}`}>
        <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke="white" strokeOpacity="0.1" strokeWidth="6.68" fill="none" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-['riant-display',sans-serif] font-bold not-italic text-[36px] text-white" style={{ lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {score}
      </div>
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={color} strokeWidth="6.68" fill="none" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
      </svg>
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

export default function ForecastDetailsSlider({ forecastId, tideEvents, onClose }: ForecastDetailsSliderProps) {
  const day = getForecastById(forecastId);
  if (!day) return null;

  const idealColor = scoreColor(day.score);
  const idealBg = scoreBgRgba(day.score);

  return (
    <div className="bg-[#050b19] border-[rgba(255,255,255,0.1)] border-l border-r border-solid border-t overflow-clip relative rounded-tl-[36px] rounded-tr-[36px] size-full" data-name="Forecast Details Slider">
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
      <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[24.5px] top-[53px] w-[342px]">
        {/* Header */}
        <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0">
            <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full">
              {day.tag && (
                <div className="bg-[rgba(249,115,22,0.2)] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" data-name="Tags">
                  <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#f97316] text-[10px] tracking-[0.8px] uppercase whitespace-nowrap">
                    <p className="leading-none">{day.tag}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] text-center tracking-[0.8px] uppercase whitespace-nowrap">
                <p className="leading-[normal]">{day.date}</p>
              </div>
            </div>
            <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[36px] text-white w-[min-content]">
              <p className="leading-none">{day.dayLabel}</p>
            </div>
            <div className="content-stretch flex items-start justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" style={{ backgroundColor: idealBg }}>
              <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] whitespace-nowrap" style={{ color: idealColor }}>
                <p className="leading-[normal]">{`✓ Ideal: ${day.idealWindow} @ ${day.idealSpot}`}</p>
              </div>
            </div>
          </div>
          <ScoreRing score={day.score} />
        </div>

        <Divider />

        {/* Swell Stats */}
        <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[6px] items-start leading-[0] not-italic relative shrink-0 w-[107.75px]">
            <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
              <p className="leading-[normal]">Swell Height</p>
            </div>
            <div className="content-stretch flex gap-[4px] items-end relative shrink-0 whitespace-nowrap">
              <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[40px] text-white">
                <p className="leading-[normal]">{`${day.waveHeightFt} `}</p>
              </div>
              <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[20px] text-[rgba(255,255,255,0.75)]">
                <p className="leading-[normal]">ft</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col h-[30px] items-start relative shrink-0">
            <div className="content-stretch flex flex-[1_0_0] items-center justify-between leading-[0] min-h-px min-w-px not-italic relative w-[214.25px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative">
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
                  <p className="leading-none">Period</p>
                </div>
                <div className="content-stretch flex gap-px items-end relative shrink-0 whitespace-nowrap">
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[18px] text-white">
                    <p className="leading-none">{`${day.wavePeriodSec} `}</p>
                  </div>
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                    <p className="leading-none">sec</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative">
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-full whitespace-nowrap">
                  <p className="leading-none">Swell Dir.</p>
                </div>
                <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[18px] text-white w-full">
                  <p className="leading-none">{day.swellDir}</p>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative whitespace-nowrap">
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                  <p className="leading-none">Wind</p>
                </div>
                <div className="content-stretch flex gap-px items-end relative shrink-0">
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[18px] text-white">
                    <p className="leading-none">{day.windSpeedMph}</p>
                  </div>
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                    <p className="leading-none">mph</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative">
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                  <p className="leading-none">Wind Dir.</p>
                </div>
                <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center min-w-full relative shrink-0 text-[18px] text-white w-[min-content]">
                  <p className="leading-none">{day.windDir}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Condition Bars */}
        <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
          <ConditionBar label={day.conditions.swellDir.label} value={day.conditions.swellDir.value} />
          <ConditionBar label={day.conditions.wind.label} value={day.conditions.wind.value} />
          <ConditionBar label={day.conditions.size.label} value={day.conditions.size.value} />
        </div>

        <Divider />

        {/* Tide Chart */}
        <div className="content-stretch flex flex-col gap-[16.82px] items-start relative shrink-0 w-[342px]">
          <div className="content-stretch flex flex-col gap-[5.607px] items-start justify-center relative shrink-0 w-full">
            <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold h-[11.213px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] tracking-[1.0279px] uppercase w-[289.971px]">
              <p className="leading-[normal]">Tide</p>
            </div>
            <TideChart events={tideEvents} />
            <div className="content-stretch flex font-['SF_Pro_Display:Regular',sans-serif] items-center justify-between leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-full whitespace-nowrap">
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">6am</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">9am</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">Noon</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">3pm</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">6pm</p></div>
              <div className="flex flex-col justify-center relative shrink-0"><p className="leading-none">9pm</p></div>
            </div>
          </div>
          <div className="content-stretch flex items-start justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" style={{ backgroundColor: idealBg }}>
            <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] whitespace-nowrap" style={{ color: idealColor }}>
              <p className="leading-[normal]">{`✓ Ideal: ${day.idealWindow} @ ${day.idealSpot}`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-white bottom-[8.29px] h-[5px] left-1/2 rounded-[100px] w-[134px]" data-name="Home Indicator" />
    </div>
  );
}
