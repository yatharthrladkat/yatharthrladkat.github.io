import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DroughtSeverityChart } from './DroughtSeverityChart';
import { DistrictMetric } from '../types';
import { RESERVOIR_DATA } from '../services/optimizerEngine';
import { REAL_MP_BUNDELKHAND_2024_CRISIS } from '../services/dataIngestionService';
import {
  Download,
  FileSpreadsheet,
  RefreshCw,
  Truck,
  ArrowUpRight,
  ChevronDown,
  Layers,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  Radio,
  Satellite,
  Activity,
  Globe,
  Droplets,
  Maximize2,
  Minimize2,
  X,
  Database,
  UploadCloud,
  Edit3,
  Sparkles,
  Compass,
  Waves
} from 'lucide-react';
import { GuidedDemoWalkthroughModal } from './GuidedDemoWalkthroughModal';
import { ImpactComparisonCard } from './ImpactComparisonCard';
import { AIDroughtAdvisorWidget } from './AIDroughtAdvisorWidget';

export const DashboardView: React.FC = () => {
  const {
    setCurrentModule,
    districts,
    convoys,
    directives,
    showToast,
    dismissDirective,
    isVedasSyncing,
    lastVedasSync,
    vedasSyncStatus,
    syncVedasData,
    vedasPortalUrl,
    setIsDataFeedModalOpen,
    dataSourceInfo,
    fetchLiveSatelliteWeatherData,
    updateRawDistricts
  } = useApp();

  // Map layer toggle: including official VEDAS Krishi-DSS satellite products
  const [mapLayer, setMapLayer] = useState<'deficit' | 'moisture' | 'vedas_spi' | 'vedas_vci' | 'tankers'>('deficit');

  // Fullscreen map mode to prevent clutter in dashboard card and show all options when expanded
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullscreen]);

  // Selected taluka popover on map
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('tikamgarh');

  // Data table state
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<keyof DistrictMetric>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  // Active district for map popover
  const activeDistrict = districts.find(d => d.id === selectedTalukaId) || districts[0];

  // Map Tehsil Polygon definitions (single-hue choropleth for Madhya Pradesh)
  const mapPolygons = [
    {
      id: 'tikamgarh',
      name: 'Tikamgarh',
      taluka: 'Baldeogarh & Jatara',
      path: 'M 250 150 L 360 135 L 390 195 L 350 250 L 270 245 L 230 190 Z',
      centroid: { x: 300, y: 190 },
      deficit: -64.2,
      moisture: 13.5,
      claims: 15420,
      crop: 'Soybean & Sesame',
      spi3M: -2.24,
      vci: 19.4,
      vedasCategory: 'Severe'
    },
    {
      id: 'chhatarpur',
      name: 'Chhatarpur',
      taluka: 'Nowgong & Bijawar',
      path: 'M 390 195 L 470 185 L 510 255 L 450 310 L 370 285 L 350 250 Z',
      centroid: { x: 430, y: 250 },
      deficit: -59.5,
      moisture: 15.2,
      claims: 13850,
      crop: 'Soybean & Mustard',
      spi3M: -2.12,
      vci: 22.1,
      vedasCategory: 'Severe'
    },
    {
      id: 'barwani',
      name: 'Barwani',
      taluka: 'Sendhwa & Pansemal',
      path: 'M 270 245 L 350 250 L 370 285 L 350 345 L 290 355 L 240 305 Z',
      centroid: { x: 310, y: 300 },
      deficit: -56.8,
      moisture: 16.8,
      claims: 11200,
      crop: 'Bt Cotton & Maize',
      spi3M: -2.05,
      vci: 24.8,
      vedasCategory: 'Severe'
    },
    {
      id: 'sheopur',
      name: 'Sheopur',
      taluka: 'Karahal & Vijaypur',
      path: 'M 360 135 L 460 115 L 490 175 L 390 195 Z',
      centroid: { x: 420, y: 155 },
      deficit: -53.4,
      moisture: 18.4,
      claims: 8940,
      crop: 'Mustard & Bajra',
      spi3M: -1.98,
      vci: 26.5,
      vedasCategory: 'Severe'
    },
    {
      id: 'shivpuri',
      name: 'Shivpuri',
      taluka: 'Kolaras & Karera',
      path: 'M 470 185 L 570 170 L 610 240 L 510 255 Z',
      centroid: { x: 535, y: 210 },
      deficit: -49.6,
      moisture: 20.2,
      claims: 8120,
      crop: 'Soybean & Groundnut',
      spi3M: -1.88,
      vci: 28.9,
      vedasCategory: 'Severe'
    },
    {
      id: 'khargone',
      name: 'Khargone',
      taluka: 'Kasrawad & Maheshwar',
      path: 'M 270 95 L 370 80 L 360 135 L 250 150 Z',
      centroid: { x: 310, y: 115 },
      deficit: -48.2,
      moisture: 21.0,
      claims: 7650,
      crop: 'Chilli & Cotton',
      spi3M: -1.82,
      vci: 31.2,
      vedasCategory: 'Severe'
    },
    {
      id: 'dewas',
      name: 'Dewas',
      taluka: 'Sonkatch & Bagli',
      path: 'M 180 260 L 240 305 L 290 355 L 240 405 L 150 375 L 145 310 Z',
      centroid: { x: 205, y: 335 },
      deficit: -44.5,
      moisture: 23.2,
      claims: 6410,
      crop: 'Soybean & Durum Wheat',
      spi3M: -1.74,
      vci: 33.8,
      vedasCategory: 'Moderate'
    }
  ];

  // Dynamic choropleth color fill depending on active layer (VEDAS SPI, VCI, or rainfall deficit)
  const getChoroplethFill = (poly: typeof mapPolygons[0]) => {
    if (mapLayer === 'vedas_spi') {
      // Standardized Precipitation Index: -2.0 is extreme/severe (deep red), -1.5 is moderate, >-1.0 is mild
      if (poly.spi3M <= -2.1) return '#991B1B';
      if (poly.spi3M <= -1.9) return '#C62828';
      if (poly.spi3M <= -1.7) return '#EF5350';
      if (poly.spi3M <= -1.5) return '#FCA5A5';
      return '#FEE2E2';
    }

    if (mapLayer === 'vedas_vci') {
      // Vegetation Condition Index: < 20% is severe distress (deep red), 20-30% moderate, 30-40% mild, >40% healthy
      if (poly.vci <= 22) return '#991B1B';
      if (poly.vci <= 26) return '#C62828';
      if (poly.vci <= 34) return '#EF5350';
      if (poly.vci <= 40) return '#FCA5A5';
      return '#FEE2E2';
    }

    if (mapLayer === 'moisture') {
      if (poly.moisture <= 15) return '#991B1B';
      if (poly.moisture <= 18) return '#C62828';
      if (poly.moisture <= 22) return '#EF5350';
      return '#FCA5A5';
    }

    // Default: rainfall deficit
    const abs = Math.abs(poly.deficit);
    if (abs >= 55) return '#991B1B'; // dark red / maroon (critical)
    if (abs >= 45) return '#C62828'; // red (severe)
    if (abs >= 38) return '#EF5350'; // medium red
    if (abs >= 30) return '#FCA5A5'; // light red
    return '#FEE2E2'; // very light red
  };

  // Filtered and sorted table data
  const filteredDistricts = useMemo(() => {
    return districts
      .filter(d => {
        if (!tableSearch) return true;
        const q = tableSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.talukas.toLowerCase().includes(q) ||
          d.division.toLowerCase().includes(q) ||
          (d.vedasCategory && d.vedasCategory.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [districts, tableSearch, sortField, sortAsc]);

  const handleSort = (field: keyof DistrictMetric) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleDeployTeam = () => {
    setCurrentModule('resource-routing-logistics');
    showToast(
      'Deployment Assigned',
      `Tanker convoy assigned to ${activeDistrict.name} (${activeDistrict.talukas.split(',')[0]}).`,
      'primary'
    );
  };

  const handleExportCSV = () => {
    const headers = 'District,Division,Taluka Count,Risk Level,VEDAS Category,Rainfall Deficit %,VEDAS SPI-3M,VEDAS VCI %,Soil Moisture %,Open Claims,Last Action\n';
    const rows = districts
      .map(
        d =>
          `"${d.name}","${d.division}",${d.talukaCount},"${d.riskLevel}","${d.vedasCategory || 'Severe'}",${d.precipDeficit}%,${d.spi3M || -1.8},${d.vci || 28.5}%,${d.soilMoisture}%,${d.openClaims},"${d.lastAction}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Madhya_Pradesh_Drought_VEDAS_Dataset_24Oct2026.csv`;
    a.click();
    showToast('Export Completed', 'Downloaded VEDAS Krishi-DSS district dataset (CSV)', 'primary');
  };

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Page Header (No 'Good morning' hero text) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            State Drought Overview
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Madhya Pradesh State Relief Commissionerate (Vallabh Bhavan, Bhopal) · Last updated {lastVedasSync}
          </p>
        </div>

        {/* Action Controls: Live AI Advisor & Relief Deployment Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live AI Drought Advisor Action */}
          <button
            type="button"
            onClick={() => setIsAdvisorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#BCD4EC] text-xs font-semibold text-[#0F4C81] hover:bg-[#EEF4FA] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
            title="Ask Gemini 3.8 Flash live IMD weather forecast and scarcity advisories"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F4C81]" />
            <span>AI Advisor</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleDeployTeam}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Deploy Relief Team</span>
          </button>
        </div>
      </div>

      {/* Active Pacific El Niño (ENSO) Teleconnection Diagnostic Banner */}
      <div className="bg-linear-to-r from-[#FFF5F5] via-[#FFF8F0] to-[#FFFFFF] border border-[#F5C6CB] rounded-lg p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#FDECEA] border border-[#F5C6CB] flex items-center justify-center shrink-0 text-[#C62828]">
              <Waves className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#991B1B]">
                  Active Pacific El Niño Teleconnection Forcing
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FDECEA] text-[#C62828] border border-[#F5C6CB]">
                  Niño 3.4 SST: +1.48°C (Moderate El Niño)
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FFF8E1] text-[#8C5300] border border-[#FFE082]">
                  SOI: -11.4 Coupled
                </span>
              </div>
              <p className="text-[11px] text-[#4B5563] mt-0.5">
                Atmospheric Walker Circulation subsidence limb active over Central India (20°N–26°N) · Suppressing Bay of Bengal moisture pulses · 78% dry spell risk in Bundelkhand & Nimar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentModule('enso-teleconnection')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] transition-colors shrink-0 shadow-xs cursor-pointer self-start sm:self-center"
          >
            <span>Oceanic ENSO Radar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empirical Impact Comparison Matrix: Status Quo vs EPE Preemption */}
      <ImpactComparisonCard />

      {/* Official ISRO SAC VEDAS Krishi-DSS Live Telemetry Bar */}
      <div className="bg-[#FFFFFF] border border-[#BCD4EC] rounded-lg p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EEF4FA] border border-[#BCD4EC] flex items-center justify-center shrink-0 text-[#0F4C81]">
              <Satellite className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#111827]">
                  ISRO Space Applications Centre (SAC) · VEDAS Krishi-DSS
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EEF4FA] text-[#2E7D32] border border-[#BCD4EC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                  Active Satellite Stream
                </span>
                {/* Active Data Source indicator neatly placed */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                  <Database className="w-3 h-3 text-[#166534]" />
                  <span>{dataSourceInfo.label}</span>
                  <span className="text-[#15803D] hidden sm:inline">({dataSourceInfo.count} districts)</span>
                </span>
              </div>
              <p className="text-[11px] text-[#4B5563] mt-0.5">
                Multi-sensor drought assessment via Oceansat-3, INSAT-3DR, and Sentinel-2 ground stations · Telemetry synced: {lastVedasSync}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick parameter summary chips */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] text-[#4B5563] bg-[#F6F7F9] px-2.5 py-1 rounded border border-[#E3E6EB]">
              <span>State SPI-3M: <strong className="text-[#C62828] font-mono">-1.78</strong></span>
              <span className="text-[#D1D5DB]">|</span>
              <span>Mean VCI: <strong className="text-[#B26A00] font-mono">33.1%</strong></span>
              <span className="text-[#D1D5DB]">|</span>
              <span>Soil Dev: <strong className="text-[#C62828] font-mono">-39.4%</strong></span>
            </div>

            {/* 1-Click Live Satellite API (Relocated neatly here) */}
            <button
              type="button"
              onClick={async () => {
                showToast('Fetching Live Satellites', 'Connecting to Open-Meteo ECMWF/GFS satellite feed across MP...', 'secondary');
                await fetchLiveSatelliteWeatherData();
              }}
              disabled={isVedasSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#16A34A] text-white rounded-md hover:bg-[#15803D] font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              title="Fetch live temperature, precipitation & volumetric soil moisture for all MP districts"
            >
              <Radio className={`w-3.5 h-3.5 ${isVedasSyncing ? 'animate-spin' : ''}`} />
              <span>Live Satellite</span>
            </button>

            {/* 2024-25 Crisis Records (Relocated neatly here) */}
            <button
              type="button"
              onClick={() => {
                updateRawDistricts(REAL_MP_BUNDELKHAND_2024_CRISIS, 'Real 2024-25 Bundelkhand Crisis');
                showToast('Real Crisis Data Fed', 'Injected authentic Bundelkhand 2024-25 ground disaster observations.', 'primary');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#C62828] border border-[#F5C6CB] rounded-md hover:bg-[#FDECEA] font-semibold text-xs transition-colors cursor-pointer"
              title="Load authentic 2024-25 Bundelkhand ground observations"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Crisis Records</span>
            </button>

            {/* Upload CSV / Edit Ground Data (Relocated neatly here) */}
            <button
              type="button"
              onClick={() => setIsDataFeedModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#0F4C81] border border-[#BCD4EC] rounded-md hover:bg-[#EEF4FA] font-semibold text-xs transition-colors cursor-pointer"
              title="Upload custom CSV/JSON, edit district table, or download templates"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Data Studio</span>
            </button>

            {/* Direct Official VEDAS Portal Link */}
            <a
              href={vedasPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F8FAFC] text-[#334155] border border-[#CBD5E1] text-xs font-semibold hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              <span>VEDAS Portal</span>
              <ExternalLink className="w-3 h-3 stroke-[1.5]" />
            </a>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar: Slim, full-width, light red background #FDECEA, 3px red left border #C62828 */}
      <div className="w-full bg-[#FDECEA] border-l-[3px] border-[#C62828] border-y border-r border-[#F5C6CB] px-3.5 py-2.5 rounded-r-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#C62828] min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#C62828] shrink-0" />
          <span className="font-medium truncate">
            Critical moisture deficit detected across 14 tehsils in Tikamgarh, Chhatarpur and Barwani. Emergency tanker mobilization active.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCurrentModule('drought-risk-monitor')}
          className="text-xs font-semibold text-[#C62828] hover:underline whitespace-nowrap ml-4 shrink-0"
        >
          View details →
        </button>
      </div>

      {/* KPI Row of 4 Cards: Consistent heights, 8px radius, white with 1px border #E3E6EB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Districts at high risk */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between h-[124px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Districts at high risk
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#C62828] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              +2 this week
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[28px] font-bold text-[#111827] tabular-nums leading-none">
              12
            </span>
            <span className="text-xs text-[#6B7280]">of 55 districts</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Zone V severe stress</span>
            {/* Sparkline mini-graph */}
            <svg className="w-16 h-3 text-[#C62828]" viewBox="0 0 60 12" fill="none">
              <path
                d="M 2 10 L 15 8 L 30 9 L 45 4 L 58 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Relief budget utilised */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between h-[124px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Relief budget utilised
            </span>
            <span className="text-[11px] text-[#4B5563] font-medium tabular-nums">
              28.4%
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[28px] font-bold text-[#111827] tabular-nums leading-none">
              ₹142
            </span>
            <span className="text-xs text-[#6B7280]">Cr of ₹500 Cr</span>
          </div>

          <div className="w-full bg-[#F1F3F5] rounded-full h-1 overflow-hidden mt-1">
            <div className="bg-[#0F4C81] h-full rounded-full" style={{ width: '28.4%' }} />
          </div>
        </div>

        {/* Card 3: Verified beneficiaries */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between h-[124px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Verified beneficiaries
            </span>
            <span className="text-[11px] text-[#2E7D32] font-medium">
              94.2% verified
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[28px] font-bold text-[#111827] tabular-nums leading-none">
              48,392
            </span>
            <span className="text-xs text-[#6B7280]">farmers</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Geo-tagged plots</span>
            <span className="text-[#2E7D32] font-medium">+1,240 today</span>
          </div>
        </div>

        {/* Card 4: Convoys in transit */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between h-[124px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Convoys in transit
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#2E7D32] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
              On schedule
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-[28px] font-bold text-[#111827] tabular-nums leading-none">
              {convoys.length}
            </span>
            <span className="text-xs text-[#6B7280]">relief fleets</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Water tankers & fodder</span>
            <span>4 hr avg ETA</span>
          </div>
        </div>
      </div>

      {/* Water Availability & Critical Reservoir Storage Monitoring Grid */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] mb-3 gap-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#0F4C81]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Major Reservoir Live Storage & Potable Water Runway
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span>Telemetry: Madhya Pradesh Water Resources Dept (MPWRD / CWC)</span>
            <span>•</span>
            <span>Refreshed: 24 Oct 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RESERVOIR_DATA.map(res => (
            <div key={res.id} className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-[#111827] truncate" title={res.name}>
                    {res.name}
                  </h4>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    res.status === 'Critical Low' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                    'bg-[#DCFCE7] text-[#166534]'
                  }`}>
                    {res.status}
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280] block truncate">{res.river} · {res.district}</span>

                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-lg font-bold text-[#111827] tabular-nums">
                    {res.currentPct}%
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    ({res.currentLiveTmc} / {res.grossCapacityTmc} TMC)
                  </span>
                </div>

                <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      res.currentPct < 10 ? 'bg-[#DC2626]' :
                      res.currentPct < 25 ? 'bg-[#D97706]' : 'bg-[#10B981]'
                    }`}
                    style={{ width: `${Math.min(100, res.currentPct)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E3E6EB] flex justify-between items-center text-[10px] text-[#6B7280]">
                <span>Drinking reserve:</span>
                <span className={`font-bold ${res.drinkingWaterReserveMonths < 2.5 ? 'text-[#DC2626]' : 'text-[#0F4C81]'}`}>
                  {res.drinkingWaterReserveMonths} Months
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop for Fullscreen Map */}
      {isMapFullscreen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMapFullscreen(false)}
        />
      )}

      {/* Main Area: Map Card (65% width) next to Priority Actions Card (35% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Card (~65% width, 8 cols on desktop or full screen overlay) */}
        <div
          className={`bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between transition-all ${
            isMapFullscreen
              ? 'fixed inset-2 md:inset-4 z-50 rounded-xl shadow-2xl border-[#BCD4EC] overflow-y-auto'
              : 'lg:col-span-8'
          }`}
        >
          <div>
            {/* Map Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E6EB]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#111827]">
                    Regional Drought Severity Map
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    Bundelkhand & Malwa Divisions
                  </span>
                  {isMapFullscreen && (
                    <span className="text-[10px] font-semibold bg-[#EEF4FA] text-[#0F4C81] px-2 py-0.5 rounded-full border border-[#BCD4EC]">
                      Fullscreen Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Click a taluka polygon to inspect key telemetry and dispatch units
                </p>
              </div>

              {/* Layer Toggle & Actions: Uncluttered in normal card view, all options displayed in fullscreen */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {isMapFullscreen ? (
                  /* Expanded view: Show all options explicitly as requested */
                  <>
                    <div className="flex flex-wrap items-center bg-[#F1F3F5] p-0.5 rounded-md border border-[#E3E6EB] gap-0.5">
                      <button
                        type="button"
                        onClick={() => setMapLayer('deficit')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          mapLayer === 'deficit'
                            ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        Rain deficit
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer('moisture')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          mapLayer === 'moisture'
                            ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        Soil moisture
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer('vedas_spi')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          mapLayer === 'vedas_spi'
                            ? 'bg-[#0F4C81] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold'
                            : 'text-[#0F4C81] hover:text-[#0A3963]'
                        }`}
                      >
                        VEDAS SPI-3M
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer('vedas_vci')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          mapLayer === 'vedas_vci'
                            ? 'bg-[#0F4C81] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold'
                            : 'text-[#0F4C81] hover:text-[#0A3963]'
                        }`}
                      >
                        VEDAS VCI
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapLayer('tankers')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          mapLayer === 'tankers'
                            ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold'
                            : 'text-[#4B5563] hover:text-[#111827]'
                        }`}
                      >
                        Routes
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#4B5563] bg-white border border-[#E3E6EB] hover:text-[#111827] hover:bg-[#F9FAFB] shadow-xs transition-colors"
                      title="Download GIS data"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMapFullscreen(false)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0A3963] shadow-xs transition-colors"
                      title="Exit Fullscreen (Esc)"
                    >
                      <Minimize2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Exit Fullscreen</span>
                    </button>
                  </>
                ) : (
                  /* Compact uncluttered view: Clean dropdown selector + Fullscreen button */
                  <>
                    <div className="inline-flex items-center gap-1.5 bg-[#F6F7F9] border border-[#E3E6EB] px-2.5 py-1 rounded-md text-xs shadow-xs">
                      <Layers className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
                      <span className="text-[#6B7280] font-medium text-[11px]">Layer:</span>
                      <select
                        value={mapLayer}
                        onChange={e => setMapLayer(e.target.value as any)}
                        className="bg-transparent text-xs font-semibold text-[#111827] focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="deficit">Rain deficit</option>
                        <option value="moisture">Soil moisture</option>
                        <option value="vedas_spi">VEDAS SPI-3M</option>
                        <option value="vedas_vci">VEDAS VCI</option>
                        <option value="tankers">Routes</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMapFullscreen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#0F4C81] bg-[#EEF4FA] border border-[#BCD4EC] hover:bg-[#E0EDF8] shadow-xs transition-colors"
                      title="Fullscreen map to display all layer options"
                    >
                      <Maximize2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="p-1 rounded-md text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F3F5] border border-transparent hover:border-[#E3E6EB] transition-colors"
                      title="Download GIS data"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Map Canvas with Single-Hue Choropleth & Scale Bar */}
            <div
              className={`relative w-full ${
                isMapFullscreen ? 'h-[calc(100vh-220px)] min-h-[500px]' : 'h-[360px]'
              } bg-[#F9FAFB] rounded-md border border-[#E3E6EB] mt-3 overflow-hidden transition-all`}
            >
              {/* Subtle grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#D1D5DB_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

              {/* Clean SVG Vector Map */}
              <svg className="w-full h-full" viewBox="0 0 750 440" preserveAspectRatio="xMidYMid meet">
                {/* District Polygons */}
                {mapPolygons.map(poly => {
                  const isSelected = selectedTalukaId === poly.id;
                  const fill = getChoroplethFill(poly);

                  return (
                    <g key={poly.id} onClick={() => setSelectedTalukaId(poly.id)} className="cursor-pointer">
                      <path
                        d={poly.path}
                        fill={fill}
                        fillOpacity={isSelected ? 0.95 : 0.8}
                        stroke={isSelected ? '#0F4C81' : '#FFFFFF'}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        className="transition-all hover:fill-opacity-95"
                      />
                      {/* Centroid Label */}
                      <text
                        x={poly.centroid.x}
                        y={poly.centroid.y}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="600"
                        className="pointer-events-none drop-shadow-sm"
                      >
                        {poly.name}
                      </text>
                      <text
                        x={poly.centroid.x}
                        y={poly.centroid.y + 13}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        opacity="0.9"
                        className="pointer-events-none font-mono"
                      >
                        {mapLayer === 'vedas_spi'
                          ? `SPI ${poly.spi3M}`
                          : mapLayer === 'vedas_vci'
                          ? `VCI ${poly.vci}%`
                          : mapLayer === 'moisture'
                          ? `${poly.moisture}% sm`
                          : `${poly.deficit}%`}
                      </text>
                    </g>
                  );
                })}

                {/* Tanker Corridors (if layer active) */}
                {mapLayer === 'tankers' && (
                  <g>
                    <path
                      d="M 310 160 Q 340 190 300 190"
                      stroke="#0F4C81"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      fill="none"
                    />
                    <path
                      d="M 300 190 Q 360 220 430 250"
                      stroke="#0F4C81"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      fill="none"
                    />
                    <path
                      d="M 430 250 Q 380 270 310 300"
                      stroke="#0F4C81"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      fill="none"
                    />
                  </g>
                )}
              </svg>

              {/* Taluka Detail Popover (Small white card, key-value rows, VEDAS indicators) */}
              <div className="absolute top-3 left-3 bg-white border border-[#E3E6EB] rounded-md shadow-md p-3 w-64 text-xs z-10">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E6EB] mb-2">
                  <div>
                    <span className="font-bold text-[#111827]">{activeDistrict.name}</span>
                    <span className="text-[11px] text-[#6B7280] block">{activeDistrict.talukas}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      activeDistrict.riskLevel === 'Critical'
                        ? 'bg-[#FDECEA] text-[#C62828]'
                        : 'bg-[#FFF8E1] text-[#B26A00]'
                    }`}
                  >
                    {activeDistrict.vedasCategory ? `VEDAS: ${activeDistrict.vedasCategory}` : activeDistrict.riskLevel}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Rainfall deficit:</span>
                    <span className="font-semibold text-[#C62828] tabular-nums">
                      {activeDistrict.precipDeficit}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">VEDAS SPI-3M:</span>
                    <span className="font-semibold text-[#C62828] font-mono tabular-nums">
                      {activeDistrict.spi3M ?? -2.18} (Severe)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Vegetation (VCI):</span>
                    <span className="font-semibold text-[#B26A00] font-mono tabular-nums">
                      {activeDistrict.vci ?? 21.8}% (Distress)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Soil moisture dev:</span>
                    <span className="font-semibold text-[#111827] tabular-nums">
                      {activeDistrict.soilMoistureDev ?? -51.2}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Open claims:</span>
                    <span className="font-semibold text-[#111827] tabular-nums">
                      {activeDistrict.openClaims.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleDeployTeam}
                    className="w-full py-1 rounded bg-[#0F4C81] text-white font-medium text-[11px] hover:bg-[#0A3963] transition-colors"
                  >
                    Deploy tankers to taluka
                  </button>
                  <a
                    href={vedasPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1 rounded bg-[#F6F7F9] border border-[#E3E6EB] text-[#4B5563] hover:text-[#111827] font-medium text-[11px] text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Inspect on VEDAS Krishi-DSS</span>
                    <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                  </a>
                </div>
              </div>

              {/* Map Legend Box */}
              <div className="absolute bottom-3 right-3 bg-white/95 border border-[#E3E6EB] rounded px-2.5 py-1.5 text-[11px] text-[#4B5563] shadow-sm flex items-center gap-3">
                <span className="font-semibold text-[#111827]">
                  {mapLayer === 'vedas_spi'
                    ? 'VEDAS SPI-3M:'
                    : mapLayer === 'vedas_vci'
                    ? 'VEDAS VCI:'
                    : mapLayer === 'moisture'
                    ? 'Soil moisture:'
                    : 'Rain deficit:'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#991B1B]" />
                  <span>
                    {mapLayer === 'vedas_spi' ? '< -2.0' : mapLayer === 'vedas_vci' ? '< 22%' : '> 55%'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#C62828]" />
                  <span>
                    {mapLayer === 'vedas_spi' ? '-1.8 to -2.0' : mapLayer === 'vedas_vci' ? '22–26%' : '45–55%'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#EF5350]" />
                  <span>
                    {mapLayer === 'vedas_spi' ? '-1.6 to -1.8' : mapLayer === 'vedas_vci' ? '26–34%' : '35–45%'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#FCA5A5]" />
                  <span>
                    {mapLayer === 'vedas_spi' ? '> -1.6' : mapLayer === 'vedas_vci' ? '> 34%' : '< 35%'}
                  </span>
                </div>
              </div>

              {/* Scale Bar */}
              <div className="absolute bottom-3 left-3 bg-white/90 border border-[#E3E6EB] rounded px-2 py-1 text-[10px] text-[#6B7280] shadow-sm flex items-center gap-1.5">
                <div className="w-10 h-1 bg-[#111827]" />
                <span>50 km</span>
              </div>
            </div>
          </div>

          {/* Provenance note */}
          <div className="pt-2 text-[11px] text-[#9CA3AF] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>Source: ISRO Space Applications Centre (SAC) · VEDAS Krishi-DSS & IMD Automated Weather Stations</span>
            <a
              href={vedasPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0F4C81] font-medium hover:underline text-[11px] inline-flex items-center gap-1"
            >
              <span>Explore full VEDAS portal</span>
              <ExternalLink className="w-3 h-3 stroke-[1.5]" />
            </a>
          </div>
        </div>

        {/* Priority Actions Card (~35% width, 4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#111827]">
                  Priority Actions
                </h3>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F1F3F5] text-[#4B5563] font-medium">
                  {directives.length} pending
                </span>
              </div>
              <span className="text-[11px] text-[#6B7280]">Relief Cell Queue</span>
            </div>

            {/* Compact Action List (severity dot, title, description, timestamp, text-button) */}
            <div className="divide-y divide-[#F1F3F5] mt-1">
              {directives.map(dir => (
                <div key={dir.id} className="py-2.5 first:pt-2">
                  <div className="flex items-start gap-2">
                    {/* Severity dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        dir.severity === 'critical' ? 'bg-[#C62828]' : 'bg-[#B26A00]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#111827] leading-snug">
                          {dir.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                        {dir.description}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[#9CA3AF] tabular-nums">
                          {dir.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (dir.targetModule) setCurrentModule(dir.targetModule);
                            showToast('Action Processed', `Triggered: ${dir.title}`, 'primary');
                          }}
                          className="text-[11px] font-semibold text-[#0F4C81] hover:underline"
                        >
                          {dir.actionText} →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E6EB] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#6B7280]">All actions logged to State Cell audit trail</span>
            <button
              type="button"
              onClick={() => showToast('Protocol Verified', 'All active directives acknowledged by Duty Officer.', 'secondary')}
              className="text-[11px] text-[#4B5563] hover:text-[#111827] font-medium"
            >
              Acknowledge all
            </button>
          </div>
        </div>
      </div>

      {/* D3.js Line Chart: Visualizing Drought Severity & VEDAS Satellite Indices */}
      <DroughtSeverityChart />

      {/* Data Table: Districts Requiring Attention */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E6EB]">
          <div>
            <h3 className="text-sm font-semibold text-[#111827]">
              Districts Requiring Attention (VEDAS Krishi-DSS Telemetry)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ranked by composite moisture deficit, Standardized Precipitation Index (SPI-3M), and VCI
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Filter districts or talukas..."
                className="bg-[#F6F7F9] text-xs text-[#111827] pl-8 pr-3 py-1 rounded border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] w-48"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#E3E6EB] bg-white text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#6B7280] stroke-[1.5]" />
              <span>Export VEDAS CSV</span>
            </button>
          </div>
        </div>

        {/* Sortable Table (Zebra-free, clean 13px font, hover state) */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider bg-[#FAFBFC]">
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  District
                </th>
                <th
                  onClick={() => handleSort('riskLevel')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  Risk level
                </th>
                <th className="py-2.5 px-3">
                  VEDAS Category
                </th>
                <th
                  onClick={() => handleSort('precipDeficit')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  Rainfall deficit %
                </th>
                <th
                  onClick={() => handleSort('spi3M')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  SPI-3M (VEDAS)
                </th>
                <th
                  onClick={() => handleSort('vci')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  VCI % (VEDAS)
                </th>
                <th
                  onClick={() => handleSort('soilMoisture')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  Soil moisture %
                </th>
                <th
                  onClick={() => handleSort('openClaims')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#111827] select-none"
                >
                  Open claims
                </th>
                <th className="py-2.5 px-3">
                  Last action
                </th>
                <th className="py-2.5 px-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#6B7280]">
                    No districts matching filter.
                  </td>
                </tr>
              ) : (
                filteredDistricts.map(dist => (
                  <tr
                    key={dist.id}
                    className="hover:bg-[#F9FAFB] transition-colors group"
                  >
                    {/* District & Talukas */}
                    <td className="py-2.5 px-3 font-medium text-[#111827]">
                      <div>
                        <span className="font-semibold">{dist.name}</span>
                        <span className="text-[11px] text-[#6B7280] block font-normal">
                          {dist.talukas}
                        </span>
                      </div>
                    </td>

                    {/* Risk Level with Small Dot */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            dist.riskLevel === 'Critical'
                              ? 'bg-[#C62828]'
                              : dist.riskLevel === 'Warning'
                              ? 'bg-[#B26A00]'
                              : 'bg-[#2E7D32]'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            dist.riskLevel === 'Critical'
                              ? 'text-[#C62828]'
                              : dist.riskLevel === 'Warning'
                              ? 'text-[#B26A00]'
                              : 'text-[#2E7D32]'
                          }`}
                        >
                          {dist.riskLevel}
                        </span>
                      </div>
                    </td>

                    {/* VEDAS Category */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                          dist.vedasCategory === 'Severe'
                            ? 'bg-[#FDECEA] text-[#C62828] border border-[#F5C6CB]'
                            : dist.vedasCategory === 'Moderate'
                            ? 'bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]'
                            : 'bg-[#EEF4FA] text-[#2E7D32] border border-[#BCD4EC]'
                        }`}
                      >
                        {dist.vedasCategory || 'Moderate'}
                      </span>
                    </td>

                    {/* Rainfall Deficit with Subtle Mini Bar */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-semibold text-[#C62828]">
                          {dist.precipDeficit}%
                        </span>
                        <div className="w-10 bg-[#F1F3F5] rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#C62828] h-full"
                            style={{ width: `${Math.min(100, Math.abs(dist.precipDeficit))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* VEDAS SPI-3M */}
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-[#C62828] tabular-nums">
                      {dist.spi3M ?? -1.82}
                    </td>

                    {/* VEDAS VCI % */}
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-[#B26A00] tabular-nums">
                      {dist.vci ?? 28.5}%
                    </td>

                    {/* Soil Moisture */}
                    <td className="py-2.5 px-3 tabular-nums text-[#111827]">
                      {dist.soilMoisture}%
                    </td>

                    {/* Open Claims */}
                    <td className="py-2.5 px-3 tabular-nums text-[#111827]">
                      {dist.openClaims.toLocaleString()}
                    </td>

                    {/* Last Action */}
                    <td className="py-2.5 px-3 text-xs text-[#4B5563]">
                      {dist.lastAction}
                    </td>

                    {/* Action Link */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTalukaId(dist.id);
                          setCurrentModule('drought-risk-monitor');
                        }}
                        className="text-xs font-semibold text-[#0F4C81] hover:underline"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Provenance */}
        <div className="pt-3 border-t border-[#E3E6EB] mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6B7280] gap-2">
          <span>Source: ISRO SAC VEDAS Krishi-DSS & Madhya Pradesh State Disaster Management Authority (MPSDMA)</span>
          <span className="tabular-nums">Showing {filteredDistricts.length} of {districts.length} monitored administrative units</span>
        </div>
      </div>

      {/* Guided 4-Step Hackathon Walkthrough Modal */}
      <GuidedDemoWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Live AI Drought Advisor & IMD Grounding Modal */}
      <AIDroughtAdvisorWidget
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
};
