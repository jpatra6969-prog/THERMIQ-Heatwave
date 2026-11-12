"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface MapZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  temp: number;
  heat_index: number;
  humidity: number;
  solar_lux: number;
  risk: string;
  sensors: string[];
  mcu: string;
}

interface LeafletMapProps {
  zones: MapZone[];
  selectedZone: MapZone | null;
  onSelectZone: (zone: MapZone) => void;
  isFahrenheit: boolean;
}

export function LeafletMap({ zones, selectedZone, onSelectZone, isFahrenheit }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const circlesRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Prevent re-initialization
      if (!mapInstanceRef.current) {
        const centerLat = zones[0]?.lat ?? 28.6139;
        const centerLng = zones[0]?.lng ?? 77.2090;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 16,
          zoomControl: false,
        });

        // Add Dark Theme CartoDB tiles for futuristic aesthetic
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> | HEATGUARD X GIS',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers/circles
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      Object.values(circlesRef.current).forEach((c: any) => map.removeLayer(c));
      markersRef.current = {};
      circlesRef.current = {};

      zones.forEach((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const color = zone.risk === "EXTREME_DANGER"
          ? "#dc2626"
          : zone.risk === "DANGER"
          ? "#ea580c"
          : zone.risk === "EXTREME_CAUTION"
          ? "#f59e0b"
          : zone.risk === "CAUTION"
          ? "#eab308"
          : "#10b981";

        // Thermal Contour Radius Circle
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.risk.includes("DANGER") ? 80 : 50,
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.35 : 0.2,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: isSelected ? undefined : "4, 6",
        }).addTo(map);

        circlesRef.current[zone.id] = circle;

        // Custom Neon HTML Icon
        const tempDisplay = isFahrenheit 
          ? `${((zone.heat_index * 9) / 5 + 32).toFixed(1)}°F` 
          : `${zone.heat_index.toFixed(1)}°C`;

        const customHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 12px;
              background: rgba(11, 17, 32, 0.9);
              border: 2px solid ${color};
              box-shadow: 0 0 ${isSelected ? "20px" : "10px"} ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${color};
              font-family: monospace;
              font-weight: 900;
              font-size: 11px;
            ">
              HI
            </div>
            <div style="
              position: absolute;
              top: 42px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(5, 8, 17, 0.95);
              border: 1px solid rgba(6, 182, 212, 0.3);
              color: #f8fafc;
              font-family: monospace;
              font-size: 10px;
              font-weight: bold;
              padding: 2px 6px;
              border-radius: 6px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            ">
              ${zone.name.split("(")[0]} (${tempDisplay})
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-leaflet-marker",
          html: customHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(map);

        marker.on("click", () => {
          onSelectZone(zone);
        });

        // Popup Content
        const popupContent = `
          <div style="
            background: #0b1120;
            color: #f1f5f9;
            font-family: monospace;
            padding: 8px;
            border-radius: 8px;
            min-width: 180px;
          ">
            <div style="color: #06b6d4; font-weight: bold; font-size: 12px;">${zone.name}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Zone Type: ${zone.type}</div>
            <div style="font-size: 13px; font-weight: bold; color: ${color}; margin-top: 4px;">
              Heat Index: ${tempDisplay}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
              Sensors: ${zone.sensors.join(", ")}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "heatguard-leaflet-popup",
        });

        markersRef.current[zone.id] = marker;
      });

      // Fly to selected zone if changed
      if (selectedZone && map) {
        map.flyTo([selectedZone.lat, selectedZone.lng], 16.5, {
          duration: 1.2,
        });
        markersRef.current[selectedZone.id]?.openPopup();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [zones, selectedZone, onSelectZone, isFahrenheit]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-cyan-500/30">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <style jsx global>{`
        .heatguard-leaflet-popup .leaflet-popup-content-wrapper {
          background: #0b1120 !important;
          border: 1px solid rgba(6, 182, 212, 0.4) !important;
          border-radius: 12px !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.25) !important;
        }
        .heatguard-leaflet-popup .leaflet-popup-tip {
          background: #0b1120 !important;
          border: 1px solid rgba(6, 182, 212, 0.4) !important;
        }
        .leaflet-container {
          background-color: #050811 !important;
        }
      `}</style>
    </div>
  );
}

