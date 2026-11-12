"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Cpu,
  Activity,
  Radio,
  Bell,
  Settings2,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { isConnected, mode, setSystemMode, isFahrenheit, toggleUnit, alerts, data } = useTelemetry();
  const [currentTime, setCurrentTime] = useState<string>("");
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const riskLevel = data?.forecasting?.current?.risk_level || "SAFE";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1D2F40] bg-[#06090E]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[#D0D9E2] hover:text-[#00D9E8] lg:hidden rounded-none bg-[#0D141F] border border-[#1D2F40]"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-none bg-[#0D141F] border border-[#1D2F40] group-hover:border-[#00D9E8] transition-colors">
              <Flame className="w-5 h-5 text-[#00D9E8] group-hover:text-[#D96226] transition-colors" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-[#FAF5EB] text-base sm:text-lg">
                  HEATGUARD
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-none bg-[#00D9E8] text-[#06090E] tracking-widest">
                  X
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#D0D9E2] font-mono hidden sm:inline">
                AI Predictive Thermal Defense
              </span>
            </div>
          </Link>
        </div>

        {/* Global Live Risk & Mode Status Pills */}
        <div className="hidden md:flex items-center gap-3">
          {/* Hardware Telemetry Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-xs font-semibold text-[#00D9E8]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Hardware</span>
          </div>

          {/* Current Heat Risk Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#1E252E] border border-[#2D3A4B]">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                riskLevel === "EXTREME_DANGER"
                  ? "bg-[#EF233C]"
                  : riskLevel === "DANGER"
                  ? "bg-[#D96226]"
                  : riskLevel === "EXTREME_CAUTION"
                  ? "bg-[#E57B36]"
                  : riskLevel === "CAUTION"
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
              }`}
            />
            <span className="text-[11px] font-mono uppercase text-[#D0D9E2]">Heat Risk:</span>
            <span
              className={`text-xs font-bold font-mono ${
                riskLevel === "EXTREME_DANGER"
                  ? "text-[#EF233C]"
                  : riskLevel === "DANGER"
                  ? "text-[#D96226]"
                  : riskLevel === "EXTREME_CAUTION"
                  ? "text-[#E57B36]"
                  : riskLevel === "CAUTION"
                  ? "text-yellow-300"
                  : "text-emerald-400"
              }`}
            >
              {riskLevel.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Right Side Tools & Status */}
        <div className="flex items-center gap-2.5 sm:gap-4">

          {/* WebSocket Ping Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#1E252E] border border-[#2D3A4B] text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-[#00D9E8]" : "bg-[#EF233C]"
              }`}
            />
            <span className="hidden sm:inline text-[#D0D9E2]">
              {isConnected ? "WS: REALTIME" : "WS: CONNECTING..."}
            </span>
          </div>

          {/* Unit Toggle (°C / °F) */}
          <button
            onClick={toggleUnit}
            className="px-2.5 py-1 text-xs font-bold font-mono rounded-none bg-[#1E252E] border border-[#2D3A4B] text-[#00D9E8] hover:border-[#00D9E8] transition-colors"
            title="Toggle Celsius / Fahrenheit"
          >
            {isFahrenheit ? "°F" : "°C"}
          </button>

          {/* Clock */}
          <div className="hidden lg:block text-xs font-mono text-[#D0D9E2] px-2.5 py-1 rounded-none bg-[#1E252E] border border-[#2D3A4B]">
            {currentTime || "--:--:--"}
          </div>
        </div>

      </div>
    </header>
  );
}

