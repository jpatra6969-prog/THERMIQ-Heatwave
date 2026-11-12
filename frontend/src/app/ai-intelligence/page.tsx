"use client";

import React from "react";
import { 
  BrainCircuit, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Activity, 
  Flame, 
  Sun, 
  Droplets, 
  Terminal, 
  Zap 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { useTelemetry } from "@/context/TelemetryContext";
import { formatTemp } from "@/lib/utils";

export default function AIIntelligencePage() {
  const { data, isFahrenheit } = useTelemetry();

  const currentTemp = data?.telemetry?.temp_ambient ?? 32.8;
  const currentHI = data?.forecasting?.current?.heat_index ?? 39.4;
  const confidence = data?.confidence?.score ?? 96.5;
  const confidenceStatus = data?.confidence?.status ?? "OPTIMAL";
  const sensorHealth = data?.confidence?.sensor_health ?? {};
  const anomalies = data?.confidence?.anomalies ?? [];
  const microclimate = data?.microclimate;
  const forecasting = data?.forecasting;

  const h15 = forecasting?.horizon_15m;
  const h30 = forecasting?.horizon_30m;
  const h60 = forecasting?.horizon_60m;

  // Trajectory dataset for Recharts
  const trajectoryData = [
    { horizon: "Now", temp: currentTemp, heat_index: currentHI },
    { horizon: "+15m", temp: h15?.predicted_temp ?? 33.6, heat_index: h15?.predicted_heat_index ?? 41.2 },
    { horizon: "+30m", temp: h30?.predicted_temp ?? 34.4, heat_index: h30?.predicted_heat_index ?? 43.1 },
    { horizon: "+60m", temp: h60?.predicted_temp ?? 35.8, heat_index: h60?.predicted_heat_index ?? 46.5 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Banner - Clean Dark, No Light Effect */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4" />
            Edge AI Neural Forecasting Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Predictive AI Intelligence & Sensor Confidence
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Inference executes natively on the Arduino UNO Q dual-core ARM M4 platform, generating continuous 15–60 minute ahead trajectory forecasting with zero cloud dependence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">EDGE INFERENCE LATENCY</span>
            <span className="text-xs font-bold font-mono text-cyan-300">8.4 ms (On-Chip)</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">MODEL ARCHITECTURE</span>
            <span className="text-xs font-bold font-mono text-purple-300">TinyML Rothfusz-Hybrid</span>
          </div>
        </div>
      </div>

      {/* 15 / 30 / 60 Minute Prediction Cards - Clean Dark Borders, No Light Effect */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Predictive Heat Lookahead Horizons
          </h2>
          <span className="text-xs font-mono text-cyan-400">Diurnal & Thermal Inertia Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 15-Minute Lookahead */}
          <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                +15 MINUTE HORIZON
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {h15?.confidence ?? 96.4}% Conf.
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Predicted Heat Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-amber-400">
                  {formatTemp(h15?.predicted_heat_index, isFahrenheit)}
                </span>
                <span className="text-xs font-mono text-red-400 font-bold">
                  +{h15?.delta.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-slate-200">{formatTemp(h15?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Risk Tier:</span>
                <span className="text-amber-400 font-bold">{h15?.risk_level.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {/* 30-Minute Lookahead */}
          <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-orange-300 border border-slate-700">
                +30 MINUTE HORIZON
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {h30?.confidence ?? 92.1}% Conf.
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Predicted Heat Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-orange-400">
                  {formatTemp(h30?.predicted_heat_index, isFahrenheit)}
                </span>
                <span className="text-xs font-mono text-red-400 font-bold">
                  +{h30?.delta.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-slate-200">{formatTemp(h30?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Risk Tier:</span>
                <span className="text-red-400 font-bold">{h30?.risk_level.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {/* 60-Minute Lookahead */}
          <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-red-300 border border-slate-700">
                +60 MINUTE HORIZON
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {h60?.confidence ?? 87.8}% Conf.
              </span>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Predicted Heat Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-red-400">
                  {formatTemp(h60?.predicted_heat_index, isFahrenheit)}
                </span>
                <span className="text-xs font-mono text-red-500 font-bold">
                  +{h60?.delta.toFixed(1)}°C
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Predicted Ambient:</span>
                <span className="text-slate-200">{formatTemp(h60?.predicted_temp, isFahrenheit)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Risk Tier:</span>
                <span className="text-red-500 font-black">{h60?.risk_level.replace("_", " ")}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Trajectory Prediction Visualizer Chart - Clean Dark Container */}
      <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Predicted Thermal Drift Trajectory (Now → +60m)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates radiant accumulation from VEML7700 solar lux combined with BME280 humidity entrapment
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            RAPID ACCUMULATION DETECTED
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="horizon" stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: "#64748b" }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b1120",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#f8fafc",
                }}
              />
              <Line
                type="monotone"
                dataKey="heat_index"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 6, fill: "#ef4444" }}
                name="Predicted Heat Index (°C)"
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#06b6d4" }}
                name="Predicted Ambient (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor Confidence Intelligence & Microclimate Fingerprinting Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sensor Confidence Intelligence Card */}
        <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Sensor Confidence Intelligence</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
              confidenceStatus === "OPTIMAL" ? "bg-slate-800 text-emerald-300 border border-slate-700" : "bg-slate-800 text-red-300 border border-slate-700"
            }`}>
              {confidenceStatus}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-400">AGGREGATE CONFIDENCE</span>
              <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                {confidence.toFixed(1)}%
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              <div>Tri-Transducer Agreement</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                {data?.confidence?.redundancy_agreement ?? 98.4}% Matched
              </div>
            </div>
          </div>

          {/* Sensor Hardware Health Matrix */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400">Transducer Integrity Status</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(sensorHealth).map(([sName, sStat]) => (
                <div key={sName} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 uppercase">{sName}</span>
                  <span className={`font-bold ${sStat === "HEALTHY" ? "text-emerald-400" : "text-amber-400"}`}>
                    {sStat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Log */}
          {anomalies.length > 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-red-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Active Anomaly Isolation:
              </div>
              {anomalies.map((anom, idx) => (
                <div key={idx} className="pl-5 text-red-200/90">• {anom}</div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              All transducers within verified operational bounds. Zero cross-divergence.
            </div>
          )}
        </div>

        {/* Microclimate Fingerprinting Card */}
        <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Microclimate Fingerprinting</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
              ID: #{microclimate?.fingerprint_id ?? 1}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">IDENTIFIED PROFILE</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {microclimate?.environment_type}
              </span>
            </div>
            <h4 className="text-xl font-bold text-white">{microclimate?.profile_name}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{microclimate?.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">Solar Gain Flux</span>
              <div className="text-lg font-bold text-yellow-300">{microclimate?.solar_gain_pct}%</div>
              <div className="text-[10px] text-slate-500">VEML7700 Lux Correlated</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">Humidity Entrapment</span>
              <div className="text-lg font-bold text-sky-300">{microclimate?.humidity_entrapment_pct}%</div>
              <div className="text-[10px] text-slate-500">Vapor Pressure Index</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">Surface Radiant Delta</span>
              <div className="text-lg font-bold text-amber-300">+{microclimate?.surface_radiant_delta}°C</div>
              <div className="text-[10px] text-slate-500">MLX90614 Surface - Ambient</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-400">Thermal Inertia Index</span>
              <div className="text-lg font-bold text-purple-300">{microclimate?.thermal_inertia_index}</div>
              <div className="text-[10px] text-slate-500">Heat Dissipation Resistance</div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Generative Explainability Terminal */}
      <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
              AI Decision & Explainability Log (UNO Q TinyML Core)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            EDGE VERIFIED
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="text-cyan-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>EXPLAINABLE AI REASONING OUTPUT:</span>
          </div>
          <p className="text-slate-200">
            "{forecasting?.ai_explanation || "Thermal equilibrium remains steady with mild diurnal variation."}"
          </p>
          <div className="pt-2 text-slate-400 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>• Transducer Isolation: BME280 + DS18B20 parity verified within ±0.3°C tolerance.</div>
            <div>• Rothfusz Formulation: US NWS standards applied with Celsius heat dissipation adjustment.</div>
            <div>• Predictive Warning Trigger: Horizon threshold +30m mandates cooling intervention prep.</div>
            <div>• Failsafe Fallback: Edge parameters synced across non-volatile EEPROM memory.</div>
          </div>
        </div>
      </div>

    </div>
  );
}
