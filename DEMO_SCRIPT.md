# 🎬 3-Minute Demo Script — DRISHTI-AI

*Use this exact script for presenting the live system to Smart India Hackathon jury and MDoNER evaluators.*

---

## ⏱️ Minute 0:00 – 0:45 | Problem Framing & Real-Time GIS Map

1. **Opening Hook**:
   > *"Good morning respected jury members. Landslides in the North Eastern Region are traditionally monitored reactively after roads are blocked and lives are endangered. With DRISHTI-AI, we present a proactive, AI-driven landslide early warning and risk monitoring platform focused on the high-vulnerability pilot district of East Khasi Hills, Meghalaya."*

2. **Showcase the GIS Dashboard (`/dashboard`)**:
   - Point out the **Choropleth Risk Zones** over Sohra (Cherrapunji), Mawsynram, and Dawki.
   - Show that live weather and soil moisture are being polled from **Open-Meteo** and **IMD public APIs**.
   - Click on **Sohra (Cherrapunji) Escarpment** to highlight the **Explainable AI (XAI) Factor Panel**:
     > *"Notice how our AI doesn't just output a black-box score — it highlights the exact physical drivers: 38.5° slope, 145mm 24-hour rainfall, and 92% soil saturation."*
   - Toggle the **Lifeline Roads & Safe Shelters** layer to show evacuation routes along NH-6 and SH-5.

---

## ⏱️ Minute 0:45 – 1:45 | Live Cloudburst Simulation & Multi-Lingual Alerts

1. **Trigger Live AI Stress-Test**:
   - Scroll down to the **Live Cloudburst & Landslide Risk Sandbox**.
   - Click the preset button: **🚨 Extreme Cloudburst (125 mm/h)**.
   - Show the jury the simulated 24h accumulation jumping to **750mm**.
   - Click **"Execute AI Simulation"**.

2. **Showcase Real-Time AI Recalculation & Multi-Lingual Alert Dispatch**:
   - Point out the risk score surging to **Critical (>85%)**.
   - Point to the **Multi-Lingual Emergency Alert Outbox** on the right.
   - Click the language tabs:
     - **Khasi (`kha`)**: *"KA JINGMA BA JUR NA KA JINGTWAD KHYNDEW... Dial 1070/112"*
     - **Assamese (`as`)**: *"জৰুৰী ভূস্খলন সতৰ্কবাৰ্তা (RED ALERT)..."*
     - **Hindi (`hi`)**: *"अत्यंत गंभीर भूस्खलन चेतावनी..."*
     - **English (`en`)**: *"CRITICAL LANDSLIDE RED ALERT..."*
   - Explain the multi-channel dispatch via **Fast2SMS** and **Firebase Cloud Messaging**.

---

## ⏱️ Minute 1:45 – 2:30 | Offline-First Citizen Field Reporting

1. **Switch to Field App (`/field-app`)**:
   - Click the **"Field Reporting App"** tab in the top header.
   - Click the **"Offline Mode Active (Testing)"** button to simulate being in a zero-network mountain ravine.
   - Point to the amber banner: *"Offline Mode Active — Report will be queued locally"*.

2. **Submit a Geo-Tagged Incident with Photo**:
   - Select Hazard: **"Debris Flow / Mudslide"** | Severity: **"Critical"**.
   - Click **"Capture Current GPS"** (auto-populates East Khasi Hills coordinates).
   - Enter description: *"Heavy debris blockage at km 44 near Sohra viewpoint."*
   - Click **"Submit Incident Report"**.
   - Show that the report is saved in the **Local Sync Queue** with a pending network badge.

3. **Demonstrate Auto-Sync**:
   - Click the network toggle back to **"Online Mode (Connected)"**.
   - Click **"Sync All Now"** (or watch auto-sync fire).
   - Switch back to the **GIS Dashboard** and show the new report pin instantly appearing on the map with its photo!

---

## ⏱️ Minute 2:30 – 3:00 | Architecture, ML Validation & Q&A Readiness

1. **ML Model Rigor**:
   > *"Our calibrated Random Forest model achieved **0.9917 ROC-AUC** and **96.5% precision** across physics-augmented terrain and GSI Bhukosh seed events."*

2. **MDoNER Impact**:
   > *"The system is architected for zero-cost deployment using free public APIs and open-source stacks, with a clear roadmap to scale to all 8 North Eastern states."*

3. **Ready for Q&A**:
   - Real APIs vs Simulated: Transparently explained via `# MOCKED` comments and live Open-Meteo feeds.
   - Offline queue: Verified via browser LocalStorage / IndexedDB.
