# 🌾 El Niño — Drought Intelligence & Relief Preemption Platform

> **AI-assisted drought-response planning, MILP relief budget optimization, satellite crop loss verification, and emergency fleet logistics.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js 22](https://img.shields.io/badge/Node.js-22%20LTS-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-4.3-38B2AC.svg)](https://tailwindcss.com/)

---

## 🌐 Live Demonstrations

- **GitHub Pages Deployment**: [https://yatharthrladkat.github.io/](https://yatharthrladkat.github.io/)
- **AI Studio Production Preview**: [https://ais-pre-6b26ccen2kgn24wkav5bup-797527661425.asia-northeast1.run.app](https://ais-pre-6b26ccen2kgn24wkav5bup-797527661425.asia-northeast1.run.app)

---

## 🏛️ System Overview

The **El Niño Preemption Engine (EPE)** is a decision-support and operational platform designed for State Disaster Management Authorities (SDMAs) and Relief Commissionerates. Rather than waiting for post-harvest distress petitions, EPE algorithmically anticipates severe moisture deficits and pre-positions relief assets 18 to 24 days in advance.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT TIER (React 19 + Vite SPA)                     │
│                                                                             │
│  State Relief Officer UI                                                    │
│  ├── Overview Dashboard & Telemetry Cards                                  │
│  ├── Interactive Choropleth Map (Bundelkhand & Nimar SVG + Leaflet)         │
│  ├── 30-Day D3.js Multi-Horizon Predictive Drought Model                    │
│  ├── Mixed-Integer Linear Programming (MILP) Budget Optimizer               │
│  ├── Sentinel-2 Spectral Claim Verification & DBT Voucher Hub               │
│  ├── Fleet Dispatch Logistics, Real-Time FASTag Waypoints & Driver Comms    │
│  ├── Live AI Drought Advisor Modal (Gemini 3.8 Flash + Search Grounding)    │
│  └── UniProtKB Crop Genomics & Europe PMC Scientific Literature Explorer   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      REST & JSON API Calls (/api/v1/*)
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND TIER (Node.js / Express 4)                       │
│                                                                             │
│  ├── Security & Defense-in-Depth Middleware (CSP, HSTS, Secure Cookies)     │
│  ├── Deterministic Allocation Solver (`server/allocator.ts`)                │
│  ├── Fleet Registry & Dispatch Order Sequencer                              │
│  ├── PMFBY Crop Claim Verification Engine & DBT Token Generator             │
│  └── AI Proxy Endpoints:                                                    │
│      ├── `/api/gemini/search`  -> Gemini 3.8 Flash + Google Search Grounding│
│      ├── `/api/gemini/maps`    -> Gemini 3.8 Flash + Google Maps Grounding  │
│      ├── `/api/science/crop-genomics` -> UniProt Knowledgebase API         │
│      └── `/api/science/literature`    -> Europe PMC Scientific API          │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
        JSON Atomic Persistence Layer                  │ External Live APIs
                       │                               │
┌──────────────────────▼────────────────┐  ┌───────────▼──────────────────────┐
│       DATABASE & PERSISTENCE          │  │     EXTERNAL LIVE INTEGRATIONS   │
│                                       │  │                                  │
│  `data/app_database.json`             │  │ • Open-Meteo API (Live Weather & │
│  • Pilot Areas (55 MP Districts)      │  │   0-10cm Volumetric Soil Moisture)│
│  • Resource Centres & Depots (Stock)  │  │ • Google GenAI (`gemini-3.8-flash│
│  • Convoys & Real Fleet Tracking      │  │ • UniProtKB (Real Biological DB) │
│  • Farmer Claims & DBT Tokens         │  │ • Europe PMC (Agronomy Papers)   │
│  • Scarcity Directives & Audit Trail  │  │ • ISRO SAC VEDAS Portal (Frames) │
└───────────────────────────────────────┘  └──────────────────────────────────┘
```

---

## ✨ Key Capabilities & Modules

### 1. State Drought Overview & Telemetry Bar
- Live composite indicators tracking **ISRO SAC VEDAS Krishi-DSS** products: Standardized Precipitation Index (**SPI-3M**), Vegetation Condition Index (**VCI**), and Volumetric Soil Moisture Anomaly (**0–10cm**).
- One-click live Open-Meteo satellite weather hydration across all 55 district centroids.

### 2. Multi-Horizon Predictive Drought Model (D3.js)
- Responsive vector visualization projecting 30-day drought severity across high-stress districts (Tikamgarh, Chhatarpur, Barwani, Sheopur, Khargone).
- Equipped with `ResizeObserver`, hover tooltips, and dynamic metric switching (Composite Risk, Deficit %, SPI-3M, VCI, Agrarian Distress).

### 3. Mixed-Integer Relief Budget Optimizer (MILP Solver)
- Allocates state relief budgets (e.g. ₹142 Cr of ₹500 Cr SDRF pool) using deterministic mathematical criteria.
- Enforces an **18% Equity Floor** so vulnerable marginal talukas are never starved of critical resources.

### 4. Sentinel-2 Spectral Claim Verification & DBT Payouts
- Compares claimed crop loss percentages under **Pradhan Mantri Fasal Bima Yojana (PMFBY)** against Sentinel-2 NDVI spectral deviation indices.
- Batch-authorizes legitimate claims (≤15% spectral variance) and generates cryptographically verifiable Direct Benefit Transfer (DBT) vouchers.

### 5. Fleet Logistics, FASTag Tracking & Dispatch
- Manages potable water tankers, mobile cattle fodder units, and deep bore well drilling rigs.
- Real-time ETA calculations, toll plaza waypoint clearances, and direct driver communication dispatch tools.

### 6. Live AI Drought Advisor (Gemini 3.8 Flash)
- Grounded with Google Search to fetch real-time India Meteorological Department (IMD Bhopal) weather advisories and state emergency decrees.
- Zero-latency cached fallback compliant with the **Madhya Pradesh State Scarcity Manual**.

### 7. Bioscience & Agronomy Explorers
- Real biological drought-tolerance genes (*GmDREB2A*, *GhPIP2;1*, *GmLEA14*) queried directly from the **UniProt Knowledgebase**.
- Peer-reviewed agrarian studies retrieved live from **Europe PMC**.

---

## 🔒 Security Hardening & Compliance

- **Defense-in-Depth Headers**: Content Security Policy (`CSP`), HSTS (2-year preload), `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
- **Anti-Clickjacking Defense**: Multi-tier iframe protection allowing preview frames (`aistudio.google.com`, `yatharthrladkat.github.io`, `localhost`) while blocking unauthorized 3rd-party frames.
- **Search Engine Optimization**: Standard `robots.txt`, XML `sitemap.xml`, OpenGraph cards, Twitter preview cards, and Schema.org `WebApplication` structured data.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 22 LTS or newer
- npm 10+

### Installation
```bash
# 1. Clone repository
git clone https://github.com/yatharthrladkat/DROUGHT.git
cd DROUGHT

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Deployment Options

### Option 1: GitHub Pages (Static Client Hosting)
The repository includes `.github/workflows/deploy.yml` which automatically builds and publishes the client to GitHub Pages upon pushing to `main`.
- Set **Settings → Pages → Source** to **GitHub Actions**.

### Option 2: Docker / Container Platform (Cloud Run, Render, Railway)
The included multi-stage `Dockerfile` runs Node.js 22 Alpine in production:
```bash
docker build -t elnino-preemption:latest .
docker run -p 3000:3000 -e PORT=3000 elnino-preemption:latest
```

### Option 3: Standard Node.js Production Run
```bash
npm run build
npm start
```

---

## 📄 License

Licensed under the [MIT License](LICENSE).
