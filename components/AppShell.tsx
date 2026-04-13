"use client";

import { useState, useEffect } from "react";
import Today from "@/components/screens/Today";
import Spots from "@/components/screens/Spots";
import Forecast from "@/components/screens/Forecast";
import SpotDetailsSlider from "@/components/screens/SpotDetailsSlider";
import ForecastDetailsSlider from "@/components/screens/ForecastDetailsSlider";
import { setComputedSpots } from "@/lib/api/spotsData";
import { setForecastData } from "@/lib/api/forecastData";
import type { SpotData } from "@/lib/api/spotsData";
import type { ForecastDayData } from "@/lib/api/forecastData";
import type { SerializedConditions } from "@/app/page";

type View = "today" | "spots" | "forecast" | "spot-details" | "forecast-details";

export default function AppShell({ spots, conditions, forecast }: { spots: SpotData[]; conditions: SerializedConditions; forecast: ForecastDayData[] }) {
  const [activeView, setActiveView] = useState<View>("today");
  const [baseView, setBaseView] = useState<"today" | "spots" | "forecast">("today");
  const [selectedSpotId, setSelectedSpotId] = useState<string>(spots[0]?.id ?? "the-wall");
  const [selectedForecastId, setSelectedForecastId] = useState<string>(forecast[0]?.id ?? "today");

  useEffect(() => {
    setComputedSpots(spots);
    setForecastData(forecast);
  }, [spots, forecast]);

  const handleViewChange = (view: View) => {
    if (view === "today" || view === "spots" || view === "forecast") {
      setBaseView(view);
    }
    setActiveView(view);
  };

  return (
    <div className="relative w-full h-screen bg-[#050b19] flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full max-w-[393px] max-h-[852px] sm:rounded-[30px] sm:shadow-2xl bg-[#050b19] overflow-hidden">
        <div
          className={`relative w-full h-full transition-all duration-300 ${
            activeView === "spot-details" || activeView === "forecast-details"
              ? "blur-sm"
              : ""
          }`}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (baseView === "spots") {
              const spotWidget = target.closest('button[data-name="Spot Widget"]');
              if (spotWidget) {
                const spotId = spotWidget.getAttribute("data-spot-id");
                if (spotId) setSelectedSpotId(spotId);
                setActiveView("spot-details");
              }
            }
            if (baseView === "forecast") {
              const forecastWidget = target.closest('button[data-name="Forcast Widget"]');
              if (forecastWidget) {
                const forecastId = forecastWidget.getAttribute("data-forecast-id");
                if (forecastId) setSelectedForecastId(forecastId);
                setActiveView("forecast-details");
              }
            }
          }}
        >
          {baseView === "today" && <Today topSpot={spots.find(s => s.topPick) ?? spots[0]} conditions={conditions} />}
          {baseView === "spots" && <Spots spots={spots} fetchedAt={conditions.fetchedAt} />}
          {baseView === "forecast" && <Forecast forecast={forecast} fetchedAt={conditions.fetchedAt} />}
        </div>

        {activeView === "spot-details" && (
          <div className="absolute inset-x-0 bottom-0 h-[85%] z-30 animate-[slide-up_0.3s_ease-out]">
            <SpotDetailsSlider spotId={selectedSpotId} tideEvents={conditions.tideEvents} onClose={() => setActiveView(baseView)} />
          </div>
        )}

        {activeView === "forecast-details" && (
          <div className="absolute inset-x-0 bottom-0 h-[85%] z-30 animate-[slide-up_0.3s_ease-out]">
            <ForecastDetailsSlider forecastId={selectedForecastId} tideEvents={conditions.tideEvents} onClose={() => setActiveView(baseView)} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none z-40">
          <div className="absolute bottom-[44.5px] left-1/2 -translate-x-1/2 w-[326px] h-[78px] pointer-events-auto">
            <div className="flex items-center justify-between px-[40px] h-full">
              <button onClick={() => handleViewChange("today")} className={`relative z-20 w-[113px] h-[65px] rounded-full transition-all active:scale-95 ${baseView === "today" ? "opacity-100" : "opacity-60"}`} aria-label="Today view" />
              <button onClick={() => handleViewChange("spots")} className={`relative z-20 w-[45px] h-[65px] transition-all active:scale-95 ${baseView === "spots" ? "opacity-100" : "opacity-60"}`} aria-label="Spots view" />
              <button onClick={() => handleViewChange("forecast")} className={`relative z-20 w-[113px] h-[65px] rounded-full transition-all active:scale-95 ${baseView === "forecast" ? "opacity-100" : "opacity-60"}`} aria-label="Forecast view" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
