# HEATGUARD X – AI-Powered Predictive Heat Protection System

> **Next-Gen Autonomous Edge AI Thermal Defense & Biometric Heat Stroke Mitigation Platform**  
> Powered by **Arduino UNO Q Dual-Core**, **FastAPI**, **SQLite**, and **Next.js (TypeScript + Tailwind CSS + Lucide + Framer Motion + Recharts)**.

---

## 🌐 Live Website Links & Access

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI REST API & Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **FastAPI Alternative ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Real-Time WebSocket Stream:** `ws://127.0.0.1:8000/ws`

---

## 🚀 System Architecture & Pages

| Page Route | Description |
| :--- | :--- |
| **`/` (Home)** | Project introduction, hero section, 5 core innovations, hardware breakdown, real-world impact & OSHA standards. |
| **`/command-center`** | Live temperature, humidity, Rothfusz heat index, 8-sensor readings, hardware status, and real-time area graphs. |
| **`/ai-intelligence`** | 15 / 30 / 60-minute heat trajectory prediction, sensor confidence matrix, microclimate fingerprinting, and AI explainability. |
| **`/heat-map`** | Interactive campus and facility hotspot grid with indoor/outdoor nodes, thermal gradients, and blueprint/satellite toggles. |
| **`/adaptive-protection`** | Closed-loop autonomous fan control (0–255 PWM), misting solenoid status, intervention effectiveness, and OSHA work-rest protocols. |
| **`/analytics`** | Historical telemetry charts, summary statistics, search filter, and instant **CSV / JSON / PDF report exports**. |
| **`/alert-center`** | Real-time threshold warnings, sensor fault isolation logs, severity filters, acoustic alarm toggle, and acknowledgment actions. |
| **`/device-management`** | Hardware diagnostics for Arduino UNO Q, ESP32 sub-nodes, 7" HMI Touch Display, Quectel EC200U LTE Cat-1 modem, and I2C/1-Wire buses. |
| **`/simulation-lab`** | Interactive environmental sliders (Temp, Humidity, Lux), preset climate crises (Sahara spike, Tropical vapor trap), and sensor fault injection. |
| **`/research-about`** | Academic whitepaper, mathematical equations (Rothfusz 9-term polynomial, confidence divergence), and complete hardware pinouts. |

---

## ⚡ 5 Core Innovations

1. **Sensor Confidence Intelligence**: Multi-transducer cross-referencing (BME280 vs DS18B20 vs MLX90614) prevents single-sensor failure from causing false alarms or failing to detect extreme heat.
2. **Microclimate Fingerprinting**: Integrates VEML7700 solar lux with vapor pressure analysis to categorize environments into thermal inertia signatures (Canopy, Shaded, Confined, Interior).
3. **AI Heat Forecasting (15/30/60m)**: TinyML regression predicts upcoming thermal surges up to 60 minutes ahead, enabling proactive cooling breaks before onset of heat illness.
4. **Self-Learning Adaptive Intervention**: Dynamic closed-loop PWM turbine modulation and high-pressure evaporative misting with real-time cooling effectiveness delta scoring.
5. **100% Offline Edge AI**: Hard real-time inference runs natively on the Arduino UNO Q dual-core ARM M4 platform with zero cloud dependence.

---

## 🔌 Hardware Wiring & Pinout (Arduino UNO Q)

| UNO Q Pin | Interface | Component Connected | Notes |
| :--- | :--- | :--- | :--- |
| **3.3V / 5V** | Power | Sensors & Actuators | Low-noise regulated linear rail |
| **GND** | Ground | Common Ground | Star-ground topology |
| **SDA (A4 / D18)** | I2C Data | BME280, BME688, MLX90614, VEML7700 | 4.7kΩ pull-up to 3.3V, 100 kHz standard mode |
| **SCL (A5 / D19)** | I2C Clock | BME280, BME688, MLX90614, VEML7700 | Clock line |
| **GPIO D4** | 1-Wire | DS18B20 Immersion Probe | 4.7kΩ pull-up resistor |
| **GPIO D9** | PWM | Industrial Cooling Fan | Low-side N-channel MOSFET gate driver |
| **GPIO D10** | Digital Out | Evaporative Misting Solenoid | Optocoupled 12V relay driver |
| **GPIO D12** | Digital Out | Piezo Acoustic Buzzer | Audible alarm on threshold breach |
| **Serial2 (TX2/RX2)** | UART 115200 | 7-Inch Resistive HMI Display | Nextion / DWIN frame sync |
| **Serial3 (TX3/RX3)** | UART 115200 | Quectel EC200U LTE Cat-1 | Standard 3GPP AT commands & SMS alerts |

---

## 🛠️ How to Run & Develop

### 1. Backend (FastAPI + SQLite + WebSockets)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend (Next.js + TypeScript + Tailwind CSS)
```bash
cd frontend
npm run start -- -p 3000
# or for development with hot reload:
# npm run dev
```

### 3. Arduino UNO Q Firmware
- Open `hardware/arduino_uno_q_heatguard.ino` in the Arduino IDE or PlatformIO.
- Select board **Arduino UNO Q**.
- Upload sketch and connect via USB (115200 baud).

---

## 🛡️ License & Credits
Engineered for **HEATGUARD X** – Predictive Thermal Defense Initiative. Compliant with OSHA & NIOSH occupational heat illness standards.

