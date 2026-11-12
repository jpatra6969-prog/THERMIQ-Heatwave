import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "HEATGUARD X | AI Predictive Heat Protection System",
  description:
    "HEATGUARD X is an AI-powered predictive thermal defense and heat injury mitigation platform powered by Arduino UNO Q Edge AI, microclimate fingerprinting, and real-time multi-sensor telemetry.",
  keywords: [
    "HeatGuard",
    "Heat Protection",
    "Heat Stroke Prevention",
    "Arduino UNO Q",
    "Edge AI",
    "Microclimate Fingerprinting",
    "Rothfusz Heat Index",
    "Predictive Cooling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#081522" />
      </head>
      <body className="bg-[#081522] text-[#F1F7FC] antialiased selection:bg-[#00D9E8] selection:text-[#081522]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
