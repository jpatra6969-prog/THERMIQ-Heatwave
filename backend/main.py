"""
HEATGUARD X - FastAPI High-Performance Backend & WebSocket Server
Powers the real-time predictive dashboard, hardware telemetry bridge, and AI intelligence pipeline.
"""

import asyncio
import csv
import io
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from database import init_db, get_connection
from hardware_bridge import hardware_engine

app = FastAPI(
    title="HEATGUARD X API",
    description="AI-Powered Predictive Heat Protection System REST & WebSocket API",
    version="1.0.0"
)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background broadcast loop
async def telemetry_background_worker():
    while True:
        try:
            if hardware_engine.mode == "SIMULATION":
                snapshot = hardware_engine.generate_simulated_step()
            else:
                snapshot = hardware_engine.current_state

            if manager.active_connections:
                await manager.broadcast(snapshot)
        except Exception as e:
            print(f"[Telemetry Worker Error] {e}")
        await asyncio.sleep(2.0)

@app.on_event("startup")
async def startup_event():
    init_db()
    asyncio.create_task(telemetry_background_worker())
    print("[HEATGUARD X] Backend initialized with SQLite & Background Telemetry Stream.")

# --- Pydantic Request Models ---
class FanControlRequest(BaseModel):
    mode: str # 'AUTO' or 'MANUAL'
    speed: Optional[int] = 0

class ModeSwitchRequest(BaseModel):
    mode: str # 'LIVE_HARDWARE' or 'SIMULATION'

class SimulationRequest(BaseModel):
    temp_ambient: Optional[float] = None
    humidity: Optional[float] = None
    solar_lux: Optional[float] = None
    fault_ds18_drift: Optional[bool] = None
    fault_bme_saturation: Optional[bool] = None
    fault_ir_occlusion: Optional[bool] = None
    fault_fan_stalled: Optional[bool] = None

class HardwareTelemetryPayload(BaseModel):
    device: Optional[str] = "UNO_Q"
    ambient_temp: float
    humidity: float
    pressure_hpa: Optional[float] = 1013.25
    gas_resistance: Optional[float] = 45000.0
    iaq_index: Optional[float] = 45.0
    ir_surface_temp: Optional[float] = None
    ir_ambient_temp: Optional[float] = None
    solar_lux: Optional[float] = 1000.0
    probe_ds18b20: Optional[float] = None

class AlertAckRequest(BaseModel):
    alert_id: int

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial immediate snapshot
        await websocket.send_json(hardware_engine.current_state)
        while True:
            # Listen for client command packets
            data_str = await websocket.receive_text()
            try:
                client_cmd = json.loads(data_str)
                action = client_cmd.get("action")
                if action == "SET_FAN":
                    hardware_engine.set_fan_control(client_cmd.get("mode", "AUTO"), client_cmd.get("speed", 0))
                elif action == "SET_MODE":
                    hardware_engine.set_mode(client_cmd.get("mode", "SIMULATION"))
                elif action == "SIMULATE":
                    hardware_engine.inject_simulation_params(client_cmd.get("params", {}))
                
                # Immediately push updated state
                await websocket.send_json(hardware_engine.current_state)
            except Exception as pe:
                print(f"[WS Command Parse Error] {pe}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- REST Endpoints ---
@app.get("/api/status")
def get_system_status():
    return {
        "status": "ONLINE",
        "system": "HEATGUARD X",
        "version": "2.4.0",
        "current_mode": hardware_engine.mode,
        "fan_mode": hardware_engine.fan_mode,
        "manual_fan_speed": hardware_engine.manual_fan_speed,
        "active_ws_clients": len(manager.active_connections)
    }

@app.get("/api/telemetry/live")
def get_live_telemetry():
    return hardware_engine.current_state

@app.post("/api/telemetry/mode")
def set_system_mode(req: ModeSwitchRequest):
    if req.mode not in ["LIVE_HARDWARE", "SIMULATION"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'LIVE_HARDWARE' or 'SIMULATION'.")
    hardware_engine.set_mode(req.mode)
    return {"success": True, "mode": hardware_engine.mode}

@app.post("/api/telemetry/simulate")
def inject_simulation(req: SimulationRequest):
    hardware_engine.inject_simulation_params(req.model_dump(exclude_unset=True))
    return {"success": True, "state": hardware_engine.current_state}

@app.post("/api/hardware/telemetry")
async def receive_hardware_telemetry(payload: HardwareTelemetryPayload):
    packet = hardware_engine.process_hardware_packet(payload.model_dump())
    await manager.broadcast(packet)
    return {"success": True, "processed": True, "heat_index": packet["forecasting"]["current"]["heat_index"]}

@app.get("/api/hardware/devices")
def get_device_health():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM device_health")
    devices = [dict(row) for row in cursor.fetchall()]
    conn.close()

    for dev in devices:
        if dev.get("metadata_json"):
            try:
                dev["metadata"] = json.loads(dev["metadata_json"])
            except Exception:
                dev["metadata"] = {}

    return {
        "devices": devices,
        "primary_mcu": "Arduino UNO Q Dual-Core",
        "total_nodes": len(devices),
        "online_nodes": sum(1 for d in devices if d["status"] == "ONLINE")
    }

@app.get("/api/protection/status")
def get_protection_status():
    state = hardware_engine.current_state
    return {
        "mode": hardware_engine.fan_mode,
        "fan_speed_pct": hardware_engine.sim_fan_speed,
        "misting_active": hardware_engine.sim_misting,
        "intervention": state.get("intervention", {}),
        "current_heat_index": state.get("forecasting", {}).get("current", {}).get("heat_index", 32.0),
        "risk_level": state.get("forecasting", {}).get("current", {}).get("risk_level", "SAFE")
    }

@app.post("/api/protection/fan")
def set_fan(req: FanControlRequest):
    hardware_engine.set_fan_control(req.mode, req.speed or 0)
    return {
        "success": True,
        "mode": hardware_engine.fan_mode,
        "fan_speed_pct": hardware_engine.sim_fan_speed
    }

@app.get("/api/telemetry/history")
def get_telemetry_history(limit: int = 40):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, timestamp, source, temp_ambient, humidity, pressure_hpa,
           gas_resistance, iaq_index, temp_ir_object, temp_probe_ds18,
           solar_lux, heat_index, risk_level, sensor_confidence
    FROM telemetry
    ORDER BY id DESC
    LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    rows.reverse()
    return rows

@app.get("/api/alerts")
def get_alerts(limit: int = 50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,))
    alerts = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return alerts

@app.post("/api/alerts/acknowledge")
def acknowledge_alert(req: AlertAckRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (req.alert_id,))
    conn.commit()
    conn.close()
    return {"success": True, "alert_id": req.alert_id}

@app.post("/api/alerts/clear")
def clear_all_alerts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM alerts")
    conn.commit()
    conn.close()
    return {"success": True, "cleared": True}

@app.get("/api/analytics/summary")
def get_analytics_summary():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT 
        COUNT(*) as total_samples,
        AVG(temp_ambient) as avg_temp,
        MAX(temp_ambient) as max_temp,
        MIN(temp_ambient) as min_temp,
        AVG(humidity) as avg_humidity,
        AVG(heat_index) as avg_heat_index,
        MAX(heat_index) as max_heat_index,
        AVG(sensor_confidence) as avg_confidence
    FROM telemetry
    """)
    summary = dict(cursor.fetchone() or {})
    conn.close()

    for k, v in summary.items():
        if isinstance(v, float):
            summary[k] = round(v, 2)

    return summary

@app.get("/api/analytics/export/csv")
def export_csv():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT timestamp, temp_ambient, humidity, pressure_hpa, temp_probe_ds18,
           temp_ir_object, solar_lux, heat_index, risk_level, sensor_confidence
    FROM telemetry ORDER BY id ASC LIMIT 500
    """)
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Timestamp", "Ambient Temp (°C)", "Humidity (%)", "Pressure (hPa)",
        "DS18B20 Probe (°C)", "MLX90614 Surface (°C)", "Solar Lux (lx)",
        "Rothfusz Heat Index (°C)", "Risk Level", "Sensor Confidence (%)"
    ])
    for row in rows:
        writer.writerow(list(row))

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=heatguard_x_report.csv"}
    )

@app.get("/api/hotspots")
def get_heat_hotspots():
    """Returns geographical and indoor layout hotspot positions with live sensor readings"""
    state = hardware_engine.current_state
    t = state.get("telemetry", {})
    hi = state.get("forecasting", {}).get("current", {}).get("heat_index", 33.5)

    return {
        "facility_name": "HEATGUARD X Research & Industrial Complex",
        "center_coordinates": {"lat": 28.6139, "lng": 77.2090}, # Geo location (e.g. New Delhi / Desert zone)
        "zones": [
            {
                "id": "zone-uno-q-core",
                "name": "Arduino UNO Q Primary Node (Solar Canopy)",
                "type": "OUTDOOR",
                "lat": 28.6142,
                "lng": 77.2094,
                "current_temp": t.get("temp_ambient", 33.5),
                "heat_index": hi,
                "solar_lux": t.get("solar_lux", 14500),
                "status": "MONITORING",
                "risk": state.get("forecasting", {}).get("current", {}).get("risk_level", "WARNING"),
                "sensors": ["BME280", "BME688", "MLX90614", "VEML7700", "DS18B20"]
            },
            {
                "id": "zone-esp32-enclosure",
                "name": "ESP32 Sub-Node (Trapped Machine Enclosure)",
                "type": "INDOOR",
                "lat": 28.6136,
                "lng": 77.2086,
                "current_temp": round(t.get("temp_ambient", 33.5) + 2.4, 1),
                "heat_index": round(hi + 3.1, 1),
                "solar_lux": 420,
                "status": "HOTSPOT_ALERT",
                "risk": "DANGER",
                "sensors": ["SHT31", "BMP280"]
            },
            {
                "id": "zone-worker-shelter",
                "name": "Evaporative Cooling Worker Shelter",
                "type": "SHELTER",
                "lat": 28.6133,
                "lng": 77.2098,
                "current_temp": round(max(24.0, t.get("temp_ambient", 33.5) - 6.5), 1),
                "heat_index": round(max(25.0, hi - 8.2), 1),
                "solar_lux": 850,
                "status": "PROTECTED",
                "risk": "SAFE",
                "sensors": ["BME280"]
            },
            {
                "id": "zone-perimeter-fence",
                "name": "Perimeter Heat Perimeter Station",
                "type": "OUTDOOR",
                "lat": 28.6148,
                "lng": 77.2082,
                "current_temp": round(t.get("temp_ambient", 33.5) + 0.8, 1),
                "heat_index": round(hi + 1.1, 1),
                "solar_lux": 16200,
                "status": "MONITORING",
                "risk": "EXTREME_CAUTION",
                "sensors": ["MLX90614", "VEML7700"]
            }
        ]
    }

