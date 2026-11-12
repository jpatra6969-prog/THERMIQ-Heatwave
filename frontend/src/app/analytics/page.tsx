"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Download, 
  FileText, 
  Printer, 
  TrendingUp, 
  Thermometer 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
        <div>
          <div className="flex items-center gap-2 text-[#00D9E8] text-xs font-mono uppercase tracking-widest">
            <BarChart3 className="w-4 h-4" />
            Historical Diagnostics & Compliance Auditing
          </div>
          <h1 className="text-3xl font-extrabold text-[#FAF5EB] mt-1">
            Analytics, Microclimate Trends & Reports
          </h1>
          <p className="text-sm text-[#D0D9E2] mt-1 max-w-2xl">
            Audit-ready thermal risk records exported directly from the SQLite persistent engine.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`${apiUrl}/api/analytics/export/csv`}
            download="heatguard_x_report.csv"
            className="px-4 py-2.5 rounded-none font-bold text-xs font-mono bg-[#00D9E8] text-[#06090E] hover:bg-[#00c5d2] transition-all flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </a>

          <button
            onClick={exportJSON}
            className="px-4 py-2.5 rounded-none font-bold text-xs font-mono bg-[#1E252E] border border-[#1D2F40] text-[#00D9E8] hover:bg-[#14202B] transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-none font-bold text-xs font-mono bg-[#1E252E] border border-[#1D2F40] text-[#D0D9E2] hover:text-[#FAF5EB] transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Aggregate Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="p-5 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-1 shadow-lg shadow-black/40">
          <span className="text-xs font-mono uppercase text-[#D0D9E2] flex items-center justify-between">
            Peak Heat Index
            <TrendingUp className="w-4 h-4 text-[#EF233C]" />
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#EF233C] mt-1">
            {formatTemp(summary.max_heat_index, isFahrenheit)}
          </div>
          <p className="text-[11px] font-mono text-[#D0D9E2]">Historical Maximum</p>
        </div>

        <div className="p-5 rounded-none bg-[#0D141F] border border-[#1D2F40] space-y-1 shadow-lg shadow-black/40">
          <span className="text-xs font-mono uppercase text-[#D0D9E2] flex items-center justify-between">
            Average Ambient Temp
            <Thermometer className="w-4 h-4 text-[#00D9E8]" />
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#FAF5EB] mt-1">
            {formatTemp(summary.avg_temp, isFahrenheit)}
          </div>
          <p className="text-[11px] font-mono text-[#D0D9E2]">Facility Mean Temperature</p>
        </div>

      </div>

      {/* Historical Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Temperature & Heat Index Correlation */}
        <div className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-6 space-y-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#1D2F40] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#FAF5EB]">Heat Index vs Ambient Curve</h3>
              <p className="text-xs text-[#D0D9E2]">Rothfusz Index vs BME280 & DS18B20</p>
            </div>
            <span className="text-xs font-mono text-[#00D9E8]">Timeframe: Recent</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14202B" vertical={false} />
                <XAxis dataKey="time" stroke="#D0D9E2" tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} />
                <YAxis stroke="#D0D9E2" tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D141F",
                    borderColor: "#1D2F40",
                    borderRadius: "0px",
                    color: "#FAF5EB",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="heat_index" stroke="#D96226" strokeWidth={2.5} name="Heat Index (°C)" />
                <Line type="monotone" dataKey="temp" stroke="#00D9E8" strokeWidth={2} name="Ambient Temp (°C)" />
                <Line type="monotone" dataKey="probe" stroke="#10b981" strokeWidth={1.8} strokeDasharray="4 4" name="DS18B20 Probe (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Solar Lux vs Infrared Surface Temp */}
        <div className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-6 space-y-4 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between border-b border-[#1D2F40] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#FAF5EB]">Solar Irradiance vs IR Surface Heat</h3>
              <p className="text-xs text-[#D0D9E2]">VEML7700 Solar Flux vs MLX90614 Infrared</p>
            </div>
            <span className="text-xs font-mono text-[#D96226]">Radiant Flux</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14202B" vertical={false} />
                <XAxis dataKey="time" stroke="#D0D9E2" tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} />
                <YAxis stroke="#D0D9E2" tick={{ fontSize: 11, fill: "#D0D9E2" }} axisLine={{ stroke: "#1D2F40" }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D141F",
                    borderColor: "#1D2F40",
                    borderRadius: "0px",
                    color: "#FAF5EB",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="ir" stroke="#D96226" strokeWidth={2.5} name="Surface IR (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
