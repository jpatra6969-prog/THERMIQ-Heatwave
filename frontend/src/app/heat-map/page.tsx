"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Flame, 
  Compass
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";
import { MapZone } from "@/components/LeafletMap";

// Dynamic import with SSR disabled to guarantee Leaflet only runs client-side
const DynamicLeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((mod) => mod.LeafletMap),
  { ssr: false, loading: () => (
    <div className="w-full h-[620px] sm:h-[680px] lg:h-[720px] rounded-none bg-[#06090E] flex items-center justify-center border border-[#1D2F40] text-[#00D9E8] font-mono text-xs">
      Loading Futuristic Leaflet GIS Engine...
    </div>
  )}
);

export default function HeatMapPage() {
  const { data, isFahrenheit } = useTelemetry();
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);
  const [viewMode, setViewMode] = useState<"BLUEPRINT" | "LEAFLET">("LEAFLET");
  const [filterType, setFilterType] = useState<"ALL" | "OUTDOOR" | "INDOOR">("ALL");

  const baseTemp = data?.telemetry?.temp_ambient ?? 32.8;
  const baseHI = data?.forecasting?.current?.heat_index ?? 39.4;
  const baseHum = data?.telemetry?.humidity ?? 64.2;
  const baseLux = data?.telemetry?.solar_lux ?? 15400;

  function roundNum(val: number) {
    return Math.round(val * 10) / 10;
  }

  // Dynamic zones synchronized with live telemetry + GPS coordinates
  const zones: (MapZone & { gridX: number; gridY: number })[] = [
    {
      id: "zone-5",
      name: "Electrical Transformer Vault",
      type: "CONFINED",
      lat: 28.6130,
      lng: 77.2088,
      gridX: 50,
      gridY: 50,
      temp: roundNum(baseTemp + 4.5),
      heat_index: roundNum(baseHI + 5.1),
      humidity: roundNum(baseHum - 10),
      solar_lux: 150,
      risk: "EXTREME_DANGER",
      sensors: ["DS18B20", "BME688 VOC"],
      mcu: "Hardwired Failsafe Relay",
    },
  ];

  useEffect(() => {
    if (!selectedZone) setSelectedZone(zones[0]);
  }, []);

  const filteredZones = zones.filter((z) => {
    if (filterType === "ALL") return true;
    if (filterType === "OUTDOOR") return z.type === "OUTDOOR";
    if (filterType === "INDOOR") return z.type === "INDOOR" || z.type === "CONFINED";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
        <div>
          <div className="flex items-center gap-2 text-[#00D9E8] text-xs font-mono uppercase tracking-widest">
            <Compass className="w-4 h-4 animate-spin" />
            Spatial Thermal Microclimate Matrix (Leaflet GIS)
          </div>
          <h1 className="text-3xl font-black text-[#FAF5EB] mt-1">
            Interactive Heat Map & Hotspot Spatial Grid
          </h1>
          <p className="text-sm text-[#D0D9E2] mt-1">
            Real-time thermal spatial dispersion mapping across outdoor work yards, indoor confined spaces, and worker recovery shelters.
          </p>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-none bg-[#06090E] border border-[#1D2F40] text-xs font-mono">
            <button
              onClick={() => setViewMode("LEAFLET")}
              className={`px-3 py-1.5 rounded-none transition-all ${
                viewMode === "LEAFLET"
                  ? "bg-[#00D9E8] text-[#06090E] font-bold shadow-md"
                  : "text-[#D0D9E2] hover:text-[#FAF5EB]"
              }`}
            >
              Leaflet GIS Map
            </button>
            <button
              onClick={() => setViewMode("BLUEPRINT")}
              className={`px-3 py-1.5 rounded-none transition-all ${
                viewMode === "BLUEPRINT"
                  ? "bg-[#00D9E8] text-[#06090E] font-bold shadow-md"
                  : "text-[#D0D9E2] hover:text-[#FAF5EB]"
              }`}
            >
              Blueprint Grid
            </button>
          </div>

          <div className="flex p-1 rounded-none bg-[#06090E] border border-[#1D2F40] text-xs font-mono">
            {(["ALL", "OUTDOOR", "INDOOR"] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-2.5 py-1.5 rounded-none transition-all ${
                  filterType === ft
                    ? "bg-[#1E252E] text-[#00D9E8] font-bold"
                    : "text-[#D0D9E2] hover:text-[#FAF5EB]"
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map: Interactive Visualizer Canvas Extended Larger to Bottom */}
      <div className="w-full rounded-none bg-[#0D141F] border border-[#1D2F40] p-6 relative flex flex-col justify-between overflow-hidden shadow-lg shadow-black/40 min-h-[700px] lg:min-h-[780px]">
        
        {viewMode === "LEAFLET" ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs font-mono text-[#D0D9E2]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00D9E8] animate-ping" />
                LEAFLET CARTO DARK ENGINE • REAL-TIME THERMAL RADIUS
              </span>
              <span className="text-[#00D9E8]">Click markers to center & inspect telemetry</span>
            </div>
            
            <div className="flex-1 w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[720px]">
              <DynamicLeafletMap
                zones={filteredZones}
                selectedZone={selectedZone}
                onSelectZone={(z) => setSelectedZone(z)}
                isFahrenheit={isFahrenheit}
                className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] rounded-none overflow-hidden border border-[#1D2F40]"
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] flex flex-col justify-between rounded-none overflow-hidden border border-[#1D2F40] bg-[#06090E]">
            {/* Map Canvas Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1D2F40_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

            {/* SVG Architectural Boundaries & Thermal Heat Rings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <rect x="25%" y="25%" width="50%" height="50%" fill="rgba(239, 35, 60, 0.05)" stroke="#EF233C" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="27%" y="30%" fill="#EF233C" fontSize="12" fontFamily="monospace">ZONE-E: ELECTRICAL TRANSFORMER VAULT</text>
            </svg>

            {/* Hotspot Markers on Canvas */}
            <div className="relative z-20 w-full h-full flex items-center justify-center">
              {filteredZones.map((z) => {
                const theme = getRiskColorClass(z.risk);
                const isSelected = selectedZone?.id === z.id;

                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    style={{ left: `${z.gridX}%`, top: `${z.gridY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div
                      className={`absolute -inset-4 rounded-full opacity-40 animate-ping pointer-events-none ${
                        z.risk.includes("DANGER") ? "bg-[#EF233C]" : "bg-[#00D9E8]"
                      }`}
                    />

                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-none transition-all shadow-xl ${
                        isSelected
                          ? "scale-125 border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                          : "border border-[#00D9E8]/60 hover:scale-110"
                      } ${theme.bg}`}
                    >
                      <Flame className={`w-6 h-6 ${theme.text}`} />
                    </div>

                    <div
                      className={`absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap px-3 py-1.5 rounded-none text-xs font-mono font-bold shadow-lg transition-all ${
                        isSelected
                          ? "bg-[#06090E] border border-white text-white"
                          : "bg-[#06090E]/95 border border-[#1D2F40] text-[#D0D9E2] group-hover:border-[#00D9E8]"
                      }`}
                    >
                      {z.name} ({formatTemp(z.heat_index, isFahrenheit)})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Coordinates & Scale Status */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#D0D9E2] pt-4 border-t border-[#1D2F40] mt-4">
          <span>Grid Resolution: 5m Cell Accuracy</span>
          <span className="text-[#00D9E8]">{filteredZones.length} Active Spatial Transducer</span>
        </div>

      </div>

    </div>
  );
}
