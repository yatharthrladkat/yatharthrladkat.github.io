import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CloudRain,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileDown,
  Map as MapIcon,
  Grid,
  Maximize,
  Compass,
  Radio,
  Satellite
} from 'lucide-react';
import { MadhyaPradeshDroughtMap } from './MadhyaPradeshDroughtMap';
import { MADHYA_PRADESH_DISTRICTS_GEO } from '../data/madhyaPradeshGeoData';

interface CropLossProfile {
  id: string;
  name: string;
  talukas: string;
  overallLossRiskPct: number;
  totalAcreageHa: string;
  projectedYieldShortfallMT: string;
  economicExposureCr: number;
  soilRootDeficit: string;
  ndviAnomalyDelta: string;
  preemptiveIntervention: string;
  crops: {
    name: string;
    lossRisk: number;
    acreage: string;
    stage: string;
    severity: 'Critical' | 'Severe' | 'Moderate';
  }[];
  polygonPath: string;
  centroid: { x: number; y: number };
}

const REGIONAL_CROP_PROFILES: Record<string, CropLossProfile> = {
  tikamgarh: {
    id: 'tikamgarh',
    name: 'Tikamgarh',
    talukas: 'Baldeogarh, Jatara, Palera & Mohangarh',
    overallLossRiskPct: 78,
    totalAcreageHa: '4.8 Lakh Hectares',
    projectedYieldShortfallMT: '390,000 MT',
    economicExposureCr: 295,
    soilRootDeficit: '-68% root-zone moisture saturation',
    ndviAnomalyDelta: '-0.32 vs 5-yr baseline',
    preemptiveIntervention: 'Emergency rocky-aquifer bore well recharge + 38 potable water tanker units',
    crops: [
      { name: 'Soybean', lossRisk: 82, acreage: '2.6 L Ha', stage: 'Pod filling / grain maturation failure', severity: 'Critical' },
      { name: 'Sesame (Til)', lossRisk: 74, acreage: '1.2 L Ha', stage: 'Capsule setting moisture stress', severity: 'Critical' },
      { name: 'Gram / Chickpea', lossRisk: 62, acreage: '1.0 L Ha', stage: 'Pre-sowing seedbed deficit', severity: 'Severe' }
    ],
    polygonPath: 'M 290 170 L 410 155 L 450 215 L 415 275 L 325 270 L 275 210 Z',
    centroid: { x: 360, y: 215 }
  },
  chhatarpur: {
    id: 'chhatarpur',
    name: 'Chhatarpur',
    talukas: 'Nowgong, Rajnagar, Bijawar & Bada Malhera',
    overallLossRiskPct: 72,
    totalAcreageHa: '6.4 Lakh Hectares',
    projectedYieldShortfallMT: '425,000 MT',
    economicExposureCr: 278,
    soilRootDeficit: '-60% Ken basin tributary depletion',
    ndviAnomalyDelta: '-0.27 vs 5-yr baseline',
    preemptiveIntervention: 'Ken-Betwa linked canal diversion + emergency fodder bank subsidies',
    crops: [
      { name: 'Soybean', lossRisk: 76, acreage: '3.5 L Ha', stage: 'Seed maturation failure', severity: 'Critical' },
      { name: 'Mustard (Rai)', lossRisk: 68, acreage: '1.8 L Ha', stage: 'Sowing moisture deficit', severity: 'Severe' },
      { name: 'Gram / Wheat', lossRisk: 52, acreage: '1.1 L Ha', stage: 'Pre-sowing land preparation', severity: 'Moderate' }
    ],
    polygonPath: 'M 450 215 L 530 205 L 575 275 L 515 330 L 435 305 L 415 275 Z',
    centroid: { x: 485, y: 265 }
  },
  barwani: {
    id: 'barwani',
    name: 'Barwani',
    talukas: 'Sendhwa, Rajpur, Pansemal & Niwali',
    overallLossRiskPct: 69,
    totalAcreageHa: '5.2 Lakh Hectares',
    projectedYieldShortfallMT: '340,000 MT',
    economicExposureCr: 242,
    soilRootDeficit: '-58% Nimar rainshadow upland deficit',
    ndviAnomalyDelta: '-0.25 vs 5-yr baseline',
    preemptiveIntervention: 'Tribal solar pump water stations + 29 emergency water tankers',
    crops: [
      { name: 'Cotton (Bt)', lossRisk: 75, acreage: '2.8 L Ha', stage: 'Square drop & boll cracking', severity: 'Critical' },
      { name: 'Maize (Makka)', lossRisk: 66, acreage: '1.5 L Ha', stage: 'Tasseling moisture abortion', severity: 'Severe' },
      { name: 'Jowar', lossRisk: 48, acreage: '0.9 L Ha', stage: 'Grain filling stage', severity: 'Moderate' }
    ],
    polygonPath: 'M 325 270 L 415 275 L 435 305 L 415 365 L 345 375 L 295 325 Z',
    centroid: { x: 370, y: 320 }
  },
  sheopur: {
    id: 'sheopur',
    name: 'Sheopur',
    talukas: 'Karahal, Vijaypur & Sheopur',
    overallLossRiskPct: 65,
    totalAcreageHa: '3.9 Lakh Hectares',
    projectedYieldShortfallMT: '260,000 MT',
    economicExposureCr: 185,
    soilRootDeficit: '-54% semi-arid Chambal soil dryness',
    ndviAnomalyDelta: '-0.22 vs 5-yr baseline',
    preemptiveIntervention: 'Chambal canal water rationing + 24 potable water tanker units',
    crops: [
      { name: 'Mustard (Sarson)', lossRisk: 70, acreage: '2.1 L Ha', stage: 'Germination soil crusting', severity: 'Critical' },
      { name: 'Wheat', lossRisk: 62, acreage: '1.2 L Ha', stage: 'Rabi sowing moisture crunch', severity: 'Severe' },
      { name: 'Bajra', lossRisk: 45, acreage: '0.6 L Ha', stage: 'Flowering & earhead emergence', severity: 'Moderate' }
    ],
    polygonPath: 'M 410 155 L 530 145 L 530 205 L 450 215 Z',
    centroid: { x: 470, y: 180 }
  },
  shivpuri: {
    id: 'shivpuri',
    name: 'Shivpuri',
    talukas: 'Kolaras, Karera, Pohari & Pichhore',
    overallLossRiskPct: 61,
    totalAcreageHa: '6.1 Lakh Hectares',
    projectedYieldShortfallMT: '295,000 MT',
    economicExposureCr: 215,
    soilRootDeficit: '-49% Gwalior division aquifer drop',
    ndviAnomalyDelta: '-0.19 vs 5-yr baseline',
    preemptiveIntervention: 'Agrarian power guarantees + seed kit distribution',
    crops: [
      { name: 'Soybean', lossRisk: 66, acreage: '3.2 L Ha', stage: 'Pod maturity stunting', severity: 'Severe' },
      { name: 'Groundnut (Mungfali)', lossRisk: 58, acreage: '1.6 L Ha', stage: 'Pegging moisture stress', severity: 'Severe' },
      { name: 'Mustard', lossRisk: 46, acreage: '1.3 L Ha', stage: 'Pre-sowing readiness', severity: 'Moderate' }
    ],
    polygonPath: 'M 530 145 L 640 165 L 685 245 L 575 275 L 530 205 L 505 155 Z',
    centroid: { x: 590, y: 215 }
  },
  khargone: {
    id: 'khargone',
    name: 'Khargone (West Nimar)',
    talukas: 'Kasrawad, Barwaha, Maheshwar & Bhikangaon',
    overallLossRiskPct: 58,
    totalAcreageHa: '6.9 Lakh Hectares',
    projectedYieldShortfallMT: '310,000 MT',
    economicExposureCr: 220,
    soilRootDeficit: '-46% Narmada canal tail-end shortfall',
    ndviAnomalyDelta: '-0.18 vs 5-yr baseline',
    preemptiveIntervention: 'Chilli & cotton drip irrigation grants + 25 tanker units',
    crops: [
      { name: 'Red Chilli (Mirchi)', lossRisk: 68, acreage: '1.8 L Ha', stage: 'Fruit setting water stress', severity: 'Severe' },
      { name: 'Cotton', lossRisk: 59, acreage: '3.4 L Ha', stage: 'Boll retention drop', severity: 'Severe' },
      { name: 'Soybean', lossRisk: 47, acreage: '1.7 L Ha', stage: 'Pod maturation', severity: 'Moderate' }
    ],
    polygonPath: 'M 215 285 L 295 325 L 345 375 L 295 425 L 195 395 L 185 330 Z',
    centroid: { x: 255, y: 355 }
  },
  dewas: {
    id: 'dewas',
    name: 'Dewas',
    talukas: 'Sonkatch, Bagli, Kannod & Khategaon',
    overallLossRiskPct: 53,
    totalAcreageHa: '5.8 Lakh Hectares',
    projectedYieldShortfallMT: '235,000 MT',
    economicExposureCr: 168,
    soilRootDeficit: '-42% Malwa black soil saturation loss',
    ndviAnomalyDelta: '-0.16 vs 5-yr baseline',
    preemptiveIntervention: 'Soybean seed stock pre-positioning + fodder camp subsidies',
    crops: [
      { name: 'Soybean', lossRisk: 59, acreage: '3.8 L Ha', stage: 'Pod filling stress', severity: 'Severe' },
      { name: 'Durum Wheat', lossRisk: 48, acreage: '1.4 L Ha', stage: 'Sowing moisture deficit', severity: 'Moderate' },
      { name: 'Gram', lossRisk: 41, acreage: '0.6 L Ha', stage: 'Pre-sowing stage', severity: 'Moderate' }
    ],
    polygonPath: 'M 315 110 L 435 95 L 505 155 L 410 155 L 290 170 L 285 125 Z',
    centroid: { x: 385, y: 135 }
  },
  dhar: {
    id: 'dhar',
    name: 'Dhar',
    talukas: 'Badnawar, Sardarpur, Kukshi & Manawar',
    overallLossRiskPct: 49,
    totalAcreageHa: '6.6 Lakh Hectares',
    projectedYieldShortfallMT: '240,000 MT',
    economicExposureCr: 172,
    soilRootDeficit: '-38% tribal plateaus moisture drop',
    ndviAnomalyDelta: '-0.15 vs 5-yr baseline',
    preemptiveIntervention: 'Community pond recharge + contingency seed kits',
    crops: [
      { name: 'Soybean', lossRisk: 54, acreage: '3.6 L Ha', stage: 'Pod maturity', severity: 'Severe' },
      { name: 'Cotton', lossRisk: 46, acreage: '1.9 L Ha', stage: 'Boll formation', severity: 'Moderate' },
      { name: 'Maize', lossRisk: 38, acreage: '1.1 L Ha', stage: 'Cob filling', severity: 'Moderate' }
    ],
    polygonPath: 'M 435 95 L 530 145 L 480 180 Z',
    centroid: { x: 480, y: 140 }
  },
  panna: {
    id: 'panna',
    name: 'Panna',
    talukas: 'Ajaigarh, Gunnor, Pawai & Shahnagar',
    overallLossRiskPct: 54,
    totalAcreageHa: '4.2 Lakh Hectares',
    projectedYieldShortfallMT: '185,000 MT',
    economicExposureCr: 138,
    soilRootDeficit: '-44% rocky plateau depletion',
    ndviAnomalyDelta: '-0.17 vs 5-yr baseline',
    preemptiveIntervention: 'Ken basin emergency checkdams + 15 water tankers',
    crops: [
      { name: 'Soybean', lossRisk: 58, acreage: '2.1 L Ha', stage: 'Pod development', severity: 'Severe' },
      { name: 'Gram', lossRisk: 49, acreage: '1.3 L Ha', stage: 'Sowing moisture crunch', severity: 'Moderate' },
      { name: 'Paddy', lossRisk: 44, acreage: '0.8 L Ha', stage: 'Grain filling water stress', severity: 'Moderate' }
    ],
    polygonPath: 'M 240 100 L 315 110 L 290 170 L 210 150 Z',
    centroid: { x: 260, y: 130 }
  },
  ujjain: {
    id: 'ujjain',
    name: 'Ujjain',
    talukas: 'Badnagar, Mahidpur, Tarana & Nagda',
    overallLossRiskPct: 44,
    totalAcreageHa: '5.9 Lakh Hectares',
    projectedYieldShortfallMT: '190,000 MT',
    economicExposureCr: 145,
    soilRootDeficit: '-33% Shipra river tributary decline',
    ndviAnomalyDelta: '-0.12 vs 5-yr baseline',
    preemptiveIntervention: 'Shipra barrage rationed discharge + micro-irrigation grants',
    crops: [
      { name: 'Soybean', lossRisk: 49, acreage: '3.7 L Ha', stage: 'Pod maturation', severity: 'Moderate' },
      { name: 'Garlic & Onion', lossRisk: 42, acreage: '1.1 L Ha', stage: 'Bulb enlargement', severity: 'Moderate' },
      { name: 'Wheat', lossRisk: 34, acreage: '1.1 L Ha', stage: 'Sowing readiness', severity: 'Moderate' }
    ],
    polygonPath: 'M 180 160 L 260 170 L 240 250 L 170 230 Z',
    centroid: { x: 210, y: 200 }
  }
};

export const DroughtRiskView: React.FC = () => {
  const { districts, setCurrentModule, showToast } = useApp();
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '60d' | '90d'>('30d');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('tikamgarh');
  const [cartographyMode, setCartographyMode] = useState<'leaflet' | 'schematic'>('leaflet');
  const [isWideMapLayout, setIsWideMapLayout] = useState<boolean>(false);

  const selectedDist = districts.find(d => d.id === selectedDistrictId) || districts[0];
  const activeCropProfile =
    REGIONAL_CROP_PROFILES[selectedDistrictId] ||
    REGIONAL_CROP_PROFILES.tikamgarh;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

  const getCellColor = (year: number, monthIdx: number) => {
    if (year === 2026 && monthIdx >= 6) {
      if (monthIdx === 7 || monthIdx === 8 || monthIdx === 9) return 'bg-[#C62828] text-white';
      return 'bg-[#B26A00] text-white';
    }
    if (year === 2024 && (monthIdx === 5 || monthIdx === 6)) return 'bg-[#C62828] text-white';
    if ((year + monthIdx) % 7 === 0) return 'bg-[#EF5350] text-white';
    if ((year + monthIdx) % 3 === 0) return 'bg-[#FFF8E1] text-[#B26A00] font-medium';
    return 'bg-[#F1F3F5] text-[#6B7280]';
  };

  const handlePolygonClick = (regionId: string) => {
    setSelectedDistrictId(regionId);
    const profile = REGIONAL_CROP_PROFILES[regionId];
    if (profile) {
      showToast(
        `${profile.name} Crop Loss Profile Active`,
        `Selected ${profile.name} (${profile.overallLossRiskPct}% overall loss risk). Loaded regional crop telemetry.`,
        'primary'
      );
    }
  };

  const getPolygonStyle = (regionId: string, lossPct: number) => {
    const isSelected = selectedDistrictId === regionId;

    let fill = '#FEE2E2';
    if (lossPct >= 70) fill = '#991B1B';
    else if (lossPct >= 60) fill = '#C62828';
    else if (lossPct >= 50) fill = '#EF5350';
    else if (lossPct >= 40) fill = '#FCA5A5';

    return {
      fill,
      fillOpacity: isSelected ? 0.95 : 0.75,
      stroke: isSelected ? '#0F4C81' : '#FFFFFF',
      strokeWidth: isSelected ? 2.5 : 1.2
    };
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-10">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              Drought Risk & Rainfall Indices
            </h1>
            <span className="text-[11px] font-semibold bg-[#EEF4FA] text-[#0F4C81] px-2.5 py-0.5 rounded-full border border-[#BCD4EC]">
              ISRO SAC VEDAS Real-Time Feed
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time geospatial drought intensity indices, Vegetation Condition Index (VCI) anomaly, and crop vulnerability cartography
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F1F3F5] p-0.5 rounded-md border border-[#E3E6EB]">
            {(['30d', '60d', '90d'] as const).map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setSelectedHorizon(h)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedHorizon === h
                    ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)]'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Last {h.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentModule('relief-budget-optimizer');
              showToast('Optimizer Launched', `Passing ${activeCropProfile.name} deficit values to solver.`, 'primary');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors"
          >
            <span>Run Budget Optimizer</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Top 4 Key Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Rainfall Deficit ({activeCropProfile.name})
          </span>
          <div className="text-[28px] font-bold text-[#C62828] tabular-nums mt-1 leading-none">
            {selectedDist.precipDeficit}%
          </div>
          <span className="text-[11px] text-[#6B7280] mt-2 block">
            vs 50-year state IMD baseline
          </span>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Crop Loss Risk Index
          </span>
          <div className="text-[28px] font-bold text-[#B26A00] tabular-nums mt-1 leading-none">
            {activeCropProfile.overallLossRiskPct}% Loss
          </div>
          <span className="text-[11px] text-[#6B7280] mt-2 block">
            Projected yield shortfall: {activeCropProfile.projectedYieldShortfallMT}
          </span>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Soil Moisture Saturation
          </span>
          <div className="text-[28px] font-bold text-[#111827] tabular-nums mt-1 leading-none">
            {selectedDist.soilMoisture}%
          </div>
          <span className="text-[11px] text-[#C62828] font-medium mt-2 block">
            Critical root-zone depletion ({selectedDist.soilMoistureDev || -51.2}%)
          </span>
        </div>

        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Monitored Agrarian Acreage
          </span>
          <div className="text-[28px] font-bold text-[#111827] tabular-nums mt-1 leading-none">
            {activeCropProfile.totalAcreageHa}
          </div>
          <span className="text-[11px] text-[#6B7280] mt-2 block">
            Economic exposure: ₹{activeCropProfile.economicExposureCr} Cr
          </span>
        </div>
      </div>

      {/* Cartography View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-[#E3E6EB] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5 mr-2">
            <Layers className="w-4 h-4 text-[#0F4C81]" />
            Cartography Engine:
          </span>
          <button
            type="button"
            onClick={() => setCartographyMode('leaflet')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              cartographyMode === 'leaflet'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'bg-[#F1F3F5] text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Leaflet GIS Map</span>
            <span className="text-[9.5px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold ml-0.5">
              Live
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCartographyMode('schematic')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              cartographyMode === 'schematic'
                ? 'bg-[#0F4C81] text-white shadow-xs'
                : 'bg-[#F1F3F5] text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Schematic Cartogram</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {cartographyMode === 'leaflet' && (
            <button
              type="button"
              onClick={() => setIsWideMapLayout(!isWideMapLayout)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E5E7EB] rounded transition-colors"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>{isWideMapLayout ? 'Show Side Inspector' : 'Wide Map Layout'}</span>
            </button>
          )}

          <span className="text-xs font-semibold text-[#0F4C81] bg-[#EEF4FA] px-2.5 py-1 rounded border border-[#BCD4EC]">
            Active District: {activeCropProfile.name}
          </span>
        </div>
      </div>

      {/* Main Grid: Leaflet GIS Map or Schematic Cartogram + Crop Loss Telemetry Inspector */}
      <div className={`grid grid-cols-1 ${isWideMapLayout ? 'grid-cols-1' : 'lg:grid-cols-12'} gap-5`}>
        {/* Left Column (or Full Width): Map Visualization */}
        <div className={isWideMapLayout ? 'w-full' : 'lg:col-span-7'}>
          {cartographyMode === 'leaflet' ? (
            <MadhyaPradeshDroughtMap
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={handlePolygonClick}
              className="w-full h-full min-h-[520px]"
            />
          ) : (
            <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">
                      Interactive Regional Crop Loss Cartography
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Click on any district polygon to load specific crop failure telemetry
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#0F4C81] bg-[#EEF4FA] px-2 py-0.5 rounded border border-[#BCD4EC]">
                    Selected: {activeCropProfile.name}
                  </span>
                </div>

                {/* SVG Cartographic Canvas */}
                <div className="relative w-full h-[400px] bg-[#F9FAFB] rounded-md border border-[#E3E6EB] mt-3 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#D1D5DB_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

                  <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet">
                    {Object.values(REGIONAL_CROP_PROFILES).map(profile => {
                      const isSelected = selectedDistrictId === profile.id;
                      const style = getPolygonStyle(profile.id, profile.overallLossRiskPct);

                      return (
                        <g key={profile.id} onClick={() => handlePolygonClick(profile.id)} className="cursor-pointer">
                          <path
                            d={profile.polygonPath}
                            fill={style.fill}
                            fillOpacity={style.fillOpacity}
                            stroke={style.stroke}
                            strokeWidth={style.strokeWidth}
                            className="transition-all duration-150 hover:fill-opacity-95"
                          />
                          <circle
                            cx={profile.centroid.x}
                            cy={profile.centroid.y}
                            r={isSelected ? 4 : 3}
                            fill={isSelected ? '#0F4C81' : '#FFFFFF'}
                            stroke="#111827"
                            strokeWidth="1.2"
                          />
                          <text
                            x={profile.centroid.x}
                            y={profile.centroid.y - 7}
                            textAnchor="middle"
                            fill={profile.overallLossRiskPct >= 60 ? '#FFFFFF' : '#111827'}
                            fontSize="11px"
                            fontWeight="600"
                            fontFamily="Inter, sans-serif"
                            className="pointer-events-none"
                          >
                            {profile.name}
                          </text>
                          <text
                            x={profile.centroid.x}
                            y={profile.centroid.y + 14}
                            textAnchor="middle"
                            fill={profile.overallLossRiskPct >= 60 ? '#FEE2E2' : '#4B5563'}
                            fontSize="9.5px"
                            fontWeight="500"
                            fontFamily="Inter, sans-serif"
                            className="pointer-events-none"
                          >
                            {profile.overallLossRiskPct}% Loss Risk
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Map Legend */}
                  <div className="absolute bottom-3 right-3 bg-white/95 border border-[#E3E6EB] rounded px-2.5 py-1.5 text-[11px] text-[#4B5563] shadow-sm flex items-center gap-3">
                    <span className="font-semibold text-[#111827]">Loss Risk:</span>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-[#991B1B]" />
                      <span>&gt;70% Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-[#C62828]" />
                      <span>60–70% Severe</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-[#EF5350]" />
                      <span>50–60% Moderate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#9CA3AF]">
                Cartography: ISRO CartoSat-3 Digital Elevation Model & Sentinel-2 Multispectral NDVI
              </div>
            </div>
          )}
        </div>

        {/* Right Column (or Sub-section if wide): Crop Loss Telemetry Inspector */}
        <div
          className={`${
            isWideMapLayout ? 'w-full' : 'lg:col-span-5'
          } bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between`}
        >
          <div>
            <div className="pb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {activeCropProfile.name} District Assessment
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">{activeCropProfile.talukas}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    activeCropProfile.overallLossRiskPct >= 65
                      ? 'bg-[#FDECEA] text-[#C62828]'
                      : 'bg-[#FFF8E1] text-[#B26A00]'
                  }`}
                >
                  {activeCropProfile.overallLossRiskPct}% Loss Risk
                </span>
              </div>
            </div>

            {/* Key Agrarian Metrics */}
            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="p-2 rounded bg-[#F9FAFB] border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280]">Yield Shortfall</span>
                <span className="text-xs font-semibold text-[#C62828] block mt-0.5">
                  {activeCropProfile.projectedYieldShortfallMT}
                </span>
              </div>
              <div className="p-2 rounded bg-[#F9FAFB] border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280]">Economic Exposure</span>
                <span className="text-xs font-semibold text-[#111827] block mt-0.5">
                  ₹{activeCropProfile.economicExposureCr} Cr
                </span>
              </div>
              <div className="p-2 rounded bg-[#F9FAFB] border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280]">Root-Zone Deficit</span>
                <span className="text-[11px] font-medium text-[#4B5563] block mt-0.5">
                  {activeCropProfile.soilRootDeficit}
                </span>
              </div>
              <div className="p-2 rounded bg-[#F9FAFB] border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280]">NDVI Anomaly</span>
                <span className="text-[11px] font-medium text-[#4B5563] block mt-0.5">
                  {activeCropProfile.ndviAnomalyDelta}
                </span>
              </div>
            </div>

            {/* Crop Breakdown Table */}
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-[#111827] mb-2 uppercase tracking-wide">
                Crop-Specific Loss Breakdown
              </h4>
              <div className="space-y-2">
                {activeCropProfile.crops.map(c => (
                  <div key={c.name} className="p-2.5 rounded bg-[#FAFBFC] border border-[#E3E6EB] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#111827]">{c.name}</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          c.severity === 'Critical'
                            ? 'text-[#C62828]'
                            : c.severity === 'Severe'
                            ? 'text-[#B26A00]'
                            : 'text-[#2E7D32]'
                        }`}
                      >
                        {c.lossRisk}% risk · {c.acreage}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">{c.stage}</p>
                    <div className="w-full bg-[#E3E6EB] rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.severity === 'Critical' ? 'bg-[#C62828]' : 'bg-[#B26A00]'
                        }`}
                        style={{ width: `${c.lossRisk}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Intervention */}
          <div className="mt-4 p-3 bg-[#EEF4FA] border border-[#BCD4EC] rounded-md text-xs">
            <span className="text-[10px] uppercase font-bold text-[#0F4C81] tracking-wider block">
              Preemptive Action Order
            </span>
            <p className="text-xs text-[#111827] mt-0.5 leading-snug">
              {activeCropProfile.preemptiveIntervention}
            </p>
          </div>
        </div>
      </div>

      {/* Historical VCI Anomaly Matrix (2020-2026) */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              Vegetation Condition Index (VCI) Multi-Year Heatmap
            </h3>
            <p className="text-xs text-[#6B7280]">
              Monthly vegetation stress matrix across Madhya Pradesh Bundelkhand & Nimar belt (2020–2026)
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C62828]" />
              <span>Severe Drought (&lt;35% VCI)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B26A00]" />
              <span>Moderate Stress</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F1F3F5] border border-[#E3E6EB]" />
              <span>Normal</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EB] text-[11px] text-[#6B7280] font-semibold">
                <th className="py-2 text-left pl-2">Year</th>
                {months.map(m => (
                  <th key={m} className="py-2 px-1">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {years.map(yr => (
                <tr key={yr} className="hover:bg-[#F9FAFB]">
                  <td className="py-2 text-left pl-2 font-semibold text-[#111827] text-xs">
                    {yr}
                  </td>
                  {months.map((_, mIdx) => (
                    <td key={mIdx} className="py-2 px-1">
                      <div
                        className={`w-full py-1 rounded text-[10px] font-mono tabular-nums ${getCellColor(
                          yr,
                          mIdx
                        )}`}
                      >
                        {yr === 2026 && mIdx >= 10 ? '—' : `${Math.floor(25 + ((yr + mIdx * 7) % 60))}`}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
