"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  BrainCircuit,
  MapPin,
  Fan,
  BarChart3,
  AlertTriangle,
  HardDrive,
  FlaskConical,
  BookOpen,
  Wifi,
  CheckCircle,
  X
} from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/", label: "Home", icon: Home, badge: null },
  { href: "/command-center", label: "Command Center", icon: LayoutDashboard, badge: "LIVE" },
  { href: "/ai-intelligence", label: "AI Intelligence", icon: BrainCircuit, badge: "EDGE" },
  { href: "/heat-map", label: "Heat Map", icon: MapPin, badge: null },
  { href: "/adaptive-protection", label: "Adaptive Protection", icon: Fan, badge: null },
  { href: "/analytics", label: "Analytics & Reports", icon: BarChart3, badge: null },
  { href: "/alert-center", label: "Alert Center", icon: AlertTriangle, badge: "ALERT" },
  { href: "/device-management", label: "Device Management", icon: HardDrive, badge: "UNO Q" },
  { href: "/simulation-lab", label: "Simulation Lab", icon: FlaskConical, badge: "LAB" },
  { href: "/research-about", label: "Research & About", icon: BookOpen, badge: null },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data, alerts } = useTelemetry();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 flex flex-col justify-between border-r border-[#1D2F40] bg-[#06090E] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="px-3 pb-3 text-[10px] font-mono tracking-widest uppercase text-[#D0D9E2]/70">
            Operations & Intelligence
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-none text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-[#1E252E] border border-[#1D2F40]"
                    : "hover:bg-[#1E252E] border border-transparent"
                }`}
                style={
                  isActive
                    ? { color: "#00D9E8" }
                    : { color: "#D0D9E2" }
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: isActive ? "#00D9E8" : "#D0D9E2" }}
                  />
                  <span style={{ color: isActive ? "#FAF5EB" : "#D0D9E2" }}>{item.label}</span>
                </div>

                {item.badge === "ALERT" && unreadAlerts > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-none bg-[#EF233C] text-white">
                    {unreadAlerts}
                  </span>
                ) : item.badge ? (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-none tracking-wider"
                    style={{
                      background: "rgba(0,217,232,0.1)",
                      color: "#00D9E8",
                      border: "1px solid #1D2F40",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Footer Edge Status Card */}
        <div className="p-3 border-t border-[#1D2F40]">
          <div className="p-3 rounded-none border border-[#1D2F40] bg-[#0D141F]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#00D9E8]">
                <span className="w-2 h-2 rounded-none bg-[#00D9E8]" />
                Arduino UNO Q Edge
              </span>
              <span className="text-[10px] font-mono rounded-none px-1.5 py-0.5 text-[#10b981] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)]">
                ARM CORTEX
              </span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-[#D0D9E2]">
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="font-bold text-[#00D9E8]">{data?.confidence?.score ?? 96.5}%</span>
              </div>
              <div className="flex justify-between">
                <span>Modem:</span>
                <span className="text-[#10b981]">EC200U LTE</span>
              </div>
              <div className="flex justify-between">
                <span>HMI Display:</span>
                <span className="text-[#00AFCB]">7&quot; Touch Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
