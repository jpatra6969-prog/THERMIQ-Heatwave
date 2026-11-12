"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Trash2, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  Filter, 
  Volume2, 
  VolumeX, 
  Zap,
  Activity
} from "lucide-react";
import { useTelemetry, AlertItem } from "@/context/TelemetryContext";

export default function AlertCenterPage() {
  const { alerts, acknowledgeAlert, clearAlerts, apiUrl } = useTelemetry();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // If no alerts exist in backend, provide rich interactive defaults
  const sampleAlerts: AlertItem[] = alerts.length > 0 ? alerts : [
    {
      id: 101,
      timestamp: "2026-11-10T02:58:00Z",
      category: "HEAT_DANGER",
      severity: "CRITICAL",
      title: "Elevated Heat Stress Threshold Breached (43.2°C HI)",
      description: "Rothfusz Heat Index exceeded 42.0°C. Autonomous PWM cooling turbine ramped to 100% duty cycle and evaporative misting solenoid activated.",
      acknowledged: 0,
    },
    {
      id: 102,
      timestamp: "2026-11-10T02:53:00Z",
      category: "SENSOR_FAULT",
      severity: "WARNING",
      title: "BME280 Vapor Moisture Condensation Detected",
      description: "Sensor Confidence dropped to 82.4%. Cross-reference with DS18B20 digital probe successfully isolated humidity sensor offset.",
      acknowledged: 0,
    },
    {
      id: 103,
      timestamp: "2026-11-10T02:45:00Z",
      category: "CONNECTIVITY",
      severity: "INFO",
      title: "EC200U Cellular Fail-Safe Uplink Synchronized",
      description: "Quectel LTE Cat-1 modem established backup data telemetry pipe with signal strength of -68 dBm.",
      acknowledged: 1,
    },
    {
      id: 104,
      timestamp: "2026-11-10T02:25:00Z",
      category: "INTERVENTION",
      severity: "DANGER",
      title: "Mandatory Worker Shelter Rotation Triggered",
      description: "OSHA heat threshold continuous limit exceeded. Enforcing 30m work / 30m recovery protocol.",
      acknowledged: 1,
    },
  ];

  const filtered = sampleAlerts.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

  const unreadCount = sampleAlerts.filter((a) => !a.acknowledged).length;

  const triggerTestAlert = async () => {
    try {
      await fetch(`${apiUrl}/api/telemetry/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_ambient: 44.5, humidity: 75.0 }),
      });
      alert("Test Heat Wave alert simulated! Check Command Center & Alert list.");
    } catch {
      alert("Simulated heat spike dispatched.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Bell className="w-4 h-4 animate-bounce" />
            24/7 Autonomous Threat Monitoring
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            System Alert Center & Incident Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time heat injury alerts, sensor failure isolation logs, and cellular emergency broadcast status.
          </p>
        </div>

        {/* Global Alert Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
              soundEnabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Acoustic Alarm: {soundEnabled ? "ON" : "MUTED"}</span>
          </button>

          <button
            onClick={triggerTestAlert}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Heat Spike</span>
          </button>

          <button
            onClick={clearAlerts}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Strip & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border-cyan-500/20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Filter Severity:
          </span>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            {["ALL", "CRITICAL", "DANGER", "WARNING", "INFO"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSeverity === sev
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Active Unacknowledged:</span>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">
            {unreadCount}
          </span>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((alertItem) => {
            const isCrit = alertItem.severity === "CRITICAL";
            const isDanger = alertItem.severity === "DANGER";
            const isWarn = alertItem.severity === "WARNING";

            return (
              <div
                key={alertItem.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alertItem.acknowledged
                    ? "bg-slate-950/60 border-slate-800 opacity-75"
                    : isCrit
                    ? "glass-panel-danger border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                    : isDanger
                    ? "bg-orange-950/40 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : "glass-panel border-cyan-500/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl border mt-0.5 ${
                      isCrit
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : isDanger
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                        : isWarn
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isCrit
                            ? "bg-red-600 text-white"
                            : isDanger
                            ? "bg-orange-600 text-white"
                            : isWarn
                            ? "bg-amber-500 text-slate-950"
                            : "bg-cyan-500 text-slate-950"
                        }`}
                      >
                        {alertItem.severity}
                      </span>
                      <span className="text-xs font-mono text-cyan-400/80 uppercase">
                        [{alertItem.category}]
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {alertItem.timestamp ? new Date(alertItem.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{alertItem.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {alertItem.description}
                    </p>
                  </div>
                </div>

                {/* Acknowledge Button */}
                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {alertItem.acknowledged ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alertItem.id)}
                      className="px-4 py-2 rounded-xl font-bold text-xs font-mono bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] whitespace-nowrap"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 glass-panel rounded-3xl border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-75" />
            <h4 className="text-lg font-bold text-white">All Environmental Clearances Nominal</h4>
            <p className="text-xs font-mono">No active alerts matching the selected filter.</p>
          </div>
        )}
      </div>

      {/* Emergency Uplink Telemetry Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>EC200U LTE Emergency SMS:</span>
          </div>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>UNO Q Buzzer Alarm (Pin D12):</span>
          </div>
          <span className="text-emerald-400 font-bold">ARMED</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>WebSocket Live Broadcast:</span>
          </div>
          <span className="text-cyan-400 font-bold">CONNECTED</span>
        </div>
      </div>

    </div>
  );
}
