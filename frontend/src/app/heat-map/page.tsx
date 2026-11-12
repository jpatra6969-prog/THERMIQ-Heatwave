"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Layers, 
  Flame, 
  Thermometer, 
  Sun, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation,
  Compass,
  Building,
  TreePine,
  Maximize2
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";
import { MapZone } from "@/components/LeafletMap";

// Dynamic import with SSR disabled to guarantee Leaflet only runs client-side
const DynamicLeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((mod) => mod.LeafletMap),
  { ssr: false, loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-slate-950 flex items-center justify-center border border-cyan-500/20 text-cyan-400 font-mono text-xs">
      Loading Futuristic Leaflet GIS Engine...
    </div>
  )}
);

export default function HeatMapPage() {
  const { data, isFahrenheit, apiUrl } = useTelemetry();
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
      id: "zone-2",
      name: "Heavy Machinery Enclosure (ESP32 Hub)",
      type: "INDOOR",
      lat: 28.6136,
      lng: 77.2086,
      gridX: 68,
      gridY: 26,
      temp: roundNum(baseTemp + 3.2),
      heat_index: roundNum(baseHI + 4.5),
      humidity: roundNum(Math.min(95, baseHum + 5)),
      solar_lux: 480,
      risk: "EXTREME_DANGER",
      sensors: ["SHT31", "BMP280", "K-Type Thermocouple"],
      mcu: "ESP32-WROOM (ESP-NOW Mesh)",
    },
    {
      id: "zone-3",
      name: "Evaporative Cooling Worker Shelter",
      type: "SHELTER",
      lat: 28.6133,
      lng: 77.2098,
      gridX: 38,
      gridY: 72,
      temp: roundNum(Math.max(22, baseTemp - 7.5)),
      heat_index: roundNum(Math.max(24, baseHI - 9.0)),
      humidity: roundNum(Math.min(90, baseHum + 12)),
      solar_lux: 820,
      risk: "SAFE",
      sensors: ["BME280", "DS18B20"],
      mcu: "Sub-Node Alpha",
    },
    {
      id: "zone-4",
      name: "Perimeter Loading Dock & Asphalt Runway",
      type: "OUTDOOR",
      lat: 28.6148,
      lng: 77.2082,
      gridX: 82,
      gridY: 65,
      temp: roundNum(baseTemp + 1.8),
      heat_index: roundNum(baseHI + 2.2),
      humidity: roundNum(baseHum - 4),
      solar_lux: roundNum(baseLux * 1.2),
      risk: "DANGER",
      sensors: ["MLX90614", "VEML7700"],
      mcu: "Solar Remote Beacon",
    },
    {
      id: "zone-5",
      name: "Electrical Transformer Vault",
      type: "CONFINED",
      lat: 28.6130,
      lng: 77.2088,
      gridX: 18,
      gridY: 62,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Compass className="w-4 h-4 animate-spin" />
            Spatial Thermal Microclimate Matrix (Leaflet GIS)
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Interactive Heat Map & Hotspot Spatial Grid
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time thermal spatial dispersion mapping across outdoor work yards, indoor confined spaces, and worker recovery shelters.
          </p>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode("LEAFLET")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "LEAFLET"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Leaflet GIS Map
            </button>
            <button
              onClick={() => setViewMode("BLUEPRINT")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "BLUEPRINT"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Blueprint Grid
            </button>
          </div>

          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            {(["ALL", "OUTDOOR", "INDOOR"] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  filterType === ft
                    ? "bg-slate-800 text-cyan-300 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map + Selected Zone Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Interactive Visualizer Canvas (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border-cyan-500/30 relative flex flex-col justify-between overflow-hidden min-h-[480px]">
          
          {viewMode === "LEAFLET" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  LEAFLET CARTO DARK ENGINE • REAL-TIME THERMAL RADIUS
                </span>
                <span className="text-cyan-400">Click markers to center & inspect</span>
              </div>
              
              <DynamicLeafletMap
                zones={filteredZones}
                selectedZone={selectedZone}
                onSelectZone={(z) => setSelectedZone(z)}
                isFahrenheit={isFahrenheit}
              />
            </div>
          ) : (
            <div className="relative w-full h-[450px] flex flex-col justify-between">
              {/* Map Canvas Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

              {/* SVG Architectural Boundaries & Thermal Heat Rings */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <rect x="20%" y="20%" width="30%" height="35%" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="22%" y="25%" fill="#06b6d4" fontSize="10" fontFamily="monospace">ZONE-A: ARDUINO CANOPY</text>

                <rect x="60%" y="15%" width="32%" height="40%" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="62%" y="20%" fill="#ef4444" fontSize="10" fontFamily="monospace">ZONE-B: ENCLOSED MACHINERY</text>

                <rect x="30%" y="65%" width="28%" height="25%" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="32%" y="70%" fill="#10b981" fontSize="10" fontFamily="monospace">ZONE-C: RECOVERY SHELTER</text>

                <rect x="75%" y="58%" width="22%" height="30%" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="77%" y="63%" fill="#f97316" fontSize="10" fontFamily="monospace">ZONE-D: LOADING DOCK</text>
              </svg>

              {/* Hotspot Markers on Canvas */}
              <div className="relative z-20 w-full h-[360px] my-auto">
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
                          z.risk.includes("DANGER") ? "bg-red-500" : "bg-cyan-400"
                        }`}
                      />

                      <div
                        className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all shadow-xl ${
                          isSelected
                            ? "scale-125 border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                            : "border border-cyan-400/50 hover:scale-110"
                        } ${theme.bg}`}
                      >
                        <Flame className={`w-5 h-5 ${theme.text}`} />
                      </div>

                      <div
                        className={`absolute left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow-lg transition-all ${
                          isSelected
                            ? "bg-slate-900 border border-white text-white"
                            : "bg-slate-950/90 border border-slate-800 text-slate-300 group-hover:border-cyan-400"
                        }`}
                      >
                        {z.name.split("(")[0]} ({formatTemp(z.heat_index, isFahrenheit)})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Coordinates & Scale Status */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Grid Resolution: 5m Cell Accuracy</span>
            <span className="text-cyan-400">{filteredZones.length} Active Spatial Transducers</span>
          </div>

        </div>

        {/* Selected Zone Deep-Dive Inspection Panel */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-6 flex flex-col justify-between">
          {selectedZone ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                    Zone Telemetry Inspector
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${getRiskColorClass(selectedZone.risk).bg} ${getRiskColorClass(selectedZone.risk).text}`}>
                    {selectedZone.risk.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{selectedZone.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Coordinates: {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E</span>
                  </div>
                </div>

                {/* Big Thermal Dials */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Rothfusz Heat Index</span>
                    <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                      {formatTemp(selectedZone.heat_index, isFahrenheit)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Ambient Temp</span>
                    <div className="text-2xl font-black font-mono text-slate-100 mt-1">
                      {formatTemp(selectedZone.temp, isFahrenheit)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Humidity (RH)</span>
                    <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                      {selectedZone.humidity.toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Solar Lux</span>
                    <div className="text-xl font-bold font-mono text-yellow-300 mt-1">
                      {selectedZone.solar_lux.toLocaleString()} lx
                    </div>
                  </div>
                </div>

                {/* Node Hardware Specifications */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono uppercase text-slate-400">Hardware Node Architecture</span>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                    <div><strong className="text-cyan-300">Processing MCU:</strong> {selectedZone.mcu}</div>
                    <div><strong className="text-cyan-300">Sensors Active:</strong> {selectedZone.sensors.join(", ")}</div>
                    <div><strong className="text-cyan-300">Uplink Protocol:</strong> LoRaWAN / WiFi / EC200U LTE</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => alert(`Autonomous cooling dispatched to ${selectedZone.name}. Misting engaged at 120 PSI.`)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs font-mono bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                >
                  DISPATCH ADAPTIVE COOLING TO ZONE
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs font-mono">
              Click any thermal hotspot marker on the map to inspect live environmental diagnostics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
