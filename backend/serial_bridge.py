"""
HEATGUARD X - Simple Arduino Serial Bridge
Reads JSON from Arduino UNO Q USB COM port and sends to FastAPI.
Usage: python serial_bridge.py [COM_PORT] (default: COM3)
"""

import sys
import json
import time
import requests

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("pyserial is required: pip install pyserial")
    sys.exit(1)

FASTAPI_URL = "http://127.0.0.1:8000/api/hardware/telemetry"

def auto_detect_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        if "Arduino" in p.description or "CH340" in p.description or "USB" in p.description:
            return p.device
    return ports[0].device if ports else "COM3"

port = sys.argv[1] if len(sys.argv) > 1 else auto_detect_port()
print(f"[HEATGUARD X] Connecting to Arduino UNO Q on {port} (115200 baud)...")

try:
    ser = serial.Serial(port, 115200, timeout=2)
    time.sleep(2) # wait for Arduino reset
    print(f"[HEATGUARD X] Connected to {port}! Streaming live telemetry to {FASTAPI_URL}...")
    
    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if line.startswith("{") and line.endswith("}"):
            try:
                data = json.loads(line)
                res = requests.post(FASTAPI_URL, json=data, timeout=1)
                print(f"[{time.strftime('%X')}] Live Packet Synced -> Temp: {data.get('ambient_temp')}C | HI: {res.json().get('heat_index')}C")
            except Exception as e:
                print(f"Sync error: {e}")
except Exception as e:
    print(f"Could not open serial port {port}: {e}")
    print("Tip: If running without physical Arduino hardware, Simulation Mode is already active automatically!")

