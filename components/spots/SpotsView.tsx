"use client";

import { useState } from "react";
import type { Spot } from "@/types";
import SpotCard from "./SpotCard";
import SpotDetailSheet from "./SpotDetailSheet";

interface SpotsViewProps {
  spots: Spot[];
}

export default function SpotsView({ spots }: SpotsViewProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div style={{
      maxWidth: 480,
      margin: "0 auto",
      padding: "0 16px 80px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "52px 4px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
          Spots
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34C759" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            Updated {now} · {spots.length} spots
          </span>
        </div>
      </div>

      {/* Spot cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onClick={() => setSelectedSpot(spot)}
          />
        ))}
      </div>

      {/* Detail sheet */}
      {selectedSpot && (
        <SpotDetailSheet
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
        />
      )}
    </div>
  );
}
