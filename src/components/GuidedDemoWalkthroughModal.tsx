import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OperationalModule } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Play,
  Truck,
  FileText,
  X,
  ShieldCheck,
  Compass,
  Database
} from 'lucide-react';

interface GuidedDemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedDemoWalkthroughModal: React.FC<GuidedDemoWalkthroughModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    setCurrentModule,
    setBudget,
    setOptimizationObjective,
    setPriorityWeighting,
    showToast,
    fetchLiveSatelliteWeatherData
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '1. Detect Hydrological Anomaly (Early Warning)',
      badge: 'Satellite Earth Observation',
      description:
        'ISRO SAC VEDAS and Open-Meteo telemetry identify severe early-season soil moisture depletion (-58.4% rainfall departure) across Bundelkhand districts (Tikamgarh, Chhatarpur, Panna).',
      targetModule: 'overview' as OperationalModule,
      actionLabel: 'Inspect District Threat Matrix',
      actionHelp: 'Redirects to Overview Map with active drought anomaly layers.',
      highlightMetric: 'Critical deficit detected in 14 talukas',
      onExecute: () => {
        setCurrentModule('overview');
        showToast(
          'Step 1: Anomaly Focus Active',
          'Examining Bundelkhand rainfall & soil moisture deficit indicators on GIS map.',
          'primary'
        );
      }
    },
    {
      step: 2,
      title: '2. Formulate Relief Constraints (Scenario Planning)',
      badge: 'Policy & Treasury Modeling',
      description:
        'Revenue & Disaster Relief officers specify physical depot constraints: ₹140 Cr budget ceiling, 1,850 tanker trips/day, and an 18% statutory service floor to prevent regional starvation.',
      targetModule: 'relief-budget-optimizer' as OperationalModule,
      actionLabel: 'Load Preemption Constraints',
      actionHelp: 'Applies ₹140 Cr contingency ceiling and critical water weighting.',
      highlightMetric: '₹140.0 Cr authorized across 3 relief commodities',
      onExecute: () => {
        setBudget(140);
        setOptimizationObjective('critical_needs_first');
        setPriorityWeighting(75);
        setCurrentModule('relief-budget-optimizer');
        showToast(
          'Step 2: Constraints Applied',
          'Configured ₹140 Cr budget ceiling with Priority 1 Drinking Water weighting.',
          'primary'
        );
      }
    },
    {
      step: 3,
      title: '3. Algorithmic Preemption Run (Deterministic Solver)',
      badge: 'FastAPI & Supabase Invariants',
      description:
        'The pure deterministic allocation solver matches local demands to physical depot stock, enforcing non-negative limits and recording mathematical reconciliation: Allocated (89.4%) + Unmet (10.6%) = Demand.',
      targetModule: 'scenario-lab' as OperationalModule,
      actionLabel: 'Execute Deterministic Solver',
      actionHelp: 'Opens Scenario Lab & Backend Allocation Hub to view decision rationale.',
      highlightMetric: 'Zero black-box AI — 100% auditable linear solver',
      onExecute: () => {
        setCurrentModule('scenario-lab');
        showToast(
          'Step 3: Allocation Engine Active',
          'Executing linear priority solver against depot inventories.',
          'primary'
        );
      }
    },
    {
      step: 4,
      title: '4. Emergency Dispatch & Official Cabinet Order (Action)',
      badge: 'Logistics & Executive Order',
      description:
        'Authorize immediate green-corridor tanker convoys with FASTag disaster toll exemptions and generate the formal Madhya Pradesh Cabinet Scarcity Relief Memorandum.',
      targetModule: 'reports-and-analytics' as OperationalModule,
      actionLabel: 'Generate Official Cabinet Memo',
      actionHelp: 'Opens printable Government of Madhya Pradesh official order dossier.',
      highlightMetric: '38 Convoys dispatched; Official Order ready to print',
      onExecute: () => {
        setCurrentModule('reports-and-analytics');
        showToast(
          'Step 4: Cabinet Order Ready',
          'Generated official relief order memorandum with executive stamps and signatures.',
          'primary'
        );
      }
    }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleNext = () => {
    currentStepData.onExecute();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = steps[currentStep - 2];
      prevStep.onExecute();
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-[#BCD4EC] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-[#0F4C81] to-[#165B97] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  EPE Hackathon Evaluation Tour
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  2-Minute Pitch Drill
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Four sequential steps demonstrating anticipatory relief preemption over status-quo disaster response.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close walkthrough modal"
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 p-3 bg-[#F8FAFC] border-b border-[#E3E6EB] gap-2 text-center text-xs">
          {steps.map(s => {
            const isDone = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            return (
              <button
                key={s.step}
                onClick={() => {
                  s.onExecute();
                  setCurrentStep(s.step);
                }}
                className={`py-1.5 px-2 rounded-md font-bold transition-all text-[11px] cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0F4C81] text-white shadow-xs'
                    : isDone
                    ? 'bg-[#DCFCE7] text-[#166534]'
                    : 'bg-white border border-[#E3E6EB] text-[#6B7280] hover:bg-[#F1F3F5]'
                }`}
              >
                <span>Step {s.step}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 inline ml-1 text-[#16A34A]" />}
              </button>
            );
          })}
        </div>

        {/* Step Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EEF4FA] text-[#0F4C81] border border-[#BCD4EC]">
              {currentStepData.badge}
            </span>
            <span className="text-xs text-[#6B7280] font-medium">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#111827]">
              {currentStepData.title}
            </h4>
            <p className="text-xs text-[#4B5563] mt-1.5 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Highlight Callout Box */}
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span className="font-semibold text-[#166534]">
                {currentStepData.highlightMetric}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#047857]">Verified</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E3E6EB] flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#E3E6EB] bg-white text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                currentStepData.onExecute();
                onClose();
              }}
              className="px-3 py-1.5 rounded-md bg-white border border-[#BCD4EC] text-xs font-bold text-[#0F4C81] hover:bg-[#EEF4FA] cursor-pointer"
            >
              Explore This View
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0F4C81] text-xs font-bold text-white hover:bg-[#0A3963] transition-colors shadow-xs cursor-pointer"
            >
              <span>{currentStep === steps.length ? 'Complete Drill' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
