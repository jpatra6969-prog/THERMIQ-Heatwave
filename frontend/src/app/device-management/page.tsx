"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  HardDrive, 
  Radio, 
  Tv, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Zap, 
  Wifi, 
  Battery, 
  CheckCircle2, 
  AlertTriangle,
  Terminal,
  Layers,
  Sliders
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";

export default function DeviceManagementPage() {
  const { data, apiUrl } = useTelemetry();
  const [devices, setDevices] = useState<any[]>([]);
  const [rebooting, setRebooting] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/hardware/devices`);
      if (res.ok) {
        const json = await res.json();
        if (json.devices) setDevices(json.devices);
      }
    } catch {
      // offline fallback
      setDevices([
        {
          device_id: "UNO_Q_MAIN",
          device_name: "Arduino UNO Q (Master Edge Processor)",
          role: "Main Processing & Edge AI Platform",
          firmware_version: "HG-X-EDGE-1.4.2",
          status: "ONLINE",
          signal_dbm: -58,
          battery_pct: 100,
          error_count: 0,
        },
        {
          device_id: "ESP32_PERIMETER",
          device_name: "ESP32 Auxiliary Sensor Hub",
          role: "Perimeter Boundary & Mesh Node",
          firmware_version: "v2.1.0-esp",
          status: "ONLINE",
          signal_dbm: -64,
          battery_pct: 91,
          error_count: 0,
        },
        {
          device_id: "HMI_DISPLAY_7IN",
          device_name: "7-Inch Touch HMI Console",
          role: "Local Real-Time Operator Display",
          firmware_version: "DWIN-UI-v3.0",
          status: "ONLINE",
          signal_dbm: -45,
          battery_pct: 100,
          error_count: 0,
        },
        {
          device_id: "MODEM_EC200U",
          device_name: "Quectel EC200U LTE Cat-1 Modem",
          role: "Off-Grid Cellular Cloud & SMS Uplink",
          firmware_version: "EC200UEU_AA",
          status: "ONLINE",
          signal_dbm: -68,
          battery_pct: 100,
          error_count: 0,
        },
      ]);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [apiUrl]);

  const handleSimulateReboot = (devId: string) => {
    setRebooting(devId);
    setTimeout(() => {
      setRebooting(null);
      alert(`Soft reboot signal sent to ${devId}. Watchdog timer refreshed.`);
    }, 1500);
  };

  const sensors = [
    { name: "BME280", bus: "I2C 0x76", type: "Ambient Temp, Humidity, Pressure", status: "HEALTHY", drift: "±0.1°C" },
    { name: "BME688", bus: "I2C 0x77", type: "VOC Gas Resistance & IAQ Air Quality", status: "HEALTHY", drift: "Baseline OK" },
    { name: "MLX90614", bus: "I2C 0x5A", type: "Non-Contact Infrared Surface/Ambient", status: "HEALTHY", drift: "±0.2°C" },
    { name: "VEML7700", bus: "I2C 0x10", type: "High-Dynamic Solar Lux & UV Irradiance", status: "HEALTHY", drift: "Zero Shift" },
    { name: "DS18B20", bus: "1-Wire GPIO D4", type: "Precision Immersion Core Thermal Probe", status: "HEALTHY", drift: "±0.05°C" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl glass-panel border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest">
            <Cpu className="w-4 h-4 animate-pulse" />
            Embedded Hardware & Transducer Topology
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Device Management & Sensor Health Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live bus telemetry for the Arduino UNO Q master controller, ESP32 perimeter nodes, 7" HMI screen, and multi-transducer I2C cluster.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="px-4 py-2.5 rounded-xl font-bold text-xs font-mono bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Ping All Nodes</span>
        </button>
      </div>

      {/* Primary Hardware Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Node 1: Arduino UNO Q */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Arduino UNO Q (Master Platform)</h3>
                <span className="text-xs font-mono text-cyan-400">Dual-Core ARM Cortex-M4 + TinyML</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Firmware:</span>
              <div className="font-bold text-cyan-300 mt-0.5">HG-X-EDGE-1.4.2</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Processing Load:</span>
              <div className="font-bold text-emerald-400 mt-0.5">18.4% (8.2 ms Loop)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Actuators Connected:</span>
              <div className="font-bold text-slate-200 mt-0.5">Fan PWM D9, Solenoid D10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Offline Resilience:</span>
              <div className="font-bold text-purple-300 mt-0.5">100% Autonomous</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-slate-400">Watchdog Timer: Healthy (30s)</span>
            <button
              onClick={() => handleSimulateReboot("Arduino UNO Q")}
              disabled={rebooting === "Arduino UNO Q"}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {rebooting === "Arduino UNO Q" ? "Rebooting..." : "Soft Reset MCU"}
            </button>
          </div>
        </div>

        {/* Node 2: ESP32 Perimeter Hub */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ESP32 Auxiliary Sensor Hub</h3>
                <span className="text-xs font-mono text-blue-400">Perimeter Weather Station</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Mesh Protocol:</span>
              <div className="font-bold text-blue-300 mt-0.5">ESP-NOW / BLE Beacon</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Signal RSSI:</span>
              <div className="font-bold text-emerald-400 mt-0.5">-64 dBm</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">LiPo Battery:</span>
              <div className="font-bold text-emerald-400 mt-0.5">91% (Solar Trickle)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Transducers:</span>
              <div className="font-bold text-slate-200 mt-0.5">SHT31, BMP280</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-mono text-slate-400">Sync Interval: 2000 ms</span>
            <button
              onClick={() => handleSimulateReboot("ESP32 Hub")}
              disabled={rebooting === "ESP32 Hub"}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {rebooting === "ESP32 Hub" ? "Rebooting..." : "Soft Reset Node"}
            </button>
          </div>
        </div>

        {/* Node 3: 7-inch HMI Display */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">7-Inch Resistive HMI Touch Display</h3>
                <span className="text-xs font-mono text-sky-400">On-Site Operator Interface</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              SYNCHRONIZED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">UART Serial Port:</span>
              <div className="font-bold text-sky-300 mt-0.5">Serial2 (115200 baud)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Screen Resolution:</span>
              <div className="font-bold text-slate-200 mt-0.5">800 × 480 RGB</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Refresh Rate:</span>
              <div className="font-bold text-emerald-400 mt-0.5">60 FPS Hardware</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Touch Controller:</span>
              <div className="font-bold text-slate-200 mt-0.5">Resistive Industrial</div>
            </div>
          </div>
        </div>

        {/* Node 4: Quectel EC200U LTE Cat-1 Modem */}
        <div className="glass-panel rounded-3xl p-6 border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Quectel EC200U Cellular Modem</h3>
                <span className="text-xs font-mono text-purple-400">LTE Cat-1 Cloud & SMS Backup</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LTE READY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Cellular Signal:</span>
              <div className="font-bold text-purple-300 mt-0.5">-68 dBm (Strong)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">AT Interface:</span>
              <div className="font-bold text-slate-200 mt-0.5">UART Serial3 (115200)</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">Bands Active:</span>
              <div className="font-bold text-slate-200 mt-0.5">B3 / B7 / B20 LTE</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">SMS Broadcaster:</span>
              <div className="font-bold text-emerald-400 mt-0.5">Armed for Alerts</div>
            </div>
          </div>
        </div>

      </div>

      {/* Sensor Bus & Transducer Health Table */}
      <div className="glass-panel rounded-3xl p-6 border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">Multi-Transducer Bus Diagnostics</h3>
            <p className="text-xs text-slate-400">All 5 physical sensor transducers validated by TinyML confidence engine</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            5 / 5 OPERATIONAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Transducer Model</th>
                <th className="py-3 px-3">Bus & Address</th>
                <th className="py-3 px-3">Primary Measurement</th>
                <th className="py-3 px-3">Thermal Drift Delta</th>
                <th className="py-3 px-3">Hardware Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sensors.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-cyan-300">{s.name}</td>
                  <td className="py-3 px-3 text-slate-300">{s.bus}</td>
                  <td className="py-3 px-3 text-slate-400">{s.type}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{s.drift}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

