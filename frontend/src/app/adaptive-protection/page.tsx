"use client";

import React, { useState } from "react";
import { 
  Wind, 
  Droplets, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  Flame,
  Volume2,
  Sparkles
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";

export default function AdaptiveProtectionPage() {
  const { data, isFahrenheit, setFanSpeed } = useTelemetry();

  const intervention = data?.intervention;
  const currentHI = data?.forecasting?.current?.heat_index ?? 39.4;
  const riskLevel = data?.forecasting?.current?.risk_level ?? "DANGER";
  const fanSpeed = intervention?.fan_speed_pct ?? 85;
  const fanMode = intervention?.mode ?? "AUTO";
  const misting = intervention?.misting_active ?? true;
  const effectiveness = intervention?.effectiveness_score ?? 93.3;
  const coolingDelta = intervention?.estimated_delta_celsius ?? 3.2;
  const recs = intervention?.recommendations;

  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: true,
  });

  const toggleCheck = (idx: number) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Wind className="w-4 h-4 animate-spin" />
            Closed-Loop Autonomous Thermal Defense
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Adaptive Protection & Actuator Control
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Continuously regulates high-volume industrial fans and high-pressure evaporative misting solenoids based on predictive thermal accumulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">EFFECTIVENESS INDEX</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{effectiveness.toFixed(1)}% EFFICIENT</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">THERMAL DELTA</span>
            <span className="text-xs font-bold font-mono text-cyan-300">-{coolingDelta.toFixed(1)}°C / HR</span>
          </div>
        </div>
      </div>

      {/* Actuator Control Console Grid */}
      <div className="w-full">
        
        {/* Animated Fan Blade Visualizer & Direct Control */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-cyan-500/30 space-y-6 flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-400" />
                Adaptive Cooling Turbine (PWM D9 & D10)
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Trigger: <strong className="text-cyan-300">{intervention?.trigger_reason || "AUTO_OPTIMAL"}</strong>
              </span>
            </div>

            {/* Mode Toggle Switch */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono">
              <button
                onClick={() => setFanSpeed("AUTO")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  fanMode === "AUTO"
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Auto Edge AI
              </button>
              <button
                onClick={() => setFanSpeed("MANUAL", fanSpeed)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  fanMode === "MANUAL"
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Manual Override
              </button>
            </div>
          </div>

          {/* Big Visual Turbine Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center py-4">
            
            {/* Spinning Fan Graphic */}
            <div className="relative flex items-center justify-center p-8 rounded-2xl bg-slate-950/80 border border-cyan-500/20">
              <div 
                className="w-40 h-40 rounded-full border-4 border-dashed border-cyan-500/40 flex items-center justify-center transition-all"
                style={{
                  animation: fanSpeed > 0 ? `spin ${Math.max(0.3, 3 - (fanSpeed / 35))}s linear infinite` : "none"
                }}
              >
                <Wind className="w-24 h-24 text-cyan-400 opacity-90" />
              </div>

              {/* Center RPM / Duty Cycle Readout */}
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black font-mono text-white glow-cyan-text">
                  {fanSpeed}%
                </span>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {fanSpeed > 0 ? `${Math.round(fanSpeed * 28)} RPM` : "STANDBY"}
                </span>
              </div>
            </div>

            {/* Live Sliders and Metrics */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    PWM Duty Cycle Output (0 - 255)
                  </span>
                  <span className="text-cyan-300 font-bold">{Math.round(fanSpeed * 2.55)} / 255</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={fanSpeed}
                  onChange={(e) => setFanSpeed("MANUAL", parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Misting Solenoid:</span>
                  <div className={`text-sm font-bold mt-1 flex items-center gap-1.5 ${misting ? "text-cyan-300" : "text-slate-500"}`}>
                    <Droplets className="w-4 h-4" />
                    {misting ? "ENGAGED (120 PSI)" : "DEACTIVATED"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Ventilation Louver:</span>
                  <div className="text-sm font-bold mt-1 text-emerald-400 flex items-center gap-1.5">
                    <Wind className="w-4 h-4" />
                    {fanSpeed > 20 ? "100% OPEN" : "CLOSED"}
                  </div>
                </div>
              </div>

              {/* Emergency Override Button */}
              <button
                onClick={() => setFanSpeed("MANUAL", 100)}
                className="w-full py-3 rounded-xl font-bold text-xs font-mono uppercase tracking-wider bg-red-600/20 text-red-300 border border-red-500/50 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Emergency Full Extraction Boost (100% PWM)
              </button>
            </div>

          </div>

          <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span>Hardware Failsafe: Hardwired Low-Side MOSFET on GPIO D9</span>
            <span className="text-emerald-400">No Thermal Throttle Detected</span>
          </div>

        </div>

      </div>

    </div>
  );
}

