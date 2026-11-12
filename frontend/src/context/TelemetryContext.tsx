"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface TelemetryData {
  temp_ambient: number;
  humidity: number;
  solar_lux: number;
  temp_probe_ds18: number;
  temp_ir_object: number;
  temp_ir_ambient: number;
  gas_resistance: number;
  iaq_index: number;
  pressure_hpa: number;
}

export interface ConfidenceData {
  score: number;
  status: "OPTIMAL" | "DEGRADED" | "FAULT";
  sensor_health: Record<string, string>;
  anomalies: string[];
  redundancy_agreement: number;
}

export interface MicroclimateData {
  fingerprint_id: number;
  profile_name: string;
  environment_type: string;
  heat_accumulation_rate: string;
  solar_gain_pct: number;
  humidity_entrapment_pct: number;
  surface_radiant_delta: number;
  thermal_inertia_index: number;
  description: string;
}

export interface ForecastHorizon {
  predicted_temp: number;
  predicted_heat_index: number;
  delta: number;
  confidence: number;
  risk_level: string;
  risk_color: string;
}

export interface ForecastingData {
  current: {
    temp: number;
    humidity: number;
    heat_index: number;
    risk_level: string;
    risk_color: string;
    warning: string;
  };
  horizon_15m: ForecastHorizon;
  horizon_30m: ForecastHorizon;
  horizon_60m: ForecastHorizon;
  ai_explanation: string;
}

export interface InterventionData {
  mode: "AUTO" | "MANUAL";
  fan_speed_pct: number;
  fan_pwm_val: number;
  misting_active: boolean;
  ventilation_louvers_open: boolean;
  trigger_reason: string;
  effectiveness_score: number;
  estimated_delta_celsius: number;
  recommendations: {
    work_rest_cycle: string;
    hydration_intake_ml_hr: number;
    protocol_status: string;
    action_items: string[];
  };
}

export interface SystemPacket {
  timestamp: string;
  mode: "LIVE_HARDWARE" | "SIMULATION";
  source: string;
  is_simulation: boolean;
  telemetry: TelemetryData;
  confidence: ConfidenceData;
  microclimate: MicroclimateData;
  forecasting: ForecastingData;
  intervention: InterventionData;
  hardware_health: {
    arduino_uno_q: string;
    firmware: string;
    hmi_display: string;
    cellular_ec200u: string;
    last_hardware_ping?: number;
  };
}

export interface AlertItem {
  id: number;
  timestamp: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  acknowledged: number;
}

interface TelemetryContextType {
  data: SystemPacket | null;
  isConnected: boolean;
  mode: "LIVE_HARDWARE" | "SIMULATION";
  isFahrenheit: boolean;
  alerts: AlertItem[];
  toggleUnit: () => void;
  setSystemMode: (mode: "LIVE_HARDWARE" | "SIMULATION") => Promise<void>;
  setFanSpeed: (mode: "AUTO" | "MANUAL", speed?: number) => Promise<void>;
  injectSimulation: (params: Record<string, any>) => Promise<void>;
  acknowledgeAlert: (id: number) => Promise<void>;
  clearAlerts: () => Promise<void>;
  apiUrl: string;
}

// Fallback baseline initial state
const defaultInitialState: SystemPacket = {
  timestamp: "2026-11-10T03:00:00Z",
  mode: "SIMULATION",
  source: "initial_cache",
  is_simulation: true,
  telemetry: {
    temp_ambient: 32.8,
    humidity: 64.2,
    solar_lux: 15400,
    temp_probe_ds18: 33.1,
    temp_ir_object: 36.9,
    temp_ir_ambient: 32.6,
    gas_resistance: 46200,
    iaq_index: 48,
    pressure_hpa: 1012.8,
  },
  confidence: {
    score: 96.5,
    status: "OPTIMAL",
    sensor_health: {
      bme280: "HEALTHY",
      bme688: "HEALTHY",
      mlx90614: "HEALTHY",
      veml7700: "HEALTHY",
      ds18b20: "HEALTHY",
    },
    anomalies: [],
    redundancy_agreement: 98.8,
  },
  microclimate: {
    fingerprint_id: 1,
    profile_name: "Direct Solar Canopy",
    environment_type: "OUTDOOR_EXPOSED",
    heat_accumulation_rate: "VERY_HIGH",
    solar_gain_pct: 38.5,
    humidity_entrapment_pct: 42.1,
    surface_radiant_delta: 4.1,
    thermal_inertia_index: 4.6,
    description: "Intense solar irradiance with rapid surface heating.",
  },
  forecasting: {
    current: {
      temp: 32.8,
      humidity: 64.2,
      heat_index: 39.4,
      risk_level: "DANGER",
      risk_color: "#ea580c",
      warning: "Heat cramps and exhaustion likely; heat stroke possible.",
    },
    horizon_15m: {
      predicted_temp: 33.6,
      predicted_heat_index: 41.2,
      delta: 1.8,
      confidence: 96.4,
      risk_level: "DANGER",
      risk_color: "#ea580c",
    },
    horizon_30m: {
      predicted_temp: 34.4,
      predicted_heat_index: 43.1,
      delta: 3.7,
      confidence: 92.1,
      risk_level: "EXTREME_DANGER",
      risk_color: "#dc2626",
    },
    horizon_60m: {
      predicted_temp: 35.8,
      predicted_heat_index: 46.5,
      delta: 7.1,
      confidence: 87.8,
      risk_level: "EXTREME_DANGER",
      risk_color: "#dc2626",
    },
    ai_explanation:
      "Solar irradiance surge (15,400 lx) with 64.2% relative humidity is producing a severe radiant heat trap. Edge AI forecasting indicates threshold breach within 30 minutes.",
  },
  intervention: {
    mode: "AUTO",
    fan_speed_pct: 85,
    fan_pwm_val: 216,
    misting_active: true,
    ventilation_louvers_open: true,
    trigger_reason: "DANGER_THRESHOLD_BREACHED",
    effectiveness_score: 93.3,
    estimated_delta_celsius: 3.2,
    recommendations: {
      work_rest_cycle: "30 min Work / 30 min Rest per hour",
      hydration_intake_ml_hr: 800,
      protocol_status: "HIGH_STRESS_PROTOCOL",
      action_items: [
        "Maintain fluid replenishment of at least 800 mL/hr electrolyte solution.",
        "Adhere strictly to 30 min Work / 30 min Rest per hour.",
        "Ensure UNO Q failsafe heartbeat is actively communicating over EC200U cellular link.",
        "Verify surface temperatures on equipment via MLX90614 IR pyrometer.",
      ],
    },
  },
  hardware_health: {
    arduino_uno_q: "ONLINE",
    firmware: "HG-X-EDGE-1.4.2",
    hmi_display: "ACTIVE",
    cellular_ec200u: "STANDBY_READY",
  },
};

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SystemPacket>(defaultInitialState);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  
  // API URL defaults to port 8000
  const apiUrl = typeof window !== "undefined" ? "http://127.0.0.1:8000" : "http://127.0.0.1:8000";
  const wsUrl = typeof window !== "undefined" ? "ws://127.0.0.1:8000/ws" : "ws://127.0.0.1:8000/ws";

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/alerts`);
      if (res.ok) {
        const json = await res.json();
        setAlerts(json);
      }
    } catch {
      // offline fallback
    }
  }, [apiUrl]);

  // WebSocket Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed && parsed.telemetry) {
              setData(parsed);
            }
          } catch (err) {
            console.error("WS Parse error", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws?.close();
        };
      } catch (e) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();
    fetchAlerts();

    const alertInterval = setInterval(fetchAlerts, 5000);

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(alertInterval);
    };
  }, [wsUrl, fetchAlerts]);

  const toggleUnit = () => setIsFahrenheit((prev) => !prev);

  const setSystemMode = async (newMode: "LIVE_HARDWARE" | "SIMULATION") => {
    try {
      const res = await fetch(`${apiUrl}/api/telemetry/mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        setData((prev) => (prev ? { ...prev, mode: newMode } : prev));
      }
    } catch (err) {
      console.warn("API offline, updating client mode locally", err);
      setData((prev) => (prev ? { ...prev, mode: newMode } : prev));
    }
  };

  const setFanSpeed = async (mode: "AUTO" | "MANUAL", speed: number = 0) => {
    try {
      const res = await fetch(`${apiUrl}/api/protection/fan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, speed }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            intervention: {
              ...prev.intervention,
              mode,
              fan_speed_pct: mode === "MANUAL" ? speed : prev.intervention.fan_speed_pct,
            },
          };
        });
      }
    } catch (err) {
      console.warn("API offline, updating fan speed locally", err);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          intervention: {
            ...prev.intervention,
            mode,
            fan_speed_pct: mode === "MANUAL" ? speed : prev.intervention.fan_speed_pct,
          },
        };
      });
    }
  };

  const injectSimulation = async (params: Record<string, any>) => {
    try {
      const res = await fetch(`${apiUrl}/api/telemetry/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.state) setData(json.state);
      }
    } catch (err) {
      console.warn("API offline, applying simulated parameters locally", err);
      setData((prev) => {
        if (!prev) return prev;
        const newTemp = params.temp_ambient ?? prev.telemetry.temp_ambient;
        const newHum = params.humidity ?? prev.telemetry.humidity;
        const newLux = params.solar_lux ?? prev.telemetry.solar_lux;
        return {
          ...prev,
          telemetry: {
            ...prev.telemetry,
            temp_ambient: newTemp,
            humidity: newHum,
            solar_lux: newLux,
          },
        };
      });
    }
  };

  const acknowledgeAlert = async (id: number) => {
    try {
      await fetch(`${apiUrl}/api/alerts/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: id }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: 1 } : a))
      );
    } catch {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: 1 } : a))
      );
    }
  };

  const clearAlerts = async () => {
    try {
      await fetch(`${apiUrl}/api/alerts/clear`, { method: "POST" });
      setAlerts([]);
    } catch {
      setAlerts([]);
    }
  };

  return (
    <TelemetryContext.Provider
      value={{
        data,
        isConnected,
        mode: data?.mode || "SIMULATION",
        isFahrenheit,
        alerts,
        toggleUnit,
        setSystemMode,
        setFanSpeed,
        injectSimulation,
        acknowledgeAlert,
        clearAlerts,
        apiUrl,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
