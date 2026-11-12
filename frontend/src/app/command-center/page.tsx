"use client";

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Thermometer, 
  Droplets, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Activity
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
  const { data, isConnected, mode, setSystemMode, isFahrenheit, toggleUnit, apiUrl } = useTelemetry();
  
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
  };

  const hi = data?.forecasting?.current?.heat_index ?? 39.4;
  const riskLevel = data?.forecasting?.current?.risk_level ?? "DANGER";
  const riskTheme = getRiskColorClass(riskLevel);
  const confidence = data?.confidence?.score ?? 96.5;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Risk Level & High Alert Header */}
      <div className={`p-6 rounded-none border ${riskTheme.border} ${riskTheme.bg} transition-all`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-none flex items-center justify-center bg-[#06090E] border ${riskTheme.border} relative shadow-lg`}>
              <Flame className={`w-8 h-8 ${riskTheme.text} animate-pulse`} />
              <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-none ${riskTheme.dot}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D0D9E2]">
                  Heat Stress Threat Level:
                </span>
                <span className={`px-2.5 py-0.5 rounded-none text-xs font-mono font-black uppercase ${riskTheme.text} bg-[#06090E] border ${riskTheme.border}`}>
                  {riskLevel.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#FAF5EB] mt-1">
                {formatTemp(hi, isFahrenheit)} <span className="text-sm font-mono font-normal text-[#D0D9E2]">Heat Index</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#D0D9E2] mt-1 max-w-xl">
                {data?.forecasting?.current?.warning || "Continuous microclimate telemetry monitored by Arduino UNO Q."}
              </p>
            </div>
          </div>

          {/* Quick Hardware & Controller Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col">
              <span className="text-[10px] font-mono text-[#D0D9E2]">TELEMETRY SOURCE</span>
              <span className="text-xs font-bold font-mono text-[#00D9E8] flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-[#00D9E8]" />
                {mode === "LIVE_HARDWARE" ? "ARDUINO UNO Q (LIVE)" : "SIMULATOR ENGINE"}
              </span>
            </div>

            <div className="px-4 py-2 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col">
              <span className="text-[10px] font-mono text-[#D0D9E2]">EDGE CONFIDENCE</span>
              <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {confidence.toFixed(1)}% (OPTIMAL)
              </span>
            </div>

            <button
              onClick={() => setSystemMode(mode === "LIVE_HARDWARE" ? "SIMULATION" : "LIVE_HARDWARE")}
              className="px-3.5 py-2 rounded-none bg-[#00D9E8]/10 border border-[#00D9E8]/40 text-[#00D9E8] text-xs font-mono font-bold hover:bg-[#00D9E8] hover:text-[#06090E] transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to {mode === "LIVE_HARDWARE" ? "Simulation" : "Live"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Primary Environmental Transducer Cards: Ambient Temp & Humidity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Ambient Temp */}
        <div className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-5 space-y-2 relative overflow-hidden shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-[#D0D9E2]">
            <span className="text-xs font-mono uppercase">Ambient Temp (BME280)</span>
            <Thermometer className="w-4 h-4 text-[#EF233C]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB]">
              {formatTemp(t.temp_ambient, isFahrenheit)}
            </span>
            <span className="text-[10px] font-mono text-[#00D9E8]">I2C 0x76</span>
          </div>
          <div className="w-full bg-[#1E252E] h-1.5 rounded-none overflow-hidden mt-2">
            <div 
              className="bg-[#00D9E8] h-full rounded-none transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, (t.temp_ambient / 50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Relative Humidity */}
        <div className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-5 space-y-2 relative overflow-hidden shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-[#D0D9E2]">
            <span className="text-xs font-mono uppercase">Humidity (BME280)</span>
            <Droplets className="w-4 h-4 text-[#00D9E8]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#00D9E8]">
              {t.humidity.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-[#D0D9E2]">RH Vapor</span>
          </div>
          <div className="w-full bg-[#1E252E] h-1.5 rounded-none overflow-hidden mt-2">
            <div 
              className="bg-[#00D9E8] h-full rounded-none transition-all duration-500"
              style={{ width: `${Math.min(100, t.humidity)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Real-Time Graphs & Interactive Live Chart */}
      <div className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-6 space-y-4 shadow-lg shadow-black/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1D2F40] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#FAF5EB] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00D9E8]" />
              Live Telemetry Stream (High-Frequency Realtime)
            </h3>
            <p className="text-xs text-[#D0D9E2] mt-1">
              Direct feed from Arduino UNO Q Edge Buffer & Rothfusz Predictive Regression Engine
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-none bg-[#06090E] border border-[#1D2F40] text-xs font-mono">
            {(["ALL", "TEMP", "HUMIDITY", "HEAT_INDEX"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 rounded-none transition-all ${
                  selectedMetric === m
                    ? "bg-[#00D9E8] text-[#06090E] font-bold"
                    : "text-[#D0D9E2] hover:text-[#00D9E8]"
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
                  <stop offset="5%" stopColor="#00D9E8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00D9E8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D96226" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#D96226" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#14202B" vertical={false} />
              <XAxis dataKey="time" stroke="#D0D9E2" tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} />
              <YAxis stroke="#D0D9E2" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D141F",
                  borderColor: "#1D2F40",
                  borderRadius: "0px",
                  color: "#FAF5EB",
                  fontSize: "12px",
                }}
              />

              {(selectedMetric === "ALL" || selectedMetric === "HEAT_INDEX") && (
                <Area
                  type="monotone"
                  dataKey="heat_index"
                  stroke="#D96226"
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
                  stroke="#00D9E8"
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

    </div>
  );
}
