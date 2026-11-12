"""
HEATGUARD X - Database Layer (SQLite)
Supports persistent storage for sensor telemetry, AI predictions, alerts, and intervention logs.
"""

import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "heatguard.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Sensor Telemetry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        source TEXT DEFAULT 'arduino_uno_q', -- 'arduino_uno_q', 'esp32_subnode', 'simulation'
        is_simulation INTEGER DEFAULT 0,
        temp_ambient REAL,
        humidity REAL,
        pressure_hpa REAL,
        gas_resistance REAL,
        iaq_index REAL,
        temp_ir_object REAL,
        temp_ir_ambient REAL,
        solar_lux REAL,
        temp_probe_ds18 REAL,
        heat_index REAL,
        risk_level TEXT,
        sensor_confidence REAL,
        raw_json TEXT
    );
    """)

    # AI Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        horizon_minutes INTEGER, -- 15, 30, 60
        predicted_temp REAL,
        predicted_heat_index REAL,
        confidence_score REAL,
        risk_level TEXT,
        explanation TEXT
    );
    """)

    # System Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        category TEXT, -- 'HEAT_DANGER', 'SENSOR_FAULT', 'CONNECTIVITY', 'INTERVENTION'
        severity TEXT, -- 'INFO', 'WARNING', 'DANGER', 'CRITICAL'
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        acknowledged INTEGER DEFAULT 0
    );
    """)

    # Intervention / Fan Control History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS intervention_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        mode TEXT, -- 'AUTO', 'MANUAL_OVERRIDE'
        fan_speed_pct INTEGER,
        misting_active INTEGER,
        ventilation_active INTEGER,
        pre_intervention_heat_index REAL,
        post_intervention_heat_index REAL,
        effectiveness_score REAL,
        reason TEXT
    );
    """)

    # Device Health & Status Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS device_health (
        device_id TEXT PRIMARY KEY,
        device_name TEXT NOT NULL,
        role TEXT NOT NULL,
        firmware_version TEXT,
        status TEXT, -- 'ONLINE', 'DEGRADED', 'OFFLINE'
        last_heartbeat TEXT,
        signal_dbm INTEGER,
        battery_pct INTEGER,
        error_count INTEGER DEFAULT 0,
        metadata_json TEXT
    );
    """)

    conn.commit()

    # Pre-populate device health records if empty
    cursor.execute("SELECT COUNT(*) FROM device_health")
    if cursor.fetchone()[0] == 0:
        initial_devices = [
            ("UNO_Q_MAIN", "Arduino UNO Q (Main Edge Processor)", "Master Edge AI & Controller", "HG-X-EDGE-1.4.2", "ONLINE", datetime.utcnow().isoformat(), -58, 98, 0, json.dumps({"sensors": ["BME280", "BME688", "MLX90614", "VEML7700", "DS18B20"], "cellular": "EC200U", "hmi": "7_INCH_NEXTION"})),
            ("ESP32_PERIMETER", "ESP32 Auxiliary Sensor Hub", "Perimeter Boundary Monitor", "v2.1.0-esp", "ONLINE", datetime.utcnow().isoformat(), -64, 91, 0, json.dumps({"sensors": ["SHT31", "BMP280"], "connection": "BLE / ESP-NOW"})),
            ("HMI_DISPLAY_7IN", "7-Inch Resistive HMI Terminal", "Local Operator Console", "DWIN-UI-v3.0", "ONLINE", datetime.utcnow().isoformat(), -45, 100, 0, json.dumps({"resolution": "800x480", "protocol": "UART Serial2 115200"})),
            ("MODEM_EC200U", "Quectel EC200U Cellular Module", "Fail-Safe Cloud & SMS Uplink", "EC200UEU_AA", "ONLINE", datetime.utcnow().isoformat(), -72, 100, 0, json.dumps({"rat": "LTE Cat-1", "operator": "Primary Carrier", "band": "B3/B7/B20"}))
        ]
        cursor.executemany("""
        INSERT INTO device_health (device_id, device_name, role, firmware_version, status, last_heartbeat, signal_dbm, battery_pct, error_count, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_devices)
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("HeatGuard X Database initialized successfully.")

