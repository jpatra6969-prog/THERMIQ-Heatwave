"use client";

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  Gauge, 
  Zap, 
  RefreshCw, 
  Activity, 
  AlertTriangle,
  Sliders,
  Tv
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";

export default function CommandCenterPage() {
  const { data, isConnected, mode, setSystemMode, isFahrenheit, toggleUnit, setFanSpeed, apiUrl } = useTelemetry();
  
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<"ALL" | "TEMP" | "HUMIDITY" | "HEAT_INDEX">("ALL");

  // Keep a running buffer for real-time chart
  useEffect(() => {
    if (!data?.telemetry) return;

    const timeLabel = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newPoint = {
      time: timeLabel,
      temp: data.telemetry.temp_ambient,
      humidity: data.telemetry.humidity,
      heat_index: data.forecasting?.current?.heat_index ?? 33.0,
      lux: data.telemetry.solar_lux / 200, // scaled for chart
      ds18: data.telemetry.temp_probe_ds18,
    };

    setHistoryData((prev) => {
      const updated = [...prev, newPoint];
      if (updated.length > 25) updated.shift();
      return updated;
    });
  }, [data]);

  // Initial history fetch from backend if empty
  useEffect(() => {
    const fetchInitHistory = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/telemetry/history?limit=20`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const formatted = list.map((item: any) => ({
              time: item.timestamp.split("T")[1]?.slice(0, 8) || "now",
              temp: item.temp_ambient,
              humidity: item.humidity,
              heat_index: item.heat_index,
              lux: item.solar_lux / 200,
              ds18: item.temp_probe_ds18,
            }));
            setHistoryData(formatted);
          }
        }
      } catch (e) {
        // use live buffer
      }
    };
    fetchInitHistory();
  }, [apiUrl]);

  const t = data?.telemetry ?? {
    temp_ambient: 32.8,
    humidity: 64.2,
    solar_lux: 15400,
    temp_probe_ds18: 33.1,
    temp_ir_object: 36.9,
    temp_ir_ambient: 32.6,
    gas_resistance: 46200,
    iaq_index: 48,
    pressure_hpa: 1012.8,
  };

  const hi = data?.forecasting?.current?.heat_index ?? 39.4;
  const riskLevel = data?.forecasting?.current?.risk_level ?? "DANGER";
  const riskTheme = getRiskColorClass(riskLevel);
  const confidence = data?.confidence?.score ?? 96.5;
  const fanPct = data?.intervention?.fan_speed_pct ?? 85;
  const misting = data?.intervention?.misting_active ?? true;
  const fanMode = data?.intervention?.mode ?? "AUTO";

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Risk Level & High Alert Header */}
      <div className={`p-6 rounded-2xl border ${riskTheme.border} ${riskTheme.bg} ${riskTheme.glow} transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-950/80 border ${riskTheme.border} relative shadow-lg`}>
              <Flame className={`w-8 h-8 ${riskTheme.text} animate-pulse`} />
              <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${riskTheme.dot}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Heat Stress Threat Level:
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-black uppercase ${riskTheme.text} bg-slate-950/70 border ${riskTheme.border}`}>
                  {riskLevel.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
                {formatTemp(hi, isFahrenheit)} <span className="text-sm font-mono font-normal text-slate-300">Heat Index</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {data?.forecasting?.current?.warning || "Continuous microclimate telemetry monitored by Arduino UNO Q."}
              </p>
            </div>
          </div>

          {/* Quick Hardware & Controller Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">TELEMETRY SOURCE</span>
              <span className="text-xs font-bold font-mono text-cyan-300 flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {mode === "LIVE_HARDWARE" ? "ARDUINO UNO Q (LIVE)" : "SIMULATOR ENGINE"}
              </span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">EDGE CONFIDENCE</span>
              <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {confidence.toFixed(1)}% (OPTIMAL)
              </span>
            </div>

            <button
              onClick={() => setSystemMode(mode === "LIVE_HARDWARE" ? "SIMULATION" : "LIVE_HARDWARE")}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to {mode === "LIVE_HARDWARE" ? "Simulation" : "Live"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 8 Primary Environmental Transducer Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Ambient Temp */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Ambient Temp (BME280)</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {formatTemp(t.temp_ambient, isFahrenheit)}
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80">I2C 0x76</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (t.temp_ambient / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Relative Humidity */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Humidity (BME280)</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {t.humidity.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-sky-400/80">RH Vapor</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, t.humidity)}%` }}
            />
          </div>
        </div>

        {/* Card 3: IR Surface Pyrometer (MLX90614) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Surface IR (MLX90614)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {formatTemp(t.temp_ir_object, isFahrenheit)}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Amb: {t.temp_ir_ambient.toFixed(1)}°C</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (t.temp_ir_object / 60) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Solar Irradiance Lux (VEML7700) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Solar Lux (VEML7700)</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-yellow-300">
              {t.solar_lux.toLocaleString()} <span className="text-xs font-normal text-slate-400">lx</span>
            </span>
            <span className="text-[10px] font-mono text-yellow-400/80">Direct Lux</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (t.solar_lux / 40000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 5: Core Immersion Probe (DS18B20) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Probe (DS18B20)</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
              {formatTemp(t.temp_probe_ds18, isFahrenheit)}
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80">1-Wire D4</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (t.temp_probe_ds18 / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 6: Air Quality & VOC Gas (BME688) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Gas & IAQ (BME688)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-300">
              {t.iaq_index.toFixed(0)} <span className="text-xs font-normal text-slate-400">IAQ</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{(t.gas_resistance / 1000).toFixed(0)} kΩ</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-purple-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (t.iaq_index / 200) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 7: Barometric Pressure (BME280) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Pressure (BME280)</span>
            <Radio className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-teal-300">
              {t.pressure_hpa.toFixed(1)} <span className="text-xs font-normal text-slate-400">hPa</span>
            </span>
            <span className="text-[10px] font-mono text-teal-400/80">Barometric</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `75%` }}
            />
          </div>
        </div>

        {/* Card 8: Actuator Fan & Solenoid Status */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-2 relative overflow-hidden bg-gradient-to-br from-slate-900 to-cyan-950/30">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Adaptive Fan PWM</span>
            <Wind className={`w-4 h-4 text-cyan-400 ${fanPct > 0 ? "animate-spin" : ""}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
              {fanPct}%
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              {fanMode}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Misting Solenoid:</span>
            <span className={misting ? "text-cyan-400 font-bold" : "text-slate-500"}>
              {misting ? "ACTIVE (HIGH)" : "OFF"}
            </span>
          </div>
        </div>

      </div>

      {/* Real-Time Graphs & Interactive Live Chart */}
      <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Live Telemetry Stream (High-Frequency Realtime)
            </h3>
            <p className="text-xs text-slate-400">
              Direct feed from Arduino UNO Q Edge Buffer & Rothfusz Predictive Regression Engine
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            {(["ALL", "TEMP", "HUMIDITY", "HEAT_INDEX"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedMetric === m
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-cyan-300"
                }`}
              >
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b1120",
                  borderColor: "#06b6d4",
                  borderRadius: "0.75rem",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />

              {(selectedMetric === "ALL" || selectedMetric === "HEAT_INDEX") && (
                <Area
                  type="monotone"
                  dataKey="heat_index"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHI)"
                  name="Heat Index (°C)"
                />
              )}

              {(selectedMetric === "ALL" || selectedMetric === "TEMP") && (
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  name="Ambient Temp (°C)"
                />
              )}

              {(selectedMetric === "ALL" || selectedMetric === "HUMIDITY") && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#colorHum)"
                  name="Humidity (%)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Protection Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Fan Override Quick Slider */}
        <div className="glass-panel rounded-2xl p-5 border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Manual Fan Override
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300">{fanPct}%</span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={fanPct}
            onChange={(e) => setFanSpeed("MANUAL", parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <button
              onClick={() => setFanSpeed("AUTO")}
              className={`px-3 py-1 rounded-md transition-all ${
                fanMode === "AUTO"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Set Auto AI
            </button>
            <button
              onClick={() => setFanSpeed("MANUAL", 100)}
              className="px-3 py-1 rounded-md bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white transition-all font-bold"
            >
              MAX BOOST (100%)
            </button>
          </div>
        </div>

        {/* 7-inch HMI Status */}
        <div className="glass-panel rounded-2xl p-5 border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 flex items-center gap-2">
              <Tv className="w-4 h-4 text-sky-400" />
              7" HMI Touch Console
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400">
            Physical Nextion 800x480 resistive touch screen synchronized over UART Serial2 (115200 baud).
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-cyan-300">
            <span>Mirroring UI Frame:</span>
            <span className="text-emerald-400 font-bold">ACTIVE 60 FPS</span>
          </div>
        </div>

        {/* EC200U Cellular Modem */}
        <div className="glass-panel rounded-2xl p-5 border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              EC200U LTE Cat-1 Link
            </span>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              -68 dBm (EXCELLENT)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Failsafe off-grid uplink. Streams emergency SMS broadcast alerts when local WiFi bridges disconnect.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Carrier:</span>
            <span className="text-slate-200">Industrial IoT Private APN</span>
          </div>
        </div>

      </div>

    </div>
  );
}

