"""
HEATGUARD X - Hardware Bridge & Telemetry Engine
Supports:
- Arduino UNO Q Serial / USB connection
- REST Ingestion for Arduino UNO Q + EC200U Cellular / WiFi
- Real-time simulation engine with realistic thermodynamic modeling
- Multi-sensor state management (BME280, BME688, MLX90614, VEML7700, DS18B20)
"""

import asyncio
import json
import random
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from ai_engine import (
    SensorConfidenceIntelligence,
    MicroclimateFingerprinting,
    HeatForecastingEngine,
    AdaptiveProtectionEngine
)
from database import get_connection

class HardwareBridge:
    def __init__(self):
        self.mode = "SIMULATION" # "LIVE_HARDWARE" or "SIMULATION"
        self.connected_port: Optional[str] = None
        self.serial_connection = None
        self.last_hardware_packet_time: Optional[float] = None
        
        # Current system state
        self.fan_mode = "AUTO" # "AUTO" or "MANUAL"
        self.manual_fan_speed = 0 # 0 - 100%
        
        # Baseline simulation parameters
        self.sim_ambient_temp = 32.4
        self.sim_humidity = 64.0
        self.sim_solar_lux = 14500.0
        self.sim_gas_res = 48000.0
        self.sim_iaq = 45.0
        self.sim_fan_speed = 0
        self.sim_misting = False
        
        # Fault injection states
        self.fault_ds18_drift = False
        self.fault_bme_saturation = False
        self.fault_ir_occlusion = False
        self.fault_fan_stalled = False

        # Latest complete state snapshot
        self.current_state: Dict[str, Any] = {}
        self.update_telemetry_snapshot()

    def set_mode(self, mode: str):
        if mode in ["LIVE_HARDWARE", "SIMULATION"]:
            self.mode = mode

    def set_fan_control(self, mode: str, speed: int = 0):
        self.fan_mode = mode
        self.manual_fan_speed = max(0, min(100, speed))
        if self.mode == "SIMULATION":
            self.sim_fan_speed = self.manual_fan_speed if mode == "MANUAL" else self.sim_fan_speed

    def inject_simulation_params(self, params: Dict[str, Any]):
        """Allows Simulation Lab to manipulate thermodynamic & sensor variables"""
        if "temp_ambient" in params:
            self.sim_ambient_temp = float(params["temp_ambient"])
        if "humidity" in params:
            self.sim_humidity = float(params["humidity"])
        if "solar_lux" in params:
            self.sim_solar_lux = float(params["solar_lux"])
        if "fault_ds18_drift" in params:
            self.fault_ds18_drift = bool(params["fault_ds18_drift"])
        if "fault_bme_saturation" in params:
            self.fault_bme_saturation = bool(params["fault_bme_saturation"])
        if "fault_ir_occlusion" in params:
            self.fault_ir_occlusion = bool(params["fault_ir_occlusion"])
        if "fault_fan_stalled" in params:
            self.fault_fan_stalled = bool(params["fault_fan_stalled"])
        
        self.update_telemetry_snapshot()

    def process_hardware_packet(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ingests raw telemetry from physical Arduino UNO Q"""
        self.last_hardware_packet_time = time.time()
        self.mode = "LIVE_HARDWARE"
        
        # Map fields
        temp = float(data.get("ambient_temp", 31.0))
        hum = float(data.get("humidity", 55.0))
        lux = float(data.get("solar_lux", 1000.0))
        ds18 = float(data.get("probe_ds18b20", temp + 0.2))
        mlx_obj = float(data.get("ir_surface_temp", temp + 3.5))
        mlx_amb = float(data.get("ir_ambient_temp", temp))
        gas = float(data.get("gas_resistance", 45000.0))
        iaq = float(data.get("iaq_index", 50.0))
        
        return self._compute_and_save(
            source="arduino_uno_q_live",
            is_sim=False,
            t_amb=temp,
            hum=hum,
            lux=lux,
            ds18=ds18,
            mlx_obj=mlx_obj,
            mlx_amb=mlx_amb,
            gas=gas,
            iaq=iaq,
            press=float(data.get("pressure_hpa", 1013.25))
        )

    def generate_simulated_step(self) -> Dict[str, Any]:
        """Generates physics-based step with active fan cooling feedback"""
        # Thermal inertia & cooling effect from fan/misting
        cooling_power = (self.sim_fan_speed / 100.0) * 0.12
        if self.sim_misting:
            cooling_power += 0.08

        # Random micro-drift
        drift = (random.random() - 0.48) * 0.08
        
        # Apply thermodynamic delta
        self.sim_ambient_temp = max(18.0, min(58.0, self.sim_ambient_temp - cooling_power + drift))
        
        # Humidity drift
        hum_drift = (random.random() - 0.5) * 0.2
        if self.sim_misting:
            hum_drift += 0.3
        self.sim_humidity = max(10.0, min(98.0, self.sim_humidity + hum_drift))

        # Solar lux mild variation
        self.sim_solar_lux = max(0.0, self.sim_solar_lux + (random.random() - 0.5) * 150.0)

        # Apply faults if injected
        t_amb = 68.5 if self.fault_bme_saturation else self.sim_ambient_temp
        hum = 99.5 if self.fault_bme_saturation else self.sim_humidity
        ds18 = (t_amb + 7.8) if self.fault_ds18_drift else (t_amb + 0.35 + (random.random() - 0.5) * 0.1)
        mlx_obj = t_amb + 4.2 + (self.sim_solar_lux / 10000.0) * 1.5
        mlx_amb = (t_amb - 6.2) if self.fault_ir_occlusion else (t_amb - 0.2)

        return self._compute_and_save(
            source="simulation_engine",
            is_sim=True,
            t_amb=t_amb,
            hum=hum,
            lux=self.sim_solar_lux,
            ds18=ds18,
            mlx_obj=mlx_obj,
            mlx_amb=mlx_amb,
            gas=self.sim_gas_res,
            iaq=self.sim_iaq,
            press=1012.4 + (random.random() - 0.5) * 0.4
        )

    def _compute_and_save(
        self, source: str, is_sim: bool, t_amb: float, hum: float, lux: float,
        ds18: float, mlx_obj: float, mlx_amb: float, gas: float, iaq: float, press: float
    ) -> Dict[str, Any]:
        raw_telemetry = {
            "temp_ambient": round(t_amb, 2),
            "humidity": round(hum, 2),
            "solar_lux": round(lux, 1),
            "temp_probe_ds18": round(ds18, 2),
            "temp_ir_object": round(mlx_obj, 2),
            "temp_ir_ambient": round(mlx_amb, 2),
            "gas_resistance": round(gas, 0),
            "iaq_index": round(iaq, 1),
            "pressure_hpa": round(press, 2)
        }

        # 1. AI Sensor Confidence Intelligence
        confidence = SensorConfidenceIntelligence.evaluate(raw_telemetry)

        # 2. AI Microclimate Fingerprinting
        microclimate = MicroclimateFingerprinting.analyze(raw_telemetry)

        # 3. AI Heat Forecasting (15, 30, 60 min)
        forecasting = HeatForecastingEngine.forecast(raw_telemetry, microclimate)
        heat_index = forecasting["current"]["heat_index"]
        risk_level = forecasting["current"]["risk_level"]

        # 4. Self-Learning Adaptive Protection & Fan Control
        fan_override = 0 if self.fault_fan_stalled else self.manual_fan_speed
        mode = "MANUAL" if self.fault_fan_stalled else self.fan_mode
        intervention = AdaptiveProtectionEngine.evaluate_intervention(heat_index, mode, fan_override)
        
        self.sim_fan_speed = intervention["fan_speed_pct"]
        self.sim_misting = intervention["misting_active"]

        now_iso = datetime.now(timezone.utc).isoformat()

        # Compile total state packet
        packet = {
            "timestamp": now_iso,
            "mode": self.mode,
            "source": source,
            "is_simulation": is_sim,
            "telemetry": raw_telemetry,
            "confidence": confidence,
            "microclimate": microclimate,
            "forecasting": forecasting,
            "intervention": intervention,
            "hardware_health": {
                "arduino_uno_q": "ONLINE",
                "firmware": "HG-X-EDGE-1.4.2",
                "hmi_display": "ACTIVE",
                "cellular_ec200u": "STANDBY_READY",
                "last_hardware_ping": self.last_hardware_packet_time
            }
        }

        self.current_state = packet

        # Persist periodically to SQLite database
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO telemetry (
                timestamp, source, is_simulation, temp_ambient, humidity, pressure_hpa,
                gas_resistance, iaq_index, temp_ir_object, temp_ir_ambient, solar_lux,
                temp_probe_ds18, heat_index, risk_level, sensor_confidence, raw_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                now_iso, source, 1 if is_sim else 0, raw_telemetry["temp_ambient"],
                raw_telemetry["humidity"], raw_telemetry["pressure_hpa"], raw_telemetry["gas_resistance"],
                raw_telemetry["iaq_index"], raw_telemetry["temp_ir_object"], raw_telemetry["temp_ir_ambient"],
                raw_telemetry["solar_lux"], raw_telemetry["temp_probe_ds18"], heat_index,
                risk_level, confidence["score"], json.dumps(packet)
            ))

            # Trigger alert record if danger/critical
            if risk_level in ["DANGER", "EXTREME_DANGER"]:
                cursor.execute("""
                INSERT INTO alerts (timestamp, category, severity, title, description)
                VALUES (?, ?, ?, ?, ?)
                """, (
                    now_iso, "HEAT_DANGER", "CRITICAL" if risk_level == "EXTREME_DANGER" else "DANGER",
                    f"Elevated Heat Stress Alert: {heat_index:.1f}°C Heat Index",
                    f"Rothfusz Heat Index reached {heat_index:.1f}°C. Autonomous fan increased to {intervention['fan_speed_pct']}%."
                ))

            if confidence["status"] == "FAULT":
                cursor.execute("""
                INSERT INTO alerts (timestamp, category, severity, title, description)
                VALUES (?, ?, ?, ?, ?)
                """, (
                    now_iso, "SENSOR_FAULT", "WARNING",
                    "Sensor Confidence Degradation",
                    f"Confidence dropped to {confidence['score']}%. Detected: {', '.join(confidence['anomalies'])}"
                ))

            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving telemetry to DB: {e}")

        return packet

    def update_telemetry_snapshot(self):
        if self.mode == "SIMULATION":
            self.generate_simulated_step()

hardware_engine = HardwareBridge()

