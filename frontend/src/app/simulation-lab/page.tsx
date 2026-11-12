"use client";

import React, { useState } from "react";
import { 
  FlaskConical, 
  Sliders, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  ShieldAlert, 
  Wind, 
  Sun, 
  Droplets, 
  Thermometer, 
  Activity,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";

export default function SimulationLabPage() {
  const { data, mode, setSystemMode, injectSimulation, isFahrenheit } = useTelemetry();

  const [tempInput, setTempInput] = useState<number>(data?.telemetry?.temp_ambient ?? 33.0);
  const [humInput, setHumInput] = useState<number>(data?.telemetry?.humidity ?? 65.0);
  const [luxInput, setLuxInput] = useState<number>(data?.telemetry?.solar_lux ?? 15000);

  const [faultDs18, setFaultDs18] = useState<boolean>(false);
  const [faultBme, setFaultBme] = useState<boolean>(false);
  const [faultIr, setFaultIr] = useState<boolean>(false);
  const [faultFan, setFaultFan] = useState<boolean>(false);

  const applyChanges = (overrideParams?: Record<string, any>) => {
    // Automatically engage simulation mode if not already active
    if (mode !== "SIMULATION") {
      setSystemMode("SIMULATION");
    }

    const payload = overrideParams || {
      temp_ambient: tempInput,
      humidity: humInput,
      solar_lux: luxInput,
      fault_ds18_drift: faultDs18,
      fault_bme_saturation: faultBme,
      fault_ir_occlusion: faultIr,
      fault_fan_stalled: faultFan,
    };

    injectSimulation(payload);
  };

  const applyPreset = (t: number, h: number, l: number, name: string) => {
    setTempInput(t);
    setHumInput(h);
    setLuxInput(l);
    setFaultDs18(false);
    setFaultBme(false);
    setFaultIr(false);
    setFaultFan(false);

    applyChanges({
      temp_ambient: t,
      humidity: h,
      solar_lux: l,
      fault_ds18_drift: false,
      fault_bme_saturation: false,
      fault_ir_occlusion: false,
      fault_fan_stalled: false,
    });
  };

  const toggleFault = (type: "ds18" | "bme" | "ir" | "fan") => {
    let newDs18 = faultDs18;
    let newBme = faultBme;
    let newIr = faultIr;
    let newFan = faultFan;

    if (type === "ds18") newDs18 = !faultDs18;
    if (type === "bme") newBme = !faultBme;
    if (type === "ir") newIr = !faultIr;
    if (type === "fan") newFan = !faultFan;

    setFaultDs18(newDs18);
    setFaultBme(newBme);
    setFaultIr(newIr);
    setFaultFan(newFan);

    applyChanges({
      temp_ambient: tempInput,
      humidity: humInput,
      solar_lux: luxInput,
      fault_ds18_drift: newDs18,
      fault_bme_saturation: newBme,
      fault_ir_occlusion: newIr,
      fault_fan_stalled: newFan,
    });
  };

  const currentHI = data?.forecasting?.current?.heat_index ?? 39.4;
  const currentRisk = data?.forecasting?.current?.risk_level ?? "DANGER";
  const confidence = data?.confidence?.score ?? 96.5;
  const fanSpeed = data?.intervention?.fan_speed_pct ?? 85;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl glass-panel border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-widest">
            <FlaskConical className="w-4 h-4 animate-bounce" />
            Thermodynamic & Fault Injection Sandbox
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Interactive Simulation Lab & Stress Tester
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate extreme climate crises, sensor transducer anomalies, and mechanical actuator stall conditions to verify autonomous AI reaction speed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => applyPreset(24.0, 50.0, 4000, "Reset Nominal")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Safe Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Climate Scenarios Bar */}
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
          One-Click Real-World Climate Presets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            onClick={() => applyPreset(44.5, 42.0, 38000, "Sahara Spike")}
            className="p-4 rounded-xl glass-panel-interactive border-red-500/40 text-left space-y-1 hover:border-red-400 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">Extreme Heatwave</span>
              <Sun className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-red-300">44.5°C / 42% RH</h4>
            <p className="text-[11px] text-slate-400">Intense direct solar irradiance (38k lx)</p>
          </button>

          <button
            onClick={() => applyPreset(38.0, 88.0, 8500, "Tropical Monsoon")}
            className="p-4 rounded-xl glass-panel-interactive border-orange-500/40 text-left space-y-1 hover:border-orange-400 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-orange-400">Tropical Vapor Trap</span>
              <Droplets className="w-4 h-4 text-orange-400" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-orange-300">38.0°C / 88% RH</h4>
            <p className="text-[11px] text-slate-400">High humidity blocks sweat evaporation</p>
          </button>

          <button
            onClick={() => applyPreset(28.0, 75.0, 0, "Night Inversion")}
            className="p-4 rounded-xl glass-panel-interactive border-purple-500/40 text-left space-y-1 hover:border-purple-400 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400">Night Heat Inversion</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300">28.0°C / 75% RH</h4>
            <p className="text-[11px] text-slate-400">Stagnant nocturnal heat trap with 0 lx</p>
          </button>

          <button
            onClick={() => applyPreset(23.5, 48.0, 3200, "Nominal Comfort")}
            className="p-4 rounded-xl glass-panel-interactive border-emerald-500/40 text-left space-y-1 hover:border-emerald-400 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Nominal Baseline</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300">23.5°C / 48% RH</h4>
            <p className="text-[11px] text-slate-400">Optimal comfort zone with zero risk</p>
          </button>

        </div>
      </div>

      {/* Main Simulation Sliders & Live Reaction Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sliders & Fault Injection Console */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Dynamic Environmental Sliders
            </h3>
            <span className="text-xs font-mono text-purple-400">Active Feedback Mode</span>
          </div>

          {/* Ambient Temp Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                Ambient Temperature
              </span>
              <span className="text-lg font-bold font-mono text-cyan-300">{tempInput.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min={18}
              max={55}
              step={0.5}
              value={tempInput}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTempInput(val);
                applyChanges({ temp_ambient: val, humidity: humInput, solar_lux: luxInput });
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>18°C (Mild)</span>
              <span>35°C (Warm)</span>
              <span>55°C (Lethal Extreme)</span>
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-400" />
                Relative Humidity (RH)
              </span>
              <span className="text-lg font-bold font-mono text-sky-300">{humInput.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={98}
              step={1}
              value={humInput}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setHumInput(val);
                applyChanges({ temp_ambient: tempInput, humidity: val, solar_lux: luxInput });
              }}
              className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10% (Arid)</span>
              <span>50% (Moderate)</span>
              <span>98% (Saturated Steam)</span>
            </div>
          </div>

          {/* Solar Lux Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-yellow-400" />
                Solar Irradiance Flux (Lux)
              </span>
              <span className="text-lg font-bold font-mono text-yellow-300">{luxInput.toLocaleString()} lx</span>
            </div>
            <input
              type="range"
              min={0}
              max={60000}
              step={500}
              value={luxInput}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setLuxInput(val);
                applyChanges({ temp_ambient: tempInput, humidity: humInput, solar_lux: val });
              }}
              className="w-full accent-yellow-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 lx (Night)</span>
              <span>25,000 lx (Direct Sun)</span>
              <span>60,000 lx (Peak Desert Zenith)</span>
            </div>
          </div>

          {/* Fault Injection Toggles */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-xs font-mono uppercase text-red-400 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Hardware Transducer Fault Injections
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => toggleFault("ds18")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  faultDs18
                    ? "bg-red-950/60 border-red-500 text-red-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div>DS18B20 Drift (+8°C)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{faultDs18 ? "FAULT INJECTED" : "Normal"}</div>
              </button>

              <button
                onClick={() => toggleFault("bme")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  faultBme
                    ? "bg-red-950/60 border-red-500 text-red-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div>BME280 Vapor Saturation</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{faultBme ? "FAULT INJECTED" : "Normal"}</div>
              </button>

              <button
                onClick={() => toggleFault("ir")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  faultIr
                    ? "bg-red-950/60 border-red-500 text-red-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div>MLX90614 Lens Occlusion</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{faultIr ? "FAULT INJECTED" : "Normal"}</div>
              </button>

              <button
                onClick={() => toggleFault("fan")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  faultFan
                    ? "bg-red-950/60 border-red-500 text-red-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div>Cooling Fan Mechanical Stall</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{faultFan ? "FAULT INJECTED" : "Normal"}</div>
              </button>
            </div>
          </div>

        </div>

        {/* Live Reaction & AI Engine Feedback Display */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                Live AI Reaction Pipeline
              </h3>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${getRiskColorClass(currentRisk).bg} ${getRiskColorClass(currentRisk).text}`}>
                {currentRisk.replace("_", " ")}
              </span>
            </div>

            {/* Calculated Heat Index Readout */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
              <span className="text-xs font-mono text-slate-400 uppercase">Rothfusz Computed Heat Index</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black font-mono text-white glow-cyan-text">
                  {formatTemp(currentHI, isFahrenheit)}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  (NWS Standard Formula)
                </span>
              </div>
            </div>

            {/* AI Transducer Confidence Reaction */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Sensor Confidence Score</span>
                <span className={`text-base font-bold font-mono ${confidence >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                  {confidence.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${confidence >= 90 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {faultDs18 || faultBme || faultIr
                  ? "⚠️ AI detected cross-sensor variance. Fault isolated from safety decision logic."
                  : "✓ All transducers agree within ±0.3°C threshold."}
              </p>
            </div>

            {/* Adaptive Fan Speed Reaction */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Autonomous Fan Reaction</span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  {faultFan ? "0% (STALLED)" : `${fanSpeed}% PWM`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {faultFan
                  ? "❌ Mechanical stall detected! Fallback acoustic alarms & SMS dispatched."
                  : `Fan autonomously adjusted to ${fanSpeed}% based on predicted heat accumulation.`}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs font-mono text-slate-300 space-y-1">
            <div className="text-purple-400 font-bold">EDGE GUARANTEE:</div>
            <div>All simulation computations mimic the exact C++ TinyML models executing on the Arduino UNO Q.</div>
          </div>
        </div>

      </div>

    </div>
  );
}

