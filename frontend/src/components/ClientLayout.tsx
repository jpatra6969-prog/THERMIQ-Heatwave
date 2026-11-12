"use client";

import React, { useState } from "react";
import { TelemetryProvider } from "@/context/TelemetryContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TelemetryProvider>
      <div className="relative min-h-screen bg-[#06090E] text-[#FAF5EB] flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 lg:pl-64 transition-all duration-300 w-full overflow-x-hidden p-3 sm:p-5">
            <div className="w-full space-y-5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TelemetryProvider>
  );
}

