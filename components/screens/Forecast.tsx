"use client";

import svgPaths from "./svg/forecast-paths";
import type { ForecastDayData } from "@/lib/api/forecastData";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── ScoreRing ──────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const size = 74;
  const r = size / 2 - 3;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);
  return (
    <div className="relative shrink-0 size-[74px]">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="white" strokeOpacity="0.1" strokeWidth={5.55} fill="none" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-['riant-display',sans-serif] font-bold not-italic text-[36px] text-center text-white" style={{ lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {score}
      </div>
      <svg className="absolute block inset-0 size-full" fill="none" viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={5.55} fill="none" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── ForecastCard ───────────────────────────────────────────────────────────

function ForecastCard({ day }: { day: ForecastDayData }) {
  const bg = scoreBg(day.score);
  const idealColor = scoreColor(day.score);
  const idealBg = scoreBg(day.score);

  return (
    <button className="cursor-pointer relative rounded-[30px] shrink-0 w-full text-left" style={{ backgroundColor: bg }} data-name="Forcast Widget" data-forecast-id={day.id}>
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[30px]" style={{ borderColor: bg }} />
      <div className="content-stretch flex flex-col items-start px-[16px] py-[20px] relative w-full">
        <div className="content-stretch flex flex-col gap-[12px] items-end relative shrink-0 w-full">
          {/* Header: left info + right score ring */}
          <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
            <div className="content-stretch flex flex-col items-start justify-between relative self-stretch shrink-0">
              {/* Tag + date row */}
              <div className="content-stretch flex gap-[9px] items-center relative shrink-0">
                {day.tag && (
                  <div className="bg-[rgba(249,115,22,0.2)] content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" data-name="Tags">
                    <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#f97316] text-[10px] text-left tracking-[0.8px] uppercase whitespace-nowrap">
                      <p className="leading-none">{day.tag}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] text-left tracking-[0.8px] uppercase whitespace-nowrap">
                  <p className="leading-none">{day.date}</p>
                </div>
              </div>
              {/* Day label */}
              <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[26px] text-left text-white w-[min-content]">
                <p className="leading-none">{day.dayLabel}</p>
              </div>
              {/* Ideal window badge */}
              <div className="content-stretch flex items-start justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0" style={{ backgroundColor: idealBg }}>
                <div className="flex flex-col font-['SF_Pro_Display:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-left whitespace-nowrap" style={{ color: idealColor }}>
                  <p className="leading-none">{`✓ Ideal: ${day.idealWindow} @ ${day.idealSpot}`}</p>
                </div>
              </div>
            </div>
            <ScoreRing score={day.score} />
          </div>
          {/* Divider */}
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute inset-[-0.5px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 334 1">
                <path d="M0 0.5H334" stroke="var(--stroke-0, white)" strokeOpacity="0.1" />
              </svg>
            </div>
          </div>
          {/* Swell data row */}
          <div className="content-stretch flex items-end justify-between leading-[0] not-italic relative shrink-0 text-left w-full">
            {/* Big swell height */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[107.75px]">
              <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] h-[11px] justify-center min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
                <p className="leading-none">Swell Height</p>
              </div>
              <div className="content-stretch flex gap-[4px] items-end relative shrink-0 whitespace-nowrap">
                <div className="flex flex-col font-['riant-display',sans-serif] font-bold justify-center relative shrink-0 text-[36px] text-white">
                  <p className="leading-none">{`${day.waveHeightFt} `}</p>
                </div>
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[20px] text-[rgba(255,255,255,0.75)]">
                  <p className="leading-[normal]">ft</p>
                </div>
              </div>
            </div>
            {/* 4 small stat columns */}
            <div className="content-stretch flex h-[30px] items-center justify-between relative shrink-0 w-[214px]">
              <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative">
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center min-w-full relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-[min-content]">
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
                <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center relative shrink-0 text-[10px] text-[rgba(255,255,255,0.75)] w-full whitespace-nowrap">
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
      </div>
    </button>
  );
}

// ─── StatusBar components ───────────────────────────────────────────────────

function LeftSide() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Left Side">
      <div className="flex flex-col items-center justify-center size-full">
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

// ─── Nav bar icons ──────────────────────────────────────────────────────────

function MarkerPin2() {
  return (
    <button className="block cursor-pointer h-[45.283px] relative shrink-0 w-[44.709px]" data-name="marker-pin-04">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44.7092 45.2825">
        <g clipPath="url(#clip0_1_3377)" id="marker-pin-04">
          <path d={svgPaths.p557900} id="Vector 3" stroke="var(--stroke-0, white)" strokeWidth="2.2" />
        </g>
        <defs>
          <clipPath id="clip0_1_3377">
            <rect fill="white" height="45.2825" width="44.7092" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function MarkerPin() {
  return (
    <button className="block cursor-pointer relative shrink-0 size-[44.709px]" data-name="marker-pin-04">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44.7092 44.7092">
        <g id="marker-pin-04">
          <path d={svgPaths.pf553d80} id="Icon" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2.2" />
          <path d={svgPaths.p1442b500} id="Icon_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
          <circle cx="22.3546" cy="15.358" fill="var(--fill-0, white)" id="Ellipse 1" r="2.71135" />
        </g>
      </svg>
    </button>
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

// ─── Main component ─────────────────────────────────────────────────────────

function freshnessColor(fetchedAt: string): string {
  const ageMs = Date.now() - new Date(fetchedAt).getTime();
  const ageMin = ageMs / 60000;
  if (ageMin < 2) return "#4ADE80";
  if (ageMin < 120) return "#FBBF24";
  return "#FF4F4F";
}

export default function Forecast({ forecast, fetchedAt }: { forecast: ForecastDayData[]; fetchedAt: string }) {
  const updatedTime = new Date(fetchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const dotColor = freshnessColor(fetchedAt);
  return (
    <div className="bg-[#050b19] overflow-clip relative rounded-[20px] size-full" data-name="Forcast">
      {/* Card list */}
      <div className="absolute content-stretch flex flex-col gap-[8px] h-[733px] items-start left-[14px] overflow-x-clip overflow-y-auto top-[118px] w-[366px]">
        {forecast.map((day) => (
          <ForecastCard key={day.id} day={day} />
        ))}
        <div className="h-[120px] relative rounded-[30px] shrink-0 w-full">
          <div className="content-stretch flex flex-col items-start px-[16px] py-[20px] size-full" />
        </div>
      </div>
      <div className="hidden"><StatusBar /></div>
      <div className="-translate-x-1/2 absolute bottom-[44.49px] content-stretch flex items-center justify-between left-1/2 px-[40px] py-[16px] rounded-[100px] w-[326px]" data-name="Nav 2" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", background: "rgba(255, 255, 255, 0.15)" }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.25)] border-solid inset-0 pointer-events-none rounded-[100px]" />
        <div className="absolute bg-[rgba(255,255,255,0.2)] bottom-[6.18px] left-[206.29px] rounded-[100px] top-[6.18px] w-[112.709px]" />
        <MarkerPin2 />
        <MarkerPin />
        <MarkerPin1 />
      </div>
      {/* Header */}
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[4px] items-start left-1/2 top-[59px] w-[210.736px]">
        <div className="flex flex-col font-['riant-display',sans-serif] font-bold h-[31px] justify-center leading-[0] not-italic relative shrink-0 text-[28px] text-center text-white w-full">
          <p className="leading-[normal]">Forecast</p>
        </div>
        <div className="content-stretch flex gap-[5px] items-center justify-center relative shrink-0 w-full">
          <div className="relative shrink-0 size-[7.736px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.73584 7.73584">
              <circle cx="3.86792" cy="3.86792" fill={dotColor} id="Ellipse 1" r="3.86792" />
            </svg>
          </div>
          <div className="flex flex-col font-['SF_Pro_Display:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
            <p className="leading-[normal]">Updated {updatedTime} • NH Seacoast</p>
          </div>
        </div>
      </div>
    </div>
  );
}
