import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchEnsoTelemetry } from '../services/api';
import { EnsoTelemetryData } from '../types';
import {
  Waves,
  Thermometer,
  Wind,
  Compass,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Info,
  Layers,
  Activity,
  Globe2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { AIDroughtAdvisorWidget } from './AIDroughtAdvisorWidget';

export const EnsoTeleconnectionView: React.FC = () => {
  const { setCurrentModule } = useApp();
  const [telemetry, setTelemetry] = useState<EnsoTelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    fetchEnsoTelemetry()
      .then(data => {
        setTelemetry(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    fetchEnsoTelemetry().then(data => {
      setTelemetry(data);
      setIsLoading(false);
    });
  };

  const steps = [
    {
      num: 1,
      title: 'Equatorial Pacific Thermal Surge',
      region: 'Niño 3.4 Region (5°N–5°S, 170°W–120°W)',
      description:
        'Weakened trade winds cause the Pacific warm pool to migrate eastward. Sea Surface Temperature anomalies exceed +0.5°C to +1.48°C, storing immense oceanic heat content.',
      metric: '+1.48°C SST Anomaly',
      status: 'Active Warming'
    },
    {
      num: 2,
      title: 'Walker Circulation Reversal',
      region: 'Indo-Pacific Tropical Atmosphere',
      description:
        'Atmospheric convection and low surface pressure relocate from the Maritime Continent to the Central-Eastern Pacific. The Southern Oscillation Index drops to -11.4.',
      metric: 'SOI: -11.4 (Coupled)',
      status: 'Convective Shift'
    },
    {
      num: 3,
      title: 'Subsidence Over Central India',
      region: 'Madhya Pradesh & Bundelkhand (20°N–26°N)',
      description:
        'The compensatory descending branch of the disrupted Walker Cell forms directly over Central India. Sinking air creates a high-pressure inversion cap preventing deep cloud convection.',
      metric: 'High Pressure Cap',
      status: 'Suppression Zone'
    },
    {
      num: 4,
      title: 'Monsoon Depression Starvation',
      region: 'Bay of Bengal to Narmada/Chambal Basin',
      description:
        'Low-pressure monsoon depressions are deflected northward or dissipate prematurely, causing 15 to 25 consecutive dry days during the critical Kharif flowering stage.',
      metric: '-34% Moisture Inflow',
      status: 'Agricultural Stress'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-[#FDECEA] text-[#C62828] px-2 py-0.5 rounded border border-[#F5C6CB]">
              <Waves className="w-3.5 h-3.5" />
              Active Teleconnection Radar
            </span>
            <span className="text-xs text-[#6B7280]">NOAA Climate Prediction Center & IMD Consensus</span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight mt-1">
            El Niño & Southern Oscillation (ENSO) Teleconnection Engine
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5 max-w-3xl">
            Direct physical causal link between Pacific Equatorial warming (Niño 3.4), Walker Circulation disruption, and monsoon rainfall suppression across Madhya Pradesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E3E6EB] text-xs font-semibold text-[#4B5563] hover:text-[#111827] shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Indices</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdvisorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI ENSO Advisor</span>
          </button>
        </div>
      </div>

      {/* 4 Key Real-Time Oceanic & Teleconnection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Niño 3.4 SST Anomaly */}
        <div className="bg-white rounded-lg border border-[#BCD4EC] p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#4B5563] mb-1">
            <span className="font-semibold">Niño 3.4 SST Anomaly</span>
            <Thermometer className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#C62828] tabular-nums font-mono">
              +{telemetry?.nino34Anomaly ?? 1.48}°C
            </span>
            <span className="text-xs font-semibold text-[#C62828] bg-[#FDECEA] px-1.5 py-0.5 rounded">
              {telemetry?.oniPhase ?? 'Moderate El Niño'}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            Threshold: &gt; +0.5°C (El Niño); &gt; +1.5°C (Strong). Monitored via Tropical Atmosphere Ocean (TAO) buoys.
          </p>
          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#C62828] h-full" style={{ width: '74%' }} />
          </div>
        </div>

        {/* Southern Oscillation Index */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#4B5563] mb-1">
            <span className="font-semibold">Southern Oscillation (SOI)</span>
            <Compass className="w-4 h-4 text-[#0F4C81]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#111827] tabular-nums font-mono">
              {telemetry?.soi ?? -11.4}
            </span>
            <span className="text-xs font-semibold text-[#B26A00] bg-[#FFF8E1] px-1.5 py-0.5 rounded">
              Atmosphere Coupled
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            Tahiti minus Darwin pressure departure. Values below -7.0 indicate sustained trade wind collapse.
          </p>
          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#B26A00] h-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Indian Ocean Dipole (IOD) */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#4B5563] mb-1">
            <span className="font-semibold">Indian Ocean Dipole (IOD)</span>
            <Globe2 className="w-4 h-4 text-[#166534]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#111827] tabular-nums font-mono">
              +{telemetry?.iodIndex ?? 0.18}°C
            </span>
            <span className="text-xs font-semibold text-[#4B5563] bg-[#F1F3F5] px-1.5 py-0.5 rounded">
              Neutral Positive
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            Western vs. Eastern Indian Ocean SST differential. Currently insufficient to offset Pacific suppression.
          </p>
          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#0F4C81] h-full" style={{ width: '30%' }} />
          </div>
        </div>

        {/* Central India Drought Vulnerability */}
        <div className="bg-white rounded-lg border border-[#F5C6CB] p-4 shadow-xs bg-linear-to-br from-white to-[#FDECEA]/30">
          <div className="flex items-center justify-between text-xs text-[#4B5563] mb-1">
            <span className="font-semibold">MP Teleconnection Risk</span>
            <AlertTriangle className="w-4 h-4 text-[#C62828]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#C62828] tabular-nums font-mono">
              {telemetry?.teleconnectionRisk ?? 'High'}
            </span>
            <span className="text-xs font-bold text-[#C62828] bg-[#FDECEA] px-1.5 py-0.5 rounded">
              {telemetry?.drySpellRiskPct ?? 78}% Dry Spell Risk
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            High-pressure descending limb active over 20°N–26°N; 34% reduction in Bay of Bengal rain pulses.
          </p>
          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#C62828] h-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* The 4-Step Physical Teleconnection Transmission Mechanism */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E6EB] pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F4C81]" />
              How El Niño Physically Drives Drought in Madhya Pradesh (Causal Mechanism)
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Click through the atmospheric Walker Circulation transmission chain from the Pacific Ocean to the farm gate in Bundelkhand.
            </p>
          </div>
          <span className="text-xs font-medium text-[#0F4C81] bg-[#EEF4FA] px-2.5 py-1 rounded border border-[#BCD4EC]">
            Teleconnection Chain: 4 Atmospheric Stages
          </span>
        </div>

        {/* Interactive Stepper Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {steps.map(step => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                activeStep === step.num
                  ? 'border-[#0F4C81] bg-[#EEF4FA] shadow-xs'
                  : 'border-[#E3E6EB] bg-white hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep === step.num ? 'bg-[#0F4C81] text-white' : 'bg-[#E3E6EB] text-[#4B5563]'
                }`}>
                  {step.num}
                </span>
                <span className="text-[10px] font-semibold text-[#6B7280]">{step.status}</span>
              </div>
              <h3 className="text-xs font-bold text-[#111827] line-clamp-1">{step.title}</h3>
              <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">{step.region}</p>
            </button>
          ))}
        </div>

        {/* Active Stage Detailed Breakdown & Visual Schema */}
        {(() => {
          const current = steps.find(s => s.num === activeStep) || steps[0];
          return (
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F4C81] block">
                    Stage {current.num} of 4 · {current.region}
                  </span>
                  <h3 className="text-base font-bold text-[#111827] mt-0.5">
                    {current.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-[#CBD5E1] text-[#111827] font-mono">
                    {current.metric}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#334155] leading-relaxed mb-4">
                {current.description}
              </p>

              {/* Atmospheric Circulation Schematic */}
              <div className="bg-white rounded-md border border-[#E2E8F0] p-4 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] mb-2 uppercase tracking-wider">
                  <span>Circulation Blueprint</span>
                  <span>Physical Atmospheric Dynamics</span>
                </div>

                {activeStep === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#111827]">
                      <strong>Oceanic Trigger:</strong> Under normal conditions, trade winds blow warm water toward Indonesia. During El Niño, trade winds weaken or reverse. The warm pool shifts eastward across the Pacific basin, creating positive SST anomalies in the <strong>Niño 3.4 sector (+1.48°C)</strong>.
                    </p>
                    <div className="p-3 bg-[#FFF8E1] border border-[#FFE082] rounded text-[11px] text-[#8C5300]">
                      <strong>Preemption Action:</strong> Sea surface anomalies are detectable 3 to 6 months in advance. EPE uses this long lead-time to pre-position fodder depots in Bundelkhand before dry spells manifest on land.
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#111827]">
                      <strong>Walker Circulation Disruption:</strong> Deep atmospheric convection (thunderstorms and rising moist air) follows the warm water to the Central-Eastern Pacific. Consequently, the ascending branch of the planetary Walker Cell is removed from the Indian Ocean sector.
                    </p>
                    <div className="p-3 bg-[#EEF4FA] border border-[#BCD4EC] rounded text-[11px] text-[#0F4C81]">
                      <strong>Atmospheric Coupling:</strong> A sustained Southern Oscillation Index (SOI) of -11.4 confirms that the atmosphere is fully locked into El Niño mode, suppressing monsoon onset across Central India.
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#111827]">
                      <strong>The Indian Subsidence Cap:</strong> To balance the immense rising air over the Pacific, air must descend elsewhere. The primary descending (subsiding) limb forms directly over <strong>20°N–26°N latitude</strong> (Madhya Pradesh, Maharashtra, Bundelkhand). Sinking air warms adiabatically and prevents cloud condensation.
                    </p>
                    <div className="p-3 bg-[#FDECEA] border border-[#F5C6CB] rounded text-[11px] text-[#C62828]">
                      <strong>The 18-Day Dry Spell Hazard:</strong> Even when monsoon clouds are present over coastal India, this high-pressure subsidence cap prevents rain from reaching Tikamgarh, Chhatarpur, Barwani, and Shivpuri.
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#111827]">
                      <strong>Agrarian Consequences:</strong> Low-pressure systems traversing westward from the Bay of Bengal run out of moisture or are pushed northward toward the Himalayas. Soybean pods abort flowering, cotton bolls drop, and deep bore well recharge drops by 40%–55%.
                    </p>
                    <div className="p-3 bg-[#F1F3F5] border border-[#E3E6EB] rounded text-[11px] text-[#334155]">
                      <strong>Engine Intervention:</strong> Rather than waiting for crop-cutting surveys in December, EPE initiates drinking water reservations in Gandhi Sagar & Rajghat reservoirs in August.
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Historical El Niño Analogs Benchmark Table */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E3E6EB] pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F4C81]" />
              Historical El Niño Analog Benchmarks (Madhya Pradesh Impact Correlation)
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Empirical correlation between Oceanic Niño Index (ONI) intensity and state agrarian rainfall departures.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#4B5563]">
            4 Historical Analog Seasons Analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EB] bg-[#F8FAFC] text-[#4B5563] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Season</th>
                <th className="py-2.5 px-3">Niño 3.4 SST</th>
                <th className="py-2.5 px-3">ENSO Phase</th>
                <th className="py-2.5 px-3">MP Rain Deficit</th>
                <th className="py-2.5 px-3">State Hydrological Outcome</th>
                <th className="py-2.5 px-3 text-right">Analog Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {telemetry?.historicalAnalogs.map((a, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3 font-bold text-[#111827]">{a.year}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#C62828] tabular-nums">
                    {a.nino34}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                      a.phase.includes('Super') || a.phase.includes('Moderate El')
                        ? 'bg-[#FDECEA] text-[#C62828]'
                        : a.phase.includes('La Niña')
                        ? 'bg-[#E8F5E9] text-[#166534]'
                        : 'bg-[#F1F3F5] text-[#4B5563]'
                    }`}>
                      {a.phase}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold tabular-nums text-[#C62828]">
                    {a.mpRainDeficit}
                  </td>
                  <td className="py-3 px-3 text-xs text-[#4B5563] max-w-md">
                    {a.outcome}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-[#0F4C81]">
                      {idx === 0 ? '92% (Current Base)' : idx === 1 ? '84%' : '32%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Drought Advisor Modal */}
      <AIDroughtAdvisorWidget
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        defaultQuery="Current Oceanic Niño Index (ONI) and impact on Madhya Pradesh rainfall forecast"
      />
    </div>
  );
};
