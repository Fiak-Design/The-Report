"use client";

import svgPaths from "./svg/today-paths";
import TideChart, { computeIdealTideWindow } from "@/components/screens/TideChart";
import { spotConfigs } from "@/lib/api/spotsData";
import type { SpotData } from "@/lib/api/spotsData";
import type { TideEvent } from "@/lib/scoring";
import type { SerializedConditions } from "@/app/page";

interface TodayProps {
  topSpot: SpotData;
  conditions: SerializedConditions;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#FBBF24";
  return "#FF4F4F";
}

function scoreBg(score: number): string {
  if (score >= 70) return "rgba(74,222,128,0.1)";
  if (score >= 40) return "rgba(251,191,36,0.1)";
  return "rgba(255,90,90,0.1)";
}

function degToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function LeftSide() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Left Side">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center pb-[3px] pl-[10px] relative size-full">
          <div className="h-[21px] relative rounded-[24px] shrink-0 w-[54px]" data-name="_StatusBar-time">
            <p className="-translate-x-1/2 absolute font-['SF_Pro_Text:Semibold',sans-serif] h-[20px] leading-[21px] left-[27px] not-italic text-[16px] text-center text-white top-px tracking-[-0.32px] w-[54px]">9:41</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrueDepthCamera() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(0,0,0,0)] h-[37px] left-[calc(50%-22.5px)] rounded-[100px] top-1/2 w-[80px]" data-name="TrueDepth camera" />;
}

function FaceTimeCamera() {
  return <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(0,0,0,0)] left-[calc(50%+44px)] rounded-[100px] size-[37px] top-1/2" data-name="FaceTime camera" />;
}

function DynamicIsland() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0" data-name="Dynamic Island">
      <div className="bg-[rgba(0,0,0,0)] h-[37px] relative rounded-[100px] shrink-0 w-[125px]" data-name="StatusBar-dynamicIsland">
        <TrueDepthCamera />
        <FaceTimeCamera />
      </div>
    </div>
  );
}

function SignalWifiBattery() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Signal, Wifi, Battery">
      <div className="h-[12px] relative shrink-0 w-[18px]" data-name="Icon / Mobile Signal">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 12">
          <g id="Icon / Mobile Signal">
            <path d={svgPaths.p1ec31400} fill="var(--fill-0, white)" />
            <path d={svgPaths.p19f8d480} fill="var(--fill-0, white)" />
            <path d={svgPaths.p13f4aa00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1bfb7500} fill="var(--fill-0, white)" />
          </g>
        </svg>
      </div>
      <div className="h-[11.834px] relative shrink-0 w-[17px]" data-name="Wifi">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 11.8338">
          <path d={svgPaths.p17a4bf30} fill="var(--fill-0, white)" id="Wifi" />
        </svg>
      </div>
      <div className="h-[13px] relative shrink-0 w-[27.401px]" data-name="_StatusBar-battery">
        <div className="-translate-y-1/2 absolute h-[13px] left-0 right-[2.4px] top-1/2" data-name="Outline">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 13">
            <path d={svgPaths.p3f827980} id="Outline" opacity="0.35" stroke="var(--stroke-0, white)" />
          </svg>
        </div>
        <div className="-translate-y-1/2 absolute h-[4.22px] right-0 top-[calc(50%+0.61px)] w-[1.401px]" data-name="Battery End">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.40119 4.22034">
            <path d={svgPaths.p237cb000} fill="var(--fill-0, white)" id="Battery End" opacity="0.4" />
          </svg>
        </div>
        <div className="-translate-y-1/2 absolute h-[9px] left-[2px] right-[4.4px] top-1/2" data-name="Fill">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 9">
            <path d={svgPaths.pa544c00} fill="var(--fill-0, white)" id="Fill" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Right Side">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pr-[11px] relative size-full">
          <SignalWifiBattery />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex h-[59px] items-end justify-center left-1/2 top-0 w-[393px]" data-name="StatusBar">
      <LeftSide />
      <DynamicIsland />
      <RightSide />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[68.291px] overflow-clip relative shrink-0 w-full" data-name="SVG">
      <div className="absolute bottom-[3.68px] h-[52.84px] left-0 right-[-0.08%]">
        <div className="absolute inset-[-1.89%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 326.262 54.8398">
            <path d={svgPaths.p1e1d4200} id="Vector 21" stroke="var(--stroke-0, #007FFF)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[0_23.33%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 173.867 68.2908">
          <path d={svgPaths.p108cf000} fill="var(--fill-0, #4ADE80)" fillOpacity="0.1" id="Vector" />
        </svg>
      </div>
      <p className="absolute font-['SF_Pro_Display:Regular',sans-serif] leading-none left-0 not-italic text-[9px] text-[rgba(255,255,255,0.75)] top-[48.61px] w-[56.094px]">6am L</p>
      <p className="absolute font-['SF_Pro_Display:Regular',sans-serif] leading-none not-italic right-[-0.26px] text-[9px] text-[rgba(255,255,255,0.75)] text-right top-[48.61px] w-[59.615px]">6pm L</p>
      <div className="absolute inset-[5.71%_76.67%_0_23.33%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.990109 64.3885">
            <path d="M0.495054 0V64.3885" id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeDasharray="2.97 1.98" strokeWidth="0.990109" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[5.71%_23.33%_0_76.67%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.990109 64.3885">
            <path d="M0.495054 0V64.3885" id="Vector" stroke="var(--stroke-0, #4ADE80)" strokeDasharray="2.97 1.98" strokeWidth="0.990109" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.51%_62.35%_67.78%_35.31%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.62573 8">
          <path d={svgPaths.p24786e00} fill="var(--fill-0, #F97316)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function MarkerPin2() {
  return (
    <div className="h-[45.283px] relative shrink-0 w-[44.709px]" data-name="marker-pin-04">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44.7092 45.2825">
        <g clipPath="url(#clip0_1_1953)" id="marker-pin-04">
          <path d={svgPaths.p557900} id="Vector 3" stroke="var(--stroke-0, white)" strokeWidth="2.2" />
        </g>
        <defs>
          <clipPath id="clip0_1_1953">
            <rect fill="white" height="45.2825" width="44.7092" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MarkerPin() {
  return (
    <div className="relative shrink-0 size-[44.709px]" data-name="marker-pin-04">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44.7092 44.7092">
        <g id="marker-pin-04">
          <path d={svgPaths.pf553d80} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.2" />
          <path d={svgPaths.p1442b500} id="Icon_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
          <circle cx="22.3546" cy="15.358" fill="var(--fill-0, white)" id="Ellipse 1" r="2.71135" />
        </g>
      </svg>
    </div>
  );
}

function MarkerPin1() {
  return (
    <div className="relative shrink-0 size-[44.709px]" data-name="marker-pin-04">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44.7092 44.7092">
        <g id="marker-pin-04">
          <path d={svgPaths.p34298f00} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[39.94px] top-[16.36px] w-[246.128px]">
      <MarkerPin2 />
      <MarkerPin />
      <MarkerPin1 />
    </div>
  );
}

function ConditionBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  const rightPct = `${100 - value}%`;
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
      <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[12px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] text-right w-[36.406px]">
        <p className="leading-none">{label}</p>
      </div>
      <div className="flex-[1_0_0] h-[4px] min-h-px min-w-px relative">
        <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0.1)] h-[4px] left-[0.39px] overflow-clip right-[-3.8px] rounded-[2px] top-1/2" data-name="Background">
          <div
            className="absolute rounded-[2px]"
            style={{ inset: `0 ${rightPct} 0 0`, backgroundColor: color }}
            data-name="Background"
          />
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const r = 29;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative shrink-0 size-[66px]">
      <svg className="absolute block inset-0 size-full" viewBox="0 0 66 66" fill="none">
        <circle cx="33" cy="33" r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="5" fill="none" />
        <circle
          cx="33"
          cy="33"
          r={r}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 33 33)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-['riant-display',sans-serif] font-bold not-italic text-[26px] text-white" style={{ lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {score}
      </div>
    </div>
  );
}

function freshnessColor(fetchedAt: string): string {
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  const ageMin = ageMs / 60000;
  if (ageMin < 2) return "#4ADE80";       // green — just updated
  if (ageMin < 120) return "#FBBF24";     // yellow — up to 2 hours
  return "#FF4F4F";                        // red — stale
}

export default function Today({ topSpot, conditions }: TodayProps) {
  const updatedTime = new Date(conditions.fetchedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const dotColor = freshnessColor(conditions.fetchedAt);
  const dateHeader = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const windDir = degToCompass(conditions.wind.directionDeg);
  const windSpeed = Math.round(conditions.wind.speedMph);
  const windGusts = Math.round(conditions.wind.speedMph * 1.5);
  const swellDir = degToCompass(conditions.swell.directionDeg);

  // Look up spot's tide window config for the tide chart
  const spotConfig = spotConfigs.find((c) => c.id === topSpot.id);
  const tideWindowConfig = spotConfig?.tideWindow;
  const parsedTideEvents: TideEvent[] = (conditions.tideEvents || []).map((e) => ({
    time: new Date(e.time), heightFt: e.heightFt, type: e.type,
  }));
  const idealWin = tideWindowConfig ? computeIdealTideWindow(tideWindowConfig, parsedTideEvents) : null;
  const hasIdealWindow = idealWin !== null || tideWindowConfig?.kind === "any";
  const idealWindowLabel = tideWindowConfig?.kind === "any"
    ? "Any tide"
    : idealWin ? idealWin.label : null;

  return (
    <div className="bg-[#050b19] overflow-clip relative rounded-[30px] size-full" data-name="Today">
      <div className="hidden"><StatusBar /></div>

      {/* Frame48 */}
      <div className="-translate-x-1/2 absolute bottom-[24.46px] content-stretch flex flex-col gap-[8px] items-center left-1/2">
        <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)] tracking-[0.8px] uppercase whitespace-nowrap">
          <p className="leading-[normal]">{dateHeader}</p>
        </div>

        {/* Green card (Home Widgets - score card) */}
        <div
          className="content-stretch flex flex-col gap-[20px] items-start justify-center p-[20px] relative rounded-[30px] shrink-0 w-[366px]"
          style={{ backgroundColor: scoreBg(topSpot.score) }}
          data-name="Home Widgets"
        >
          <div
            aria-hidden="true"
            className="absolute border border-solid inset-0 pointer-events-none rounded-[30px]"
            style={{ borderColor: scoreBg(topSpot.score) }}
          />

          {/* Frame54 */}
          <div className="content-stretch flex flex-col gap-[18px] items-center relative shrink-0 w-full">
            {/* Frame44 */}
            <div className="content-stretch flex flex-col gap-[15px] items-start relative shrink-0 w-full">
              {/* Frame43 - tags row */}
              <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                {topSpot.tag !== null && (
                  <div className="bg-[rgba(249,115,22,0.2)] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" data-name="Tags">
                    <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#f97316] text-[10px] tracking-[0.8px] uppercase whitespace-nowrap">
                      <p className="leading-none">{topSpot.tag}</p>
                    </div>
                  </div>
                )}
                {topSpot.topPick && (
                  <div className="content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" style={{ backgroundColor: scoreBg(topSpot.score) }} data-name="Tags">
                    <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] tracking-[0.8px] uppercase whitespace-nowrap" style={{ color: scoreColor(topSpot.score) }}>
                      <p className="leading-none">Top Pick</p>
                    </div>
                  </div>
                )}
                <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-auto" data-name="Tags">
                  <div className="relative shrink-0 size-[7.736px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.73584 7.73584">
                      <circle cx="3.86792" cy="3.86792" fill={dotColor} id="Ellipse 1" r="3.86792" />
                    </svg>
                  </div>
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">
                    <p className="leading-none">Updated {updatedTime}</p>
                  </div>
                </div>
              </div>
              {/* Spot name */}
              <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[36px] text-white w-full">
                <p className="leading-none">{topSpot.name}</p>
              </div>
            </div>

            {/* Frame57 - score bars + ring */}
            <div className="content-stretch flex gap-[30px] items-center relative shrink-0 w-full">
              {/* Frame46 - bars */}
              <div className="content-stretch flex flex-1 flex-col gap-[6px] items-start relative">
                <ConditionBar label="Size" value={topSpot.conditions.size.value} />
                <ConditionBar label="Period" value={topSpot.conditions.swellDir.value} />
                <ConditionBar label="Wind" value={topSpot.conditions.wind.value} />
                <ConditionBar label="Tide" value={topSpot.conditions.tide.value} />
              </div>
              <ScoreRing score={topSpot.score} />
            </div>
          </div>

          {/* Frame55 - Tide Today chart */}
          <div className="content-stretch flex flex-col gap-[5.607px] items-start justify-center relative shrink-0 w-full">
            <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold h-[11.213px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] tracking-[0.8px] uppercase w-[289.971px]">
              <p className="leading-none">Tide Today</p>
            </div>
            <TideChart events={conditions.tideEvents} tideWindow={tideWindowConfig} />
            {/* Frame41 - time labels */}
            <div className="content-stretch flex font-['SF_Pro_Display:Regular',sans-serif] items-center justify-between leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-full whitespace-nowrap">
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">6am</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">9am</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">Noon</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">3pm</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">6pm</p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0">
                <p className="leading-none">9pm</p>
              </div>
            </div>
          </div>

          {/* Frame20 - Ideal window */}
          <div className="content-stretch flex items-start justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0 max-w-full overflow-hidden" style={{ backgroundColor: hasIdealWindow ? scoreBg(topSpot.score) : "rgba(255,79,79,0.1)" }}>
            <div className="font-['SF_Pro_Display:Bold',sans-serif] not-italic relative shrink-0 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: hasIdealWindow ? scoreColor(topSpot.score) : "#FF4F4F", lineHeight: "normal" }}>
              {hasIdealWindow ? `✓ Ideal window: ${idealWindowLabel}` : "✕ No ideal window today"}
            </div>
          </div>
        </div>

        {/* HomeWidgets - blue card */}
        <div className="bg-[#007fff] content-stretch flex flex-col gap-[18px] items-center p-[20px] relative rounded-[40px] shrink-0 w-[366px]" data-name="Home Widgets">
          <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[40px]" />

          {/* Frame9 - swell data */}
          <div className="content-stretch flex h-[70px] items-center justify-between relative shrink-0 w-full">
            {/* Frame8 - swell height */}
            <div className="content-stretch flex flex-col h-full items-start justify-between not-italic relative shrink-0">
              <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center leading-[0] min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
                <p className="leading-none">Swell Height</p>
              </div>
              <div className="content-stretch flex gap-[6px] items-end relative shrink-0 whitespace-nowrap">
                <p className="font-['riant-display',sans-serif] font-bold leading-none relative shrink-0 text-[55px] text-white">{topSpot.faceHeightFt.toFixed(1)}</p>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] relative shrink-0 text-[32px] text-[rgba(255,255,255,0.75)]">
                  <p className="leading-none">ft</p>
                </div>
              </div>
            </div>

            {/* Frame6 - period/direction/temp */}
            <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0 w-[165.005px]">
              {/* Frame4 - data row */}
              <div className="content-stretch flex h-[30px] items-center justify-between leading-[0] not-italic relative shrink-0 w-full">
                {/* Period */}
                <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
                    <p className="leading-none">Period</p>
                  </div>
                  <div className="content-stretch flex gap-px items-end relative shrink-0 whitespace-nowrap">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">{`${conditions.swell.periodSec} `}</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">sec</p>
                    </div>
                  </div>
                </div>
                {/* Direction */}
                <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0 w-[40px]">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Direction</p>
                  </div>
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center min-w-full relative shrink-0 text-[18px] text-white w-[min-content]">
                    <p className="leading-none">{swellDir}</p>
                  </div>
                </div>
                {/* Water Temp */}
                <div className="content-stretch flex flex-col h-full items-start justify-between relative shrink-0 whitespace-nowrap">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                    <p className="leading-none">Water Temp</p>
                  </div>
                  <div className="content-stretch flex gap-px items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">{`48 `}</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[11px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-[normal]">{"\u00B0F"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Frame5 - updated + source */}
              <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-auto" data-name="Tags">
                  <div className="relative shrink-0 size-[7.736px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.73584 7.73584">
                      <circle cx="3.86792" cy="3.86792" fill={dotColor} id="Ellipse 1" r="3.86792" />
                    </svg>
                  </div>
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">
                    <p className="leading-[normal]">Updated {updatedTime}</p>
                  </div>
                </div>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[10px] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.75)] w-[min-content]">
                  <p className="leading-[normal]">Source: NOAA NDBC 44098</p>
                </div>
              </div>
            </div>
          </div>

          {/* Frame56 - wind + tide stacked cards */}
          <div className="content-stretch flex flex-col gap-[12px] relative shrink-0 w-full">
            {/* Wind card */}
            <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col gap-[12px] items-start px-[14px] pt-[12px] pb-[16px] relative rounded-[12px] shrink-0 w-full" data-name="home-Widget-Stats">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
              {/* Header with badge + updated + source */}
              <div className="content-stretch flex items-center gap-[8px] relative shrink-0">
                <div className="bg-[rgba(255,255,255,0.2)] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[0.8px] uppercase whitespace-nowrap">
                    <p className="leading-none">Wind</p>
                  </div>
                </div>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
                  <p className="leading-none">Updated {updatedTime} • Source: Open-Meteo</p>
                </div>
              </div>
              {/* Single row: Direction | Speed | Gusts | Trend */}
              <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Direction</p>
                  </div>
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
                    <p className="leading-none">{windDir}</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Speed</p>
                  </div>
                  <div className="content-stretch flex gap-[3px] items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">{windSpeed}</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">mph</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Gusts</p>
                  </div>
                  <div className="content-stretch flex gap-[3px] items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">{windGusts}</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">mph</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Trend</p>
                  </div>
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
                    <p className="leading-none">Steady</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tide card */}
            <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col gap-[12px] items-start px-[14px] pt-[12px] pb-[16px] relative rounded-[12px] shrink-0 w-full" data-name="home-Widget-Stats">
              <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[12px]" />
              {/* Header with badge + updated + source */}
              <div className="content-stretch flex items-center gap-[8px] relative shrink-0">
                <div className="bg-[rgba(255,255,255,0.2)] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white tracking-[0.8px] uppercase whitespace-nowrap">
                    <p className="leading-none">Tides</p>
                  </div>
                </div>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[9px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
                  <p className="leading-none">Updated {updatedTime} • Source: NOAA</p>
                </div>
              </div>
              {/* Single row: Direction | Next High | Next Low | Range */}
              <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Direction</p>
                  </div>
                  <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white whitespace-nowrap">
                    <p className="leading-none">{"\u2191 Mid"}</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Next High</p>
                  </div>
                  <div className="content-stretch flex gap-[3px] items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">2:34</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">pm</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Next Low</p>
                  </div>
                  <div className="content-stretch flex gap-[3px] items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">9:12</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">pm</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
                  <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] whitespace-nowrap">
                    <p className="leading-none">Range</p>
                  </div>
                  <div className="content-stretch flex gap-[3px] items-end relative shrink-0">
                    <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white">
                      <p className="leading-none">8.6</p>
                    </div>
                    <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)]">
                      <p className="leading-none">ft</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav bar */}
          <div className="h-[78px] relative rounded-[100px] shrink-0 w-[326px]" data-name="Nav" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", background: "rgba(255, 255, 255, 0.15)" }}>
            <div className="overflow-clip relative rounded-[inherit] size-full">
              <div className="absolute bg-[rgba(255,255,255,0.2)] inset-[6.54px_206.35px_6.54px_6.94px] rounded-[100px]" />
              <Frame />
            </div>
            <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.25)] border-solid inset-0 pointer-events-none rounded-[100px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
