"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Clock,
  Sliders,
  AlertTriangle,
  Activity,
  RefreshCw,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Zap,
  BarChart3,
  Wifi,
  Radio,
  Layers,
  Server
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp, getRiskColorClass } from "@/lib/utils";

export default function SimplifiedDashboardPage() {
  const {
    data,
    mode,
    setSystemMode,
    isFahrenheit,
    toggleUnit,
    setFanSpeed,
    injectSimulation,
    apiUrl
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<"LIVE" | "FORECAST" | "COOLING" | "SIMULATE">("LIVE");
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Simple simulator inputs
  const [simTemp, setSimTemp] = useState<number>(33);
  const [simHum, setSimHum] = useState<number>(65);

  const t = data?.telemetry ?? {
    temp_ambient: 23.2,
    humidity: 46.0,
    solar_lux: 13000,
    temp_probe_ds18: 24.1,
    temp_ir_object: 25.4,
    gas_resistance: 46200,
    iaq_index: 325,
    pressure_hpa: 1012.8,
  };

  const hi = data?.forecasting?.current?.heat_index ?? 24.8;
  const riskLevel = data?.forecasting?.current?.risk_level ?? "SAFE";
  const riskTheme = getRiskColorClass(riskLevel);
  const confidence = data?.confidence?.score ?? 85.0;
  const fanSpeed = data?.intervention?.fan_speed_pct ?? 85;
  const fanMode = data?.intervention?.mode ?? "AUTO";
  const misting = data?.intervention?.misting_active ?? true;

  const h15 = data?.forecasting?.horizon_15m;
  const h30 = data?.forecasting?.horizon_30m;
  const h60 = data?.forecasting?.horizon_60m;

  // Initial reference chart points matching the user's uploaded dashboard
  const defaultSensorSeries = [
    { time: "03:00", temp: 17, hi: 20 },
    { time: "06:00", temp: 16, hi: 22 },
    { time: "10:00", temp: 20, hi: 24 },
    { time: "12:00", temp: 22, hi: 26 },
    { time: "14:00", temp: 21, hi: 23 },
    { time: "16:00", temp: 20, hi: 24 },
    { time: "18:00", temp: 22, hi: 25 },
    { time: "18:08", temp: 21, hi: 24 },
  ];

  const defaultEnergyWave = [
    { time: "10:00", val: 12 },
    { time: "05:00", val: 68 },
    { time: "10:00", val: 42 },
    { time: "10:00", val: 86 },
    { time: "14:00", val: 64 },
    { time: "15:00", val: 92 },
  ];

  // Running live chart buffer
  useEffect(() => {
    if (!data?.telemetry) return;
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const point = {
      time: nowTime,
      temp: data.telemetry.temp_ambient,
      humidity: data.telemetry.humidity,
      hi: data.forecasting?.current?.heat_index ?? 24.0,
    };
    setHistoryData((prev) => {
      const copy = [...prev, point];
      if (copy.length > 20) copy.shift();
      return copy;
    });
  }, [data]);

  const activeSeries = historyData.length >= 5 ? historyData : defaultSensorSeries;

  // Device Status Bar Chart Mock Items matching the reference image exactly
  const deviceBars = [
    { id: "108", height: 35, color: "bg-[#0284c7]", status: "Active" },
    { id: "108", height: 52, color: "bg-[#00D9E8]", status: "Idle" },
    { id: "08", height: 88, color: "bg-[#00D9E8]", status: "Idle" },
    { id: "05", height: 60, color: "bg-[#0284c7]", status: "Active" },
    { id: "08", height: 75, color: "bg-[#00D9E8]", status: "Idle" },
    { id: "108", height: 92, color: "bg-[#D96226]", status: "Warning" },
    { id: "103", height: 68, color: "bg-[#EF233C]", status: "Error" },
  ];

  // Spiderweb Radar Map Sensor Nodes
  const networkNodes = [
    { id: "BME280", name: "BME280 Ambient", x: 150, y: 40 },
    { id: "DS18B20", name: "DS18B20 Probe", x: 230, y: 65 },
    { id: "MLX90614", name: "MLX90614 IR", x: 260, y: 145 },
    { id: "VEML7700", name: "VEML7700 Lux", x: 235, y: 225 },
    { id: "PWM-FAN", name: "Cooling Fan PWM", x: 175, y: 265 },
    { id: "MIST", name: "Misting Solenoid", x: 115, y: 260 },
    { id: "LTE", name: "EC200U LTE", x: 42, y: 180 },
    { id: "IAQ", name: "VOC IAQ Sensor", x: 60, y: 95 },
  ];

  return (
    <div className="space-y-5 pb-8">

      {/* Top Header / Mode & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none flex items-center justify-center bg-[#1E252E] border border-[#2D3A4B]">
            <Flame className={`w-5 h-5 ${riskTheme.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-[#D0D9E2]">Heat Stress Threat Level:</span>
              <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase ${riskTheme.text} bg-[#1E252E] border ${riskTheme.border}`}>
                {riskLevel.replace("_", " ")}
              </span>
            </div>
            <div className="text-xs font-mono text-[#FAF5EB] flex items-center gap-2 mt-0.5">
              <span>Heat Index: <strong className="text-[#00D9E8]">{formatTemp(hi, isFahrenheit)}</strong></span>
              <span className="text-[#2D3A4B]">•</span>
              <span className="text-[#D0D9E2]">Microclimate Telemetry Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <div className="flex p-1 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-xs">
            <button
              onClick={() => setActiveTab("LIVE")}
              className={`px-3 py-1.5 rounded-none font-bold transition-all ${activeTab === "LIVE"
                ? "bg-[#00D9E8] text-[#06090E]"
                : "text-[#D0D9E2] hover:text-[#FAF5EB]"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("FORECAST")}
              className={`px-3 py-1.5 rounded-none font-bold transition-all ${activeTab === "FORECAST"
                ? "bg-[#00D9E8] text-[#06090E]"
                : "text-[#D0D9E2] hover:text-[#FAF5EB]"
                }`}
            >
              AI Forecast
            </button>
            <button
              onClick={() => setActiveTab("COOLING")}
              className={`px-3 py-1.5 rounded-none font-bold transition-all ${activeTab === "COOLING"
                ? "bg-[#00D9E8] text-[#06090E]"
                : "text-[#D0D9E2] hover:text-[#FAF5EB]"
                }`}
            >
              Fan Control
            </button>
          </div>

          <button
            onClick={toggleUnit}
            className="px-2.5 py-1.5 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-xs font-mono font-bold text-[#00D9E8] hover:border-[#00D9E8] transition-colors"
          >
            Unit: {isFahrenheit ? "°F" : "°C"}
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE 3-COLUMN DASHBOARD */}
      {activeTab === "LIVE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* ================= COLUMN 1 (LEFT): 2x2 Sensors + Device Status ================= */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* 2x2 Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4">

              {/* Card 1: Temperature */}
              <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col justify-between shadow-lg shadow-black/40 h-44 sm:h-48">
                <span className="text-sm font-semibold text-[#D0D9E2]">Temperature</span>
                <div className="flex items-center gap-3 mt-2">
                  {/* Thermometer SVG with Signal Red bulb */}
                  <svg className="w-6 h-9 shrink-0" viewBox="0 0 24 32" fill="none">
                    <path
                      d="M9 3a3 3 0 0 1 6 0v16.1a6 6 0 1 1-6 0V3z"
                      stroke="#EF233C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="22" r="3.5" fill="#EF233C" />
                    <path d="M12 9v10" stroke="#EF233C" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB] tracking-tight">
                    {formatTemp(t.temp_ambient, isFahrenheit)}
                  </span>
                </div>
              </div>

              {/* Card 2: Humidity */}
              <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col justify-between shadow-lg shadow-black/40 h-44 sm:h-48">
                <span className="text-sm font-semibold text-[#D0D9E2]">Humidity</span>
                <div className="mt-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#00D9E8] tracking-tight">
                    {Math.round(t.humidity)}%
                  </span>
                </div>
              </div>

              {/* Card 3: Air Quality */}
              <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col justify-between shadow-lg shadow-black/40 h-44 sm:h-48">
                <span className="text-sm font-semibold text-[#D0D9E2]">Air Quality</span>
                <div className="flex items-center gap-3 mt-2">
                  <AlertTriangle className="w-7 h-7 text-[#D96226] shrink-0" />
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB] tracking-tight">
                    {t.iaq_index ?? 325}
                  </span>
                </div>
              </div>

              {/* Card 4: Secondary Metric with Sparkline Wave */}
              <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col justify-between shadow-lg shadow-black/40 h-44 sm:h-48 relative overflow-hidden">
                <span className="text-sm font-semibold text-[#D0D9E2]">Solar Lux</span>
                <div>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB] tracking-tight">
                    325
                  </span>
                </div>

                {/* Sine wave sparkline SVG */}
                <div className="w-full h-10 flex items-end">
                  <svg className="w-full h-9" viewBox="0 0 100 24" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00D9E8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00D9E8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 16 Q 15 4, 30 14 T 60 12 T 85 18 T 100 10 L 100 24 L 0 24 Z"
                      fill="url(#sparklineGrad)"
                    />
                    <path
                      d="M 0 16 Q 15 4, 30 14 T 60 12 T 85 18 T 100 10"
                      stroke="#00D9E8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

            </div>

            {/* Bottom: Device Status Bar Chart */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col gap-4 shadow-lg shadow-black/40 flex-1 min-h-[320px]">
              <h3 className="text-base font-bold text-[#FAF5EB]">Device Status</h3>

              {/* Bar Chart Area */}
              <div className="flex items-end gap-2 flex-1 pb-2">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between h-full text-[10px] font-mono text-[#D0D9E2] pb-6 shrink-0">
                  <span>10</span>
                  <span>5</span>
                  <span>0</span>
                </div>

                {/* Bars + x-axis labels */}
                <div className="flex-1 flex flex-col h-full">
                  <div className="flex-1 flex items-end justify-around border-b border-[#1D2F40] gap-2 pb-2">
                    {deviceBars.map((b, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className={`w-7 sm:w-10 lg:w-12 rounded-none transition-all duration-500 ${b.color}`}
                          style={{ height: `${b.height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around pt-1.5">
                    {deviceBars.map((b, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-[#D0D9E2] text-center">{b.id}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs text-[#D0D9E2]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D9E8]" />
                  <span>Idle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D96226]" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF233C]" />
                  <span>Error</span>
                </div>
              </div>
            </div>

          </div>

          {/* ================= COLUMN 2 (MIDDLE): Sensor Data + System Health + Energy ================= */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Top: Sensor Data Multi-line Chart */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
              <h3 className="text-base font-bold text-[#FAF5EB] mb-3">Sensor Data</h3>

              <div className="h-56 sm:h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#14202B" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#D0D9E2"
                      tick={{ fontSize: 10, fill: "#D0D9E2" }}
                      axisLine={{ stroke: "#1D2F40" }}
                    />
                    <YAxis
                      stroke="#D0D9E2"
                      tick={{ fontSize: 10, fill: "#D0D9E2" }}
                      axisLine={{ stroke: "#1D2F40" }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0D141F",
                        borderColor: "#1D2F40",
                        borderRadius: "0px",
                        color: "#FAF5EB",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hi"
                      stroke="#D96226"
                      strokeWidth={2.5}
                      dot={false}
                      name="Heat Index"
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#00D9E8"
                      strokeWidth={2.5}
                      dot={false}
                      name="Ambient Temp"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Middle: System Health with Circular Donut Gauge */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
              <h3 className="text-base font-bold text-[#FAF5EB]">System Health</h3>

              <div className="flex items-center justify-between mt-4">
                {/* Left Stat */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00D9E8] font-bold text-3xl tracking-tighter">||</span>
                    <span className="text-4xl sm:text-5xl font-black font-mono text-[#00D9E8]">
                      85%
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#D0D9E2] mt-1.5">
                    Optimal Microclimate Status
                  </p>
                </div>

                {/* Right SVG Donut Meter */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#1E252E"
                      strokeWidth="9"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#00D9E8"
                      strokeWidth="9"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - 0.85)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black font-mono text-[#FAF5EB]">
                    85
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: Energy Usage with Equalizer Bars */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
              <h3 className="text-base font-bold text-[#FAF5EB]">Energy Usage</h3>

              <div className="flex items-end justify-between mt-4 gap-4">
                {/* Equalizer Spectrum Bars */}
                <div className="flex items-end gap-1 sm:gap-1.5 h-16">
                  {[35, 60, 45, 80, 50, 90, 70, 40, 65, 85, 55, 75, 95, 60, 40, 70, 85, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 sm:w-2 bg-[#00D9E8]"
                      style={{ height: `${h}%`, opacity: 0.6 + (i % 3) * 0.15 }}
                    />
                  ))}
                </div>

                {/* Stat & Progress Underline */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB]">
                    1324 <span className="text-base font-normal text-[#D0D9E2]">W</span>
                  </span>
                  <div className="w-32 sm:w-40 h-1.5 bg-[#1E252E] overflow-hidden mt-2">
                    <div className="w-3/4 h-full bg-[#00D9E8]" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= COLUMN 3 (RIGHT): Spiderweb Radar Map + Energy Wave ================= */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Top: Sensor Network Spiderweb Radar Map */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] flex flex-col gap-3 shadow-lg shadow-black/40 relative overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#FAF5EB]">Sensor Network</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-none bg-[#00D9E8]/10 text-[#00D9E8] border border-[#00D9E8]/30">
                  8 NODES ONLINE
                </span>
              </div>

              {/* Spiderweb Radar Visualization */}
              <div className="flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[360px]">
                <svg className="w-full h-full max-w-[420px] max-h-[380px]" viewBox="0 0 300 300" fill="none">
                  <defs>
                    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00D9E8" stopOpacity="0.15" />
                      <stop offset="80%" stopColor="#00D9E8" stopOpacity="0.0" />
                    </radialGradient>
                  </defs>

                  {/* Subtle Dark Backdrop Circle */}
                  <circle cx="150" cy="150" r="140" fill="url(#radarGlow)" />

                  {/* Concentric Spiderweb Rings */}
                  <circle cx="150" cy="150" r="35" stroke="#172738" strokeWidth="1" strokeDasharray="2 3" />
                  <circle cx="150" cy="150" r="70" stroke="#172738" strokeWidth="1" />
                  <circle cx="150" cy="150" r="105" stroke="#172738" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="150" cy="150" r="138" stroke="#1D2F40" strokeWidth="1.2" />

                  {/* Radial Spokes from Center */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 150 + 138 * Math.cos(rad);
                    const y2 = 150 + 138 * Math.sin(rad);
                    return (
                      <line
                        key={i}
                        x1="150"
                        y1="150"
                        x2={x2}
                        y2={y2}
                        stroke="#172738"
                        strokeWidth="0.8"
                      />
                    );
                  })}

                  {/* Node Interconnection Mesh Web Lines */}
                  <polygon
                    points={networkNodes.map(n => `${n.x},${n.y}`).join(" ")}
                    stroke="#00D9E8"
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    fill="#00D9E8"
                    fillOpacity="0.03"
                  />

                  {/* Radial Lines connecting satellite nodes to master hub */}
                  {networkNodes.map((n, i) => (
                    <line
                      key={i}
                      x1="150"
                      y1="150"
                      x2={n.x}
                      y2={n.y}
                      stroke="#00D9E8"
                      strokeWidth="0.9"
                      strokeOpacity="0.4"
                    />
                  ))}

                  {/* Center Master Node (Arduino UNO Q Edge AI Hub) */}
                  <circle cx="150" cy="150" r="14" fill="#00D9E8" fillOpacity="0.2" stroke="#00D9E8" strokeWidth="2" />
                  <circle cx="150" cy="150" r="7" fill="#00D9E8" />
                  <circle cx="150" cy="150" r="3" fill="#06090E" />

                  {/* Satellite Sensor Nodes */}
                  {networkNodes.map((node, idx) => (
                    <g key={idx} className="cursor-pointer group">
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="9"
                        fill="#06090E"
                        stroke="#00D9E8"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="4"
                        fill="#00D9E8"
                      />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#D0D9E2] border-t border-[#1D2F40] pt-2">
                <span>Mesh Topology: Star-Polygon</span>
                <span className="text-[#00D9E8]">Lat: 12ms</span>
              </div>
            </div>

            {/* Bottom: Energy Usage Smooth Spline Wave Chart */}
            <div className="p-5 sm:p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
              <h3 className="text-base font-bold text-[#FAF5EB] mb-3">Energy Usage</h3>

              <div className="h-44 sm:h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={defaultEnergyWave}>
                    <defs>
                      <linearGradient id="energyWaveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9E8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00D9E8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#14202B" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#D0D9E2"
                      tick={{ fontSize: 10, fill: "#D0D9E2" }}
                      axisLine={{ stroke: "#1D2F40" }}
                    />
                    <YAxis
                      stroke="#D0D9E2"
                      tick={{ fontSize: 10, fill: "#D0D9E2" }}
                      axisLine={{ stroke: "#1D2F40" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0D141F",
                        borderColor: "#1D2F40",
                        borderRadius: "0px",
                        color: "#FAF5EB",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#00D9E8"
                      strokeWidth={2.5}
                      fill="url(#energyWaveGrad)"
                      name="Usage (W)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: AI FORECAST */}
      {activeTab === "FORECAST" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 15 min */}
            <div className="p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-3 shadow-lg shadow-black/40">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">+15 Minutes Ahead</span>
              <div className="text-3xl font-black font-mono text-amber-400">
                {formatTemp(h15?.predicted_heat_index, isFahrenheit)}
              </div>
              <div className="text-xs font-mono text-[#D0D9E2] flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-[#FAF5EB]">{formatTemp(h15?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                Confidence: {h15?.confidence ?? 96.4}%
              </div>
            </div>

            {/* 30 min */}
            <div className="p-6 rounded-none bg-[#0D141F] border border-[#D96226]/50 space-y-3 shadow-lg shadow-black/40">
              <span className="text-xs font-mono font-bold text-[#D96226] uppercase">+30 Minutes Ahead</span>
              <div className="text-3xl font-black font-mono text-[#D96226]">
                {formatTemp(h30?.predicted_heat_index, isFahrenheit)}
              </div>
              <div className="text-xs font-mono text-[#D0D9E2] flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-[#FAF5EB]">{formatTemp(h30?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="text-xs font-mono text-[#00D9E8] font-bold">
                Confidence: {h30?.confidence ?? 92.1}%
              </div>
            </div>

            {/* 60 min */}
            <div className="p-6 rounded-none bg-[#0D141F] border border-[#EF233C]/50 space-y-3 shadow-lg shadow-black/40">
              <span className="text-xs font-mono font-bold text-[#EF233C] uppercase">+60 Minutes Ahead</span>
              <div className="text-3xl font-black font-mono text-[#EF233C]">
                {formatTemp(h60?.predicted_heat_index, isFahrenheit)}
              </div>
              <div className="text-xs font-mono text-[#D0D9E2] flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-[#FAF5EB]">{formatTemp(h60?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="text-xs font-mono text-[#D0D9E2] font-bold">
                Confidence: {h60?.confidence ?? 87.8}%
              </div>
            </div>

          </div>

          {/* AI Explanation in plain English */}
          <div className="p-5 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-2 shadow-lg shadow-black/40">
            <span className="text-xs font-mono text-[#00D9E8] font-bold flex items-center gap-1.5 uppercase">
              <BrainCircuit className="w-4 h-4" />
              Plain English AI Explanation
            </span>
            <p className="text-sm text-[#FAF5EB] leading-relaxed">
              &quot;{data?.forecasting?.ai_explanation || "Thermal conditions remain steady. Predictive microclimate cooling is primed for heat mitigation."}&quot;
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: COOLING CONTROL */}
      {activeTab === "COOLING" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-4 shadow-lg shadow-black/40">
            <h3 className="text-base font-bold text-[#FAF5EB] flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#00D9E8]" />
              Direct Fan Speed Control
            </h3>

            <div className="flex items-center justify-between text-xs font-mono text-[#D0D9E2]">
              <span>Fan Speed: {fanSpeed}%</span>
              <span className="text-[#00D9E8] font-bold">{fanMode} MODE</span>
            </div>

            {/* Fan speed progress bar (read-only visual) */}
            <div className="w-full h-2 bg-[#1E252E] rounded-none overflow-hidden border border-[#2D3A4B]">
              <div
                className="h-full bg-[#00D9E8] rounded-none transition-all duration-500"
                style={{ width: `${fanSpeed}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => setFanSpeed("AUTO")}
                className="py-2 rounded-none text-xs font-mono font-bold bg-[#00D9E8] text-[#06090E] hover:bg-[#00AFCB] transition-colors"
              >
                Auto AI Mode
              </button>
              <button
                onClick={() => setFanSpeed("MANUAL", 50)}
                className="py-2 rounded-none text-xs font-mono font-bold bg-[#1E252E] border border-[#2D3A4B] text-[#D0D9E2] hover:border-[#00D9E8] hover:text-[#FAF5EB] transition-colors"
              >
                50% Speed
              </button>
              <button
                onClick={() => setFanSpeed("MANUAL", 100)}
                className="py-2 rounded-none text-xs font-mono font-bold bg-[#EF233C] text-[#FAF5EB] hover:bg-[#EF233C]/90 transition-colors"
              >
                100% Boost
              </button>
            </div>
          </div>

          <div className="p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-3 shadow-lg shadow-black/40">
            <h3 className="text-base font-bold text-[#FAF5EB] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00D9E8]" />
              Autonomous Actuation Status
            </h3>
            <div className="p-3.5 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-xs font-mono space-y-1">
              <div className="text-[#D0D9E2]">Active Actuator Profile:</div>
              <div className="text-sm font-bold text-[#00D9E8]">
                {fanSpeed > 50 ? "High-Velocity Heat Dissipation" : "Steady-State Microclimate Regulation"}
              </div>
            </div>
            <div className="p-3.5 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-xs font-mono space-y-1">
              <div className="text-[#D0D9E2]">Hydration & Recovery Guidance:</div>
              <div className="text-sm font-bold text-emerald-400">
                {data?.intervention?.recommendations?.hydration_intake_ml_hr ?? 500} mL / hr electrolyte replenishment
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Sub-Modules Quick Links */}
      <div className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/command-center"
            className="p-4 rounded-none bg-[#0D141F] border border-[#1D2F40] hover:bg-[#1E252E] hover:border-[#00D9E8] text-xs font-mono text-[#FAF5EB] flex items-center justify-between group transition-colors shadow-lg shadow-black/40"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00D9E8]" />
              Command Center
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D0D9E2] group-hover:text-[#00D9E8]" />
          </Link>

          <Link
            href="/adaptive-protection"
            className="p-4 rounded-none bg-[#0D141F] border border-[#1D2F40] hover:bg-[#1E252E] hover:border-[#00D9E8] text-xs font-mono text-[#FAF5EB] flex items-center justify-between group transition-colors shadow-lg shadow-black/40"
          >
            <span className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#00D9E8]" />
              Adaptive Protection
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D0D9E2] group-hover:text-[#00D9E8]" />
          </Link>

          <Link
            href="/heat-map"
            className="p-4 rounded-none bg-[#0D141F] border border-[#1D2F40] hover:bg-[#1E252E] hover:border-[#00D9E8] text-xs font-mono text-[#FAF5EB] flex items-center justify-between group transition-colors shadow-lg shadow-black/40"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00D9E8]" />
              Heat Map (GIS)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D0D9E2] group-hover:text-[#00D9E8]" />
          </Link>

          <Link
            href="/analytics"
            className="p-4 rounded-none bg-[#0D141F] border border-[#1D2F40] hover:bg-[#1E252E] hover:border-[#00D9E8] text-xs font-mono text-[#FAF5EB] flex items-center justify-between group transition-colors shadow-lg shadow-black/40"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00D9E8]" />
              Analytics & Reports
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D0D9E2] group-hover:text-[#00D9E8]" />
          </Link>
        </div>
      </div>

    </div>
  );
}
