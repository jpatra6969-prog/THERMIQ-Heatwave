"use client";

import React from "react";
import { 
  BookOpen, 
  Cpu, 
  Layers, 
  FileCode2, 
  Users, 
  Award, 
  ShieldCheck, 
  Radio, 
  Flame, 
  ExternalLink,
  Code2,
  Terminal,
  ChevronRight
} from "lucide-react";

export default function ResearchAboutPage() {
  const pinouts = [
    { pin: "3.3V / 5V", type: "Power Rail", component: "Sensor Bus Power", desc: "Common low-noise linear regulated supply" },
    { pin: "GND", type: "Ground", component: "Common System Ground", desc: "Star-ground topology minimizing I2C noise" },
    { pin: "SDA (A4 / D18)", type: "I2C Data", component: "BME280, BME688, MLX90614, VEML7700", desc: "4.7kΩ pull-up to 3.3V, 100 kHz standard mode" },
    { pin: "SCL (A5 / D19)", type: "I2C Clock", component: "BME280, BME688, MLX90614, VEML7700", desc: "Clock line with slew-rate limiting" },
    { pin: "GPIO D4", type: "1-Wire", component: "DS18B20 Waterproof Thermal Probe", desc: "4.7kΩ pull-up resistor to 3.3V" },
    { pin: "GPIO D9 (PWM)", type: "PWM Output", component: "Industrial Cooling Fan", desc: "High-frequency PWM driving low-side N-channel MOSFET" },
    { pin: "GPIO D10", type: "Digital Output", component: "Evaporative Misting Solenoid Valve", desc: "Optocoupled 12V relay driver" },
    { pin: "GPIO D12", type: "Digital Output", component: "Piezo Acoustic Warning Buzzer", desc: "Acoustic audible warning when threshold breached" },
    { pin: "Serial2 (TX2/RX2)", type: "UART 115200", component: "7-Inch Resistive HMI Touch Display", desc: "Nextion / DWIN bidirectional display stream" },
    { pin: "Serial3 (TX3/RX3)", type: "UART 115200", component: "Quectel EC200U LTE Cat-1 Modem", desc: "Standard 3GPP AT commands & HTTP/SMS uplink" },
  ];

  return (
    <div className="space-y-12 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-3xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            Academic Research, Hardware Architecture & Specifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">
            HEATGUARD X Research & Architecture
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            A comprehensive overview of our predictive heat defense framework, Edge AI models executing on Arduino UNO Q, sensor redundancy algorithms, and hardware schematics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40">
            WHITEPAPER VERSION 2.4
          </span>
        </div>
      </div>

      {/* Abstract & Problem Statement */}
      <section className="glass-panel rounded-3xl p-8 border-cyan-500/20 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-cyan-400" />
          1. Executive Summary & Problem Formulation
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Over 1 billion industrial, agricultural, and construction laborers worldwide are regularly exposed to lethal environmental heat stress. 
          Standard macro-weather station reports fundamentally fail to capture localized <em>microclimate thermal entrapment</em>—where radiant heat from direct solar exposure, 
          equipment surfaces, and stagnant high humidity cause core body temperatures to surge past 40.5°C within minutes, triggering heat stroke and permanent neurological injury.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>HEATGUARD X</strong> addresses this life-critical challenge through a hybrid edge computing platform built upon the <strong>Arduino UNO Q</strong>. 
          By combining multi-transducer environmental data with TinyML models, the system predicts impending heat index surges 15 to 60 minutes in advance, 
          autonomously modulates high-power cooling actuators, and enforces OSHA/NIOSH compliant work-rest schedules entirely offline.
        </p>
      </section>

      {/* End-to-End System Architecture */}
      <section className="glass-panel rounded-3xl p-8 border-cyan-500/20 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          2. End-to-End System Architecture
        </h2>

        {/* Diagrammatic Block Representation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Layer 1: Transducers</span>
            <h4 className="text-sm font-bold text-white">Physical Sensor Matrix</h4>
            <ul className="text-slate-400 space-y-1 pt-1 text-[11px]">
              <li>• BME280 (Temp / RH / Press)</li>
              <li>• BME688 (Gas & IAQ)</li>
              <li>• MLX90614 (Infrared Pyrometer)</li>
              <li>• VEML7700 (Solar Lux)</li>
              <li>• DS18B20 (Digital Core Probe)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/40 space-y-2">
            <span className="text-[10px] text-purple-400 uppercase font-bold">Layer 2: Edge Computing</span>
            <h4 className="text-sm font-bold text-white">Arduino UNO Q Platform</h4>
            <ul className="text-slate-400 space-y-1 pt-1 text-[11px]">
              <li>• Dual-Core ARM Cortex-M4</li>
              <li>• TinyML Predictive Neural Models</li>
              <li>• Sensor Confidence Matrix</li>
              <li>• Autonomous Closed-Loop PWM</li>
              <li>• Hard Real-Time Determinism</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/40 space-y-2">
            <span className="text-[10px] text-blue-400 uppercase font-bold">Layer 3: Local HMI & Uplink</span>
            <h4 className="text-sm font-bold text-white">Displays & Modems</h4>
            <ul className="text-slate-400 space-y-1 pt-1 text-[11px]">
              <li>• 7" Resistive Touch Screen (UART)</li>
              <li>• Quectel EC200U LTE Cat-1</li>
              <li>• Failsafe SMS Broadcaster</li>
              <li>• USB CDC Serial Bridge (115200)</li>
              <li>• Piezo Acoustic Failsafe</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Layer 4: Web Application</span>
            <h4 className="text-sm font-bold text-white">FastAPI & Next.js</h4>
            <ul className="text-slate-400 space-y-1 pt-1 text-[11px]">
              <li>• FastAPI High-Throughput REST</li>
              <li>• WebSocket 60 FPS Telemetry</li>
              <li>• SQLite Persistent Engine</li>
              <li>• Next.js TypeScript GUI</li>
              <li>• Recharts Interactive Graphs</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Hardware Wiring & Pinout Specification */}
      <section className="glass-panel rounded-3xl p-8 border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            3. Arduino UNO Q Hardware Pinout & Wiring Specifications
          </h2>
          <span className="text-xs font-mono text-cyan-400">100% Hardware Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">UNO Q Pin</th>
                <th className="py-3 px-3">Signal Type</th>
                <th className="py-3 px-3">Target Component</th>
                <th className="py-3 px-3">Interface Notes & Electrical Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pinouts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{p.pin}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.type}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-bold">{p.component}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mathematical Formulations */}
      <section className="glass-panel rounded-3xl p-8 border-cyan-500/20 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          4. Mathematical & Algorithmic Formulations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-cyan-300">Rothfusz NWS Heat Index Equation</h4>
            <p className="text-slate-400 leading-relaxed">
              Full multivariable regression calculating human perceived temperature from Dry Bulb Temperature ($T$ in °F) and Relative Humidity ($R$ in %):
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-300 overflow-x-auto">
              HI = -42.379 + 2.04901523*T + 10.14333127*R - 0.22475541*T*R - 0.00683783*T² - 0.05481717*R² + 0.00122874*T²*R + 0.00085282*T*R² - 0.00000199*T²*R²
            </div>
            <p className="text-[11px] text-slate-500">
              Includes US National Weather Service dry air and high humidity boundary condition adjustments, converted to Celsius for international deployment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-cyan-300">Sensor Confidence Discrepancy Matrix</h4>
            <p className="text-slate-400 leading-relaxed">
              Calculates dynamic transducer reliability C_trans by cross-referencing three independent thermal measurements:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
              Δ₁ = |T_BME280 - T_DS18B20|<br />
              Δ₂ = |T_BME280 - T_MLX_Ambient|<br />
              Confidence = 100 - (α · Δ₁ + β · Δ₂) - Fault_Penalties
            </div>
            <p className="text-[11px] text-slate-500">
              When Δ₁ &gt; 4.0°C or humidity exceeds 98%, confidence degrades and isolates the anomalous transducer from critical safety logic.
            </p>
          </div>

        </div>
      </section>

      {/* Project Team & Research Details */}
      <section className="glass-panel rounded-3xl p-8 border-cyan-500/20 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          5. Project Research Team & Acknowledgments
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white">HEATGUARD Research Initiative</h4>
            <p className="text-xs text-cyan-400 font-mono">Edge Computing & TinyML Lab</p>
            <p className="text-xs text-slate-400 pt-2">Specializing in occupational heat stroke mitigation and low-power hardware engineering.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white">Hardware Engineering</h4>
            <p className="text-xs text-cyan-400 font-mono">Arduino UNO Q Prototype Group</p>
            <p className="text-xs text-slate-400 pt-2">Developing custom driver firmware for BME688, MLX90614, and EC200U cellular subsystems.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white">Occupational Safety</h4>
            <p className="text-xs text-cyan-400 font-mono">NIOSH & OSHA Protocol Team</p>
            <p className="text-xs text-slate-400 pt-2">Formulating adaptive work-rest cycles and closed-loop evaporative misting efficiency metrics.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
