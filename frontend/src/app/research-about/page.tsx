"use client";

import React from "react";
import { 
  BookOpen, 
  Flame 
} from "lucide-react";

export default function ResearchAboutPage() {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-none bg-[#0D141F] border border-[#1D2F40] shadow-lg shadow-black/40">
        <div>
          <div className="flex items-center gap-2 text-[#00D9E8] text-xs font-mono uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            Academic Research & Specifications
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#FAF5EB] mt-2">
            HEATGUARD X Research & Architecture
          </h1>
          <p className="text-sm text-[#D0D9E2] mt-2 max-w-3xl leading-relaxed">
            A comprehensive overview of our predictive heat defense framework, Edge AI models executing on Arduino UNO Q, sensor redundancy algorithms, and hardware schematics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-none text-xs font-mono text-[#00D9E8] bg-[#00D9E8]/10 border border-[#00D9E8]/30">
            WHITEPAPER VERSION 2.4
          </span>
        </div>
      </div>

      {/* Abstract & Problem Statement */}
      <section className="rounded-none bg-[#0D141F] border border-[#1D2F40] p-6 sm:p-8 space-y-4 shadow-lg shadow-black/40">
        <h2 className="text-xl font-bold text-[#FAF5EB] flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#EF233C]" />
          1. Executive Summary & Problem Formulation
        </h2>
        <p className="text-sm text-[#D0D9E2] leading-relaxed">
          Over 1 billion industrial, agricultural, and construction laborers worldwide are regularly exposed to lethal environmental heat stress. 
          Standard macro-weather station reports fundamentally fail to capture localized <em>microclimate thermal entrapment</em>—where radiant heat from direct solar exposure, 
          equipment surfaces, and stagnant high humidity cause core body temperatures to surge past 40.5°C within minutes, triggering heat stroke and permanent neurological injury.
        </p>
        <p className="text-sm text-[#D0D9E2] leading-relaxed">
          <strong>HEATGUARD X</strong> addresses this life-critical challenge through a hybrid edge computing platform built upon the <strong>Arduino UNO Q</strong>. 
          By combining multi-transducer environmental data with TinyML models, the system predicts impending heat index surges 15 to 60 minutes in advance, 
          autonomously modulates high-power cooling actuators, and enforces OSHA/NIOSH compliant work-rest schedules entirely offline.
        </p>
      </section>

    </div>
  );
}
