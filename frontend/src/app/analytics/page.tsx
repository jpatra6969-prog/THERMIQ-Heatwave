"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Download, 
  FileText, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Thermometer, 
  Sun, 
  ShieldCheck,
  RefreshCw,
  Search
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp } from "@/lib/utils";

export default function AnalyticsPage() {
  const { isFahrenheit, apiUrl } = useTelemetry();
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    avg_temp: 32.4,
    max_temp: 38.6,
    avg_heat_index: 39.1,
    max_heat_index: 44.5,
    avg_humidity: 62.5,
    avg_confidence: 97.2,
    total_samples: 142,
  });
  const [timeRange, setTimeRange] = useState<"1H" | "6H" | "24H" | "ALL">("1H");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnalytics = async () => {
    try {
      const sumRes = await fetch(`${apiUrl}/api/analytics/summary`);
      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        setSummary(sumJson);
      }

      const histRes = await fetch(`${apiUrl}/api/telemetry/history?limit=40`);
      if (histRes.ok) {
        const histJson = await histRes.json();
        if (Array.isArray(histJson)) {
          setHistory(histJson);
        }
      }
    } catch {
      // offline fallback sample data
      const mockHistory = Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
        temp_ambient: 31 + Math.sin(i / 3) * 3,
        humidity: 60 + Math.cos(i / 2) * 8,
        heat_index: 36 + Math.sin(i / 3) * 4,
        solar_lux: 12000 + i * 400,
        temp_probe_ds18: 31.5 + Math.sin(i / 3) * 3,
        temp_ir_object: 35 + Math.sin(i / 3) * 3.5,
        iaq_index: 45 + (i % 10),
        sensor_confidence: 96.5,
        risk_level: i > 12 ? "DANGER" : "CAUTION",
      }));
      setHistory(mockHistory);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [apiUrl]);

  const chartData = history.map((item) => ({
    time: item.timestamp ? item.timestamp.split("T")[1]?.slice(0, 5) : "--:--",
    temp: item.temp_ambient,
    heat_index: item.heat_index,
    humidity: item.humidity,
    lux: item.solar_lux / 200,
    probe: item.temp_probe_ds18,
    ir: item.temp_ir_object,
    iaq: item.iaq_index,
  }));

  const filteredHistory = history.filter((row) => {
    if (!searchTerm) return true;
    return (
      row.timestamp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.risk_level?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `heatguard_analytics_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <BarChart3 className="w-4 h-4" />
            Historical Diagnostics & Compliance Auditing
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Analytics, Microclimate Trends & Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit-ready thermal risk records exported directly from the SQLite persistent engine.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`${apiUrl}/api/analytics/export/csv`}
            download="heatguard_x_report.csv"
            className="px-4 py-2.5 rounded-xl font-bold text-xs font-mono bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </a>

          <button
            onClick={exportJSON}
            className="px-4 py-2.5 rounded-xl font-bold text-xs font-mono bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl font-bold text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Aggregate Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border-cyan-500/20 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            Peak Heat Index
            <TrendingUp className="w-4 h-4 text-red-400" />
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-red-400 mt-1">
            {formatTemp(summary.max_heat_index, isFahrenheit)}
          </div>
          <p className="text-[11px] text-slate-500">Historical Maximum</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-cyan-500/20 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            Average Ambient Temp
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 mt-1">
            {formatTemp(summary.avg_temp, isFahrenheit)}
          </div>
          <p className="text-[11px] text-slate-500">Facility Mean Temperature</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-cyan-500/20 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            Mean Relative Humidity
            <Activity className="w-4 h-4 text-sky-400" />
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400 mt-1">
            {summary.avg_humidity ?? 62.5}%
          </div>
          <p className="text-[11px] text-slate-500">BME280 Vapor Mean</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-cyan-500/20 space-y-1">
          <span className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
            Mean Sensor Confidence
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
            {summary.avg_confidence ?? 97.2}%
          </div>
          <p className="text-[11px] text-slate-500">Tri-Transducer Health</p>
        </div>

      </div>

      {/* Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Temperature & Heat Index Correlation */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Heat Index vs Ambient Curve</h3>
              <p className="text-xs text-slate-400">Rothfusz Index vs BME280 & DS18B20</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Timeframe: Recent</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#64748b" }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1120",
                    borderColor: "#06b6d4",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="heat_index" stroke="#ef4444" strokeWidth={2.5} name="Heat Index (°C)" />
                <Line type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={2} name="Ambient Temp (°C)" />
                <Line type="monotone" dataKey="probe" stroke="#10b981" strokeWidth={1.8} strokeDasharray="4 4" name="DS18B20 Probe (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Solar Lux vs Infrared Surface Temp */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Solar Irradiance vs IR Surface Heat</h3>
              <p className="text-xs text-slate-400">VEML7700 Solar Flux vs MLX90614 Infrared</p>
            </div>
            <span className="text-xs font-mono text-yellow-400">Radiant Flux</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#64748b" }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1120",
                    borderColor: "#06b6d4",
                    borderRadius: "0.75rem",
                    color: "#f8fafc",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="ir" stroke="#f59e0b" strokeWidth={2.5} name="Surface IR (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Historical Telemetry Log Table */}
      <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Historical Telemetry Stream Records</h3>
            <p className="text-xs text-slate-400">Raw multi-transducer packet logs stored in SQLite</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by time or risk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={fetchAnalytics}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-cyan-400 text-slate-400 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Ambient (°C)</th>
                <th className="py-3 px-3">Humidity (%)</th>
                <th className="py-3 px-3">Heat Index (°C)</th>
                <th className="py-3 px-3">Probe DS18</th>
                <th className="py-3 px-3">Surface IR</th>
                <th className="py-3 px-3">Solar Lux</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length > 0 ? (
                filteredHistory.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-300">
                      {row.timestamp?.split("T")[1]?.slice(0, 8) || "00:00:00"}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.temp_ambient?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3 text-sky-300">{row.humidity?.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{row.heat_index?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.temp_probe_ds18?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.temp_ir_object?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3 text-yellow-300">{row.solar_lux?.toLocaleString()} lx</td>
                    <td className="py-2.5 px-3 text-emerald-400">{row.sensor_confidence?.toFixed(0)}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.risk_level === "DANGER" || row.risk_level === "EXTREME_DANGER"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {row.risk_level}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No historical logs matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

