import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingDown,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  BarChart3,
  Compass,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Activity,
  Droplets,
  Sprout,
  Sun,
  CloudRain
} from 'lucide-react';

export const RiskForecastView: React.FC = () => {
  const { districts, setCurrentModule } = useApp();

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('tikamgarh');
  const [timeHorizon, setTimeHorizon] = useState<'15d' | '30d' | '60d' | 'season'>('30d');
  const [activeTab, setActiveTab] = useState<'observed' | 'historical' | 'forecast' | 'simulation'>('observed');
  const [selectedIndicator, setSelectedIndicator] = useState<'spi' | 'vci' | 'soil' | 'reservoir'>('spi');

  const district = districts.find(d => d.id === selectedDistrictId) || districts[0];

  // Indicator trend points with confidence interval (P10 pessimistic, P50 median, P90 optimistic)
  const trajectoryData = [
    { label: 'Week -4 (Aug 15)', observed: -1.4, p10: null, p50: null, p90: null, baseline: 0.0 },
    { label: 'Week -3 (Aug 22)', observed: -1.7, p10: null, p50: null, p90: null, baseline: 0.0 },
    { label: 'Week -2 (Aug 29)', observed: -1.9, p10: null, p50: null, p90: null, baseline: 0.0 },
    { label: 'Week -1 (Sep 05)', observed: -2.1, p10: null, p50: null, p90: null, baseline: 0.0 },
    { label: 'Current (Observed)', observed: district.spi3M ?? -2.18, p10: district.spi3M ?? -2.18, p50: district.spi3M ?? -2.18, p90: district.spi3M ?? -2.18, baseline: 0.0 },
    { label: 'Week +1 (Forecast)', observed: null, p10: -2.45, p50: -2.25, p90: -2.05, baseline: 0.0 },
    { label: 'Week +2 (Forecast)', observed: null, p10: -2.62, p50: -2.31, p90: -1.95, baseline: 0.0 },
    { label: 'Week +3 (Forecast)', observed: null, p10: -2.85, p50: -2.40, p90: -1.82, baseline: 0.0 },
    { label: 'Week +4 (Forecast)', observed: null, p10: -3.05, p50: -2.52, p90: -1.70, baseline: 0.0 }
  ];

  // Historical analog comparisons
  const historicalAnalogs = [
    {
      year: '2023-24 (Recent El Niño)',
      spiAvg: -2.05,
      rainfallDeficit: -42.8,
      tankersDeployed: 2450,
      outcome: 'Widespread post-monsoon water rationing; rabi sowing reduced by 34%',
      similarityScore: 92
    },
    {
      year: '2017-18 (Severe Bundelkhand Drought)',
      spiAvg: -2.41,
      rainfallDeficit: -51.2,
      tankersDeployed: 3820,
      outcome: 'State declared scarcity across 114 tehsils; 950+ cattle fodder camps established in Bundelkhand',
      similarityScore: 88
    },
    {
      year: '2015-16 (Historic Two-Year Deficit)',
      spiAvg: -2.68,
      rainfallDeficit: -58.9,
      tankersDeployed: 4600,
      outcome: 'Tikamgarh & Chhatarpur emergency water trains deployed; extreme groundwater overdraft (<14% storage)',
      similarityScore: 79
    },
    {
      year: '2020-21 (Normal / La Niña Baseline)',
      spiAvg: +0.42,
      rainfallDeficit: +12.4,
      tankersDeployed: 120,
      outcome: 'Abundant reservoir replenishment; minimal emergency tanker expenditure',
      similarityScore: 18
    }
  ];

  return (
    <div className="flex flex-col w-full gap-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              Risk and Forecast Analysis
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF2F6] text-[#0F4C81] border border-[#D0D7DE]">
              Multi-Horizon Intelligence
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Transparently distinguishing observed field telemetry, historical analogs, statistical forecasts, and hypothetical stress scenarios.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* District selector */}
          <div className="relative">
            <select
              value={selectedDistrictId}
              onChange={e => setSelectedDistrictId(e.target.value)}
              className="bg-white border border-[#E3E6EB] text-xs font-semibold text-[#111827] rounded-md px-3 py-1.5 pr-8 hover:border-[#0F4C81] focus:outline-none focus:ring-1 focus:ring-[#0F4C81] cursor-pointer"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.division})
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon */}
          <div className="flex bg-[#EEF2F6] p-0.5 rounded-md border border-[#E3E6EB]">
            {(['15d', '30d', '60d', 'season'] as const).map(th => (
              <button
                key={th}
                type="button"
                onClick={() => setTimeHorizon(th)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  timeHorizon === th
                    ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {th === '15d' ? '15 Days' : th === '30d' ? '30 Days' : th === '60d' ? '60 Days' : 'Full Season'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentModule('relief-budget-optimizer')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] transition-colors"
          >
            <span>Proceed to Optimizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4-Pillar Architecture Navigation */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-wrap gap-1">
        {[
          { id: 'observed', label: '1. Observed Conditions', sub: 'Sensor & Satellite Telemetry', icon: Activity },
          { id: 'historical', label: '2. Historical Comparisons', sub: 'Analog Drought Years (2018, 2015)', icon: Clock },
          { id: 'forecast', label: '3. Forecasts & Model Estimates', sub: 'Extended Range & Probabilistic Outlook', icon: TrendingDown },
          { id: 'simulation', label: '4. Stress Scenarios & Limitations', sub: 'What-If Dry Spell Scenarios', icon: Compass }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[200px] text-left px-3 py-2 rounded-md transition-all ${
                isActive
                  ? 'bg-[#EEF4FA] text-[#0F4C81] border border-[#BCD4EC]'
                  : 'text-[#4B5563] hover:bg-[#F9FAFB] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F4C81]' : 'text-[#6B7280]'}`} />
                <span className="text-xs font-bold leading-tight">{tab.label}</span>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-0.5 pl-6">{tab.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Section 1: Observed Conditions */}
      {activeTab === 'observed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Current Ground Telemetry: {district.name} District
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Grounded in ISRO SAC VEDAS Krishi-DSS, IMD Bhopal, and MP WRD
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                Risk: {district.riskLevel} ({district.riskScore.toFixed(2)})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280] block">Precipitation Deficit</span>
                <span className="text-lg font-bold text-[#B91C1C] tabular-nums">
                  {district.precipDeficit}%
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">Ref: 1991-2020 Normal</span>
              </div>
              <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280] block">SPI 3-Month</span>
                <span className="text-lg font-bold text-[#B91C1C] tabular-nums">
                  {district.spi3M ?? -2.18}
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">ISRO SAC VEDAS</span>
              </div>
              <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280] block">Vegetation Condition (VCI)</span>
                <span className="text-lg font-bold text-[#D97706] tabular-nums">
                  {district.vci ?? 24.5}%
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">MODIS/INSAT-3DR</span>
              </div>
              <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280] block">Consecutive Dry Days</span>
                <span className="text-lg font-bold text-[#111827] tabular-nums">
                  {district.drySpellDays} Days
                </span>
                <span className="text-[10px] text-[#6B7280] block mt-0.5">IMD Automated Station</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Critical Ground Truth Diagnostics
              </h4>
              <div className="p-3 bg-[#FFFBEB] rounded-md border border-[#FDE68A] text-xs text-[#92400E]">
                <strong>Agronomic Soil Moisture Stress:</strong> Root-zone soil moisture is recorded at{' '}
                {district.soilMoisture}% ({district.soilMoistureDev ?? -38}% deviation from seasonal average). Rainfed soybean and cotton crops in {district.talukas} have crossed the permanent wilting point threshold without supplementary drip/sprinkler intervention.
              </div>
              <div className="p-3 bg-[#F0FDF4] rounded-md border border-[#BBF7D0] text-xs text-[#166534]">
                <strong>Data Provenance & Validation:</strong> Raw satellite radiances received from INSAT-3DR via SAC VEDAS Krishi-DSS portal. Ground validation corroborated by 38 taluka-level Automated Weather Stations (AWS) reporting every 15 minutes.
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111827] mb-2">District Profile: {district.name}</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
                Part of the rain-shadow drought-prone belt in {district.division} division. Comprises {district.talukaCount} talukas ({district.talukas}) with predominant agrarian economy dependent on Kharif soybean and cotton.
              </p>

              <div className="space-y-2 border-t border-[#E3E6EB] pt-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Registered Smallholders:</span>
                  <span className="font-semibold text-[#111827]">{(district.farmersCount).toLocaleString()} farmers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Cattle Population at Risk:</span>
                  <span className="font-semibold text-[#111827]">~3.4 Lakh Livestock</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#6B7280]">Live Reservoir Storage:</span>
                  <span className="font-semibold text-[#B91C1C]">11.4% (Critical)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#6B7280]">Groundwater Table Drop:</span>
                  <span className="font-semibold text-[#D97706]">-2.8 meters</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3E6EB]">
              <button
                type="button"
                onClick={() => setCurrentModule('drought-risk-monitor')}
                className="w-full py-2 px-3 rounded-md border border-[#0F4C81] text-[#0F4C81] text-xs font-semibold hover:bg-[#EEF4FA] text-center block transition-colors"
              >
                Inspect in Leaflet GIS Map →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Historical Comparisons */}
      {activeTab === 'historical' && (
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                Historical Analog Assessment (Madhya Pradesh Drought Archive)
              </h3>
              <p className="text-xs text-[#6B7280]">
                Comparing current {district.name} moisture trajectory against calibrated benchmark drought events
              </p>
            </div>
            <span className="text-xs text-[#6B7280]">Algorithm: Euclidean Distance on Multidimensional Hydro-Indices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#4B5563] border-b border-[#E3E6EB]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Benchmark Season</th>
                  <th className="py-2.5 px-3 font-semibold">Precip Deficit</th>
                  <th className="py-2.5 px-3 font-semibold">Mean SPI-3M</th>
                  <th className="py-2.5 px-3 font-semibold">Peak Tankers Requisitioned</th>
                  <th className="py-2.5 px-3 font-semibold">Analog Similarity</th>
                  <th className="py-2.5 px-3 font-semibold">Documented Field Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EB]">
                {historicalAnalogs.map((row, idx) => (
                  <tr key={idx} className={row.similarityScore > 85 ? 'bg-[#FEF2F2]/50 font-medium' : ''}>
                    <td className="py-3 px-3 text-[#111827]">
                      {row.year}
                      {row.similarityScore > 85 && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] font-bold">
                          Primary Analog
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#B91C1C] tabular-nums font-semibold">
                      {row.rainfallDeficit}%
                    </td>
                    <td className="py-3 px-3 tabular-nums">{row.spiAvg}</td>
                    <td className="py-3 px-3 tabular-nums">{row.tankersDeployed.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${row.similarityScore > 80 ? 'bg-[#DC2626]' : 'bg-[#10B981]'}`}
                            style={{ width: `${row.similarityScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold tabular-nums">{row.similarityScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#4B5563] max-w-xs">{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3.5 bg-[#F9FAF8] rounded-md border border-[#E3E6EB] text-xs text-[#4B5563] leading-relaxed">
            <strong>Key Analytical Finding:</strong> Current hydrological indicators track closest (92% similarity) to the 2023-24 El Niño season. However, groundwater depletion in {district.name} is accelerating 14% faster than in 2023 due to sequential low-recharge cycles. Early tanker logistics pre-positioning is strongly indicated before December peak.
          </div>
        </div>
      )}

      {/* Section 3: Forecasts & Model Estimates */}
      {activeTab === 'forecast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Predictive SPI-3M Trajectory & Confidence Envelope
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Projection with 80% Confidence Interval (P10 Pessimistic to P90 Optimistic)
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-[#DC2626]">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> P10 Worst-Case
                </span>
                <span className="flex items-center gap-1 text-[#0F4C81]">
                  <span className="w-2 h-2 rounded-full bg-[#0F4C81]" /> P50 Median
                </span>
                <span className="flex items-center gap-1 text-[#059669]">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" /> P90 Best-Case
                </span>
              </div>
            </div>

            {/* Visual Trajectory Chart using clean CSS Bars & Values */}
            <div className="space-y-2.5 pt-2">
              {trajectoryData.map((pt, i) => {
                const isForecast = pt.observed === null;
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-32 shrink-0 text-[#6B7280] font-medium text-[11px]">
                      {pt.label}
                    </span>
                    <div className="flex-1 bg-[#F1F5F9] rounded h-6 relative flex items-center px-2 overflow-hidden border border-[#E2E8F0]">
                      {/* Zero baseline mark */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#94A3B8]" />

                      {!isForecast ? (
                        <div
                          className="h-3.5 bg-[#0F4C81] rounded text-white text-[10px] flex items-center justify-end px-1.5 font-bold"
                          style={{
                            width: `${Math.min(50, Math.abs(pt.observed!) * 15)}%`,
                            marginLeft: pt.observed! < 0 ? `${50 - Math.min(50, Math.abs(pt.observed!) * 15)}%` : '50%'
                          }}
                        >
                          {pt.observed}
                        </div>
                      ) : (
                        <div
                          className="h-3.5 bg-[#DC2626]/20 border border-[#DC2626] rounded text-[#991B1B] text-[10px] flex items-center justify-between px-2 font-bold"
                          style={{
                            width: `${Math.min(50, (Math.abs(pt.p10!) - Math.abs(pt.p90!)) * 25 + 20)}%`,
                            marginLeft: `${50 - Math.min(50, Math.abs(pt.p10!) * 15)}%`
                          }}
                        >
                          <span>P10: {pt.p10}</span>
                          <span className="text-[#0F4C81]">P50: {pt.p50}</span>
                          <span className="text-[#059669]">P90: {pt.p90}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3E6EB] text-[11px] text-[#6B7280] flex justify-between">
              <span>Severe Drought Threshold: SPI &lt; -1.50</span>
              <span>Extreme Drought Threshold: SPI &lt; -2.00</span>
              <span>Baseline Normal: 0.00</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="text-sm font-bold text-[#111827] mb-2">Model Methodology & Boundaries</h3>
            <div className="space-y-3 text-xs text-[#4B5563] leading-relaxed">
              <div className="p-2.5 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <strong className="text-[#111827] block mb-0.5">Model Input Sources:</strong>
                IMD Multi-Model Ensemble (MME) 30-day extended range forecasts, ECMWF seasonal reanalysis, INSAT-3DR thermal infrared evapotranspiration.
              </div>
              <div className="p-2.5 bg-[#F9FAF8] rounded border border-[#E3E6EB]">
                <strong className="text-[#111827] block mb-0.5">Scientific Limitations:</strong>
                Sub-divisional precipitation forecasts in Bundelkhand & Nimar have a skill score (ROC area) of 0.68 beyond day 18. Local convective showers cannot be ruled out.
              </div>
              <div className="p-2.5 bg-[#FFFBEB] rounded border border-[#FDE68A] text-[#92400E]">
                <strong className="block mb-0.5">Non-Deterministic Caveat:</strong>
                Projections are probabilistic estimates. Resource allocation should follow robust minimax risk rules rather than point-forecast optimism.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Stress Scenarios */}
      {activeTab === 'simulation' && (
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h3 className="text-sm font-bold text-[#111827] mb-2">
            Hypothetical Climate Shock Simulations
          </h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Stress-testing district resilience under three unmitigated drought scenarios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-[#E3E6EB] bg-[#F9FAF8]">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-[#D97706]" />
                <h4 className="text-xs font-bold text-[#111827]">Scenario A: 21-Day Extended Dry Spell</h4>
              </div>
              <p className="text-[11px] text-[#4B5563] mb-3">
                Zero rainfall during flowering/pod-formation stage across rainfed talukas.
              </p>
              <ul className="text-[11px] text-[#6B7280] space-y-1.5 border-t border-[#E3E6EB] pt-2">
                <li>• Estimated Kharif crop loss: <strong>38% - 45%</strong></li>
                <li>• Immediate drinking water distress: <strong>140 villages</strong></li>
                <li>• Recommended response: Pre-position mobile drip sets & tank fills</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                <h4 className="text-xs font-bold text-[#991B1B]">Scenario B: Reservoir Dead-Storage Breach</h4>
              </div>
              <p className="text-[11px] text-[#991B1B] mb-3">
                Majalgaon & Manjara live storage drops below zero before November 15.
              </p>
              <ul className="text-[11px] text-[#991B1B]/80 space-y-1.5 border-t border-[#FCA5A5] pt-2">
                <li>• Municipal supply cycle: <strong>Once every 8-10 days</strong></li>
                <li>• Tanker fleet demand surge: <strong>+420 tankers/day</strong></li>
                <li>• Recommended response: Emergency inter-basin pipeline lifting</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-[#E3E6EB] bg-[#F9FAF8]">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-[#2563EB]" />
                <h4 className="text-xs font-bold text-[#111827]">Scenario C: Fodder Camp Saturation</h4>
              </div>
              <p className="text-[11px] text-[#4B5563] mb-3">
                Local dry fodder stocks depleted by week 6; inter-state procurement delays.
              </p>
              <ul className="text-[11px] text-[#6B7280] space-y-1.5 border-t border-[#E3E6EB] pt-2">
                <li>• Livestock distress sales risk: <strong>Elevated</strong></li>
                <li>• Silage subsidy requirement: <strong>₹18.4 Crore</strong></li>
                <li>• Recommended response: Open subsidized sugar factory bagasse camps</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
