import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  solveReliefAllocation,
  DEFAULT_DISTRICT_DEMANDS,
  UNIT_COSTS
} from '../services/optimizerEngine';
import { OptimizationParams } from '../types';
import {
  Calculator,
  ShieldCheck,
  Download,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Droplets,
  Sprout,
  Users,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

import { commitAllocationRequisition } from '../services/api';

export const BudgetOptimizerView: React.FC = () => {
  const {
    budget,
    setBudget,
    showToast,
    setCurrentModule
  } = useApp();

  // Optimization Parameters State
  const [maxTankersPerDay, setMaxTankersPerDay] = useState<number>(1850);
  const [availableFodderTonnes, setAvailableFodderTonnes] = useState<number>(85000);
  const [contingencyFundCr, setContingencyFundCr] = useState<number>(30);
  const [planningHorizonDays, setPlanningHorizonDays] = useState<15 | 30 | 60>(30);
  const [minServiceFloorPct, setMinServiceFloorPct] = useState<number>(18);

  const [drinkingWaterWeight, setDrinkingWaterWeight] = useState<number>(1.5);
  const [fodderSecurityWeight, setFodderSecurityWeight] = useState<number>(1.2);
  const [cropProtectionWeight, setCropProtectionWeight] = useState<number>(1.0);
  const [smallholderEquityWeight, setSmallholderEquityWeight] = useState<number>(1.2);

  const [objective, setObjective] = useState<'max_demand_reduction' | 'equitable_distribution' | 'critical_needs_first'>('max_demand_reduction');

  const [isCommitModalOpen, setIsCommitModalOpen] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [committedRequisitionId, setCommittedRequisitionId] = useState<string | null>(null);
  const [filterDivision, setFilterDivision] = useState<string>('all');

  // Build params
  const optimizationParams: OptimizationParams = useMemo(() => ({
    totalBudgetCr: budget,
    maxTankersPerDay,
    availableFodderTonnes,
    contingencyFundCr,
    planningHorizonDays,
    minServiceFloorPct,
    priorityWeights: {
      drinkingWater: drinkingWaterWeight,
      fodderSecurity: fodderSecurityWeight,
      cropProtection: cropProtectionWeight,
      smallholderEquity: smallholderEquityWeight
    },
    objective
  }), [
    budget,
    maxTankersPerDay,
    availableFodderTonnes,
    contingencyFundCr,
    planningHorizonDays,
    minServiceFloorPct,
    drinkingWaterWeight,
    fodderSecurityWeight,
    cropProtectionWeight,
    smallholderEquityWeight,
    objective
  ]);

  // Execute deterministic solver
  const result = useMemo(() => solveReliefAllocation(optimizationParams, DEFAULT_DISTRICT_DEMANDS), [optimizationParams]);

  const handleRelaxConstraint = (action: string) => {
    if (action.includes('floor')) {
      setMinServiceFloorPct(10);
      showToast('Constraint Relaxed', 'Minimum service floor lowered to 10% to restore primal feasibility.', 'primary');
    } else if (action.includes('budget')) {
      setBudget(Math.max(budget + 25, 95));
      showToast('Budget Expanded', 'Budget scaled up to satisfy statutory floor requirements.', 'primary');
    } else if (action.includes('fleet')) {
      setMaxTankersPerDay(maxTankersPerDay + 300);
      showToast('Fleet Requisitioned', 'Added 300 private contracted tankers to regional capacity.', 'primary');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'District',
      'Vulnerability Weight',
      'Tanker Trips',
      'Water Demand Met %',
      'Fodder MT',
      'Fodder Met %',
      'Seed Contingency Ha',
      'Total District Cost (Cr)',
      'Primary Binding Constraint'
    ];
    const rows = result.districtAllocations.map(d => [
      d.districtName,
      d.riskScore,
      d.tankerTrips,
      d.tankerSatisfactionPct,
      d.fodderTonnes,
      d.fodderSatisfactionPct,
      d.cropSubsidyHectares,
      d.totalDistrictCostCr,
      d.bindingConstraintsForDistrict.join('; ') || 'Partial fulfillment'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Madhya_Pradesh_Relief_Allocation_Plan_${result.timestamp.replace(/[: ]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Allocation Ledger Exported', 'Downloaded complete multi-district allocation dataset as CSV.', 'primary');
  };

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      const res = await commitAllocationRequisition({
        total_budget_cr: result.totalCostCr,
        objective,
        notes: `${planningHorizonDays}-Day Planning Horizon with min service floor ${minServiceFloorPct}%`,
        district_allocations: result.districtAllocations
      });
      setCommittedRequisitionId(res.requisition_id);
      setIsCommitModalOpen(false);
      showToast(
        `Requisition Authorized: ${res.requisition_id}`,
        `Disbursement ledger for ₹${result.totalCostCr} Cr committed to Department of Relief & Rehabilitation database.`,
        'primary'
      );
    } catch (err: any) {
      showToast('Commit Error', err.message || 'Failed to submit requisition.', 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              Explainable Resource Allocation Optimizer
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF4FA] text-[#0F4C81] border border-[#BCD4EC]">
              Deterministic Solver Active
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Mixed-Integer Primal-Dual linear program maximizing risk-weighted distress reduction under strict physical, logistical, and statutory constraints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E3E6EB] text-xs font-medium text-[#4B5563] hover:text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Export CSV Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCommitModalOpen(true)}
            disabled={!result.success}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] disabled:opacity-50 shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Commit Requisition</span>
          </button>
        </div>
      </div>

      {/* Persisted Requisition Alert Banner */}
      {committedRequisitionId && (
        <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg text-xs text-[#2E7D32] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span>Official Treasury Requisition Persisted: <strong className="font-mono">{committedRequisitionId}</strong> for ₹{result.totalCostCr} Cr</span>
          </div>
          <span className="text-[10px] font-bold bg-white text-[#2E7D32] px-2 py-0.5 rounded border border-[#C8E6C9] font-mono">STATUS: COMMITTED TO DB</span>
        </div>
      )}

      {/* Infeasibility Alert / Relaxation Callout if constraints conflict */}
      {!result.success && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4 text-xs text-[#991B1B]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-sm text-[#991B1B]">
                Optimization Infeasible: Constraints Are Mutually Incompatible
              </h3>
              <p className="text-[#991B1B]/90 leading-relaxed">
                {result.infeasibilityReason}
              </p>
              <div className="pt-2 border-t border-[#FCA5A5]/60 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[11px] text-[#991B1B]">1-Click Relaxation Options:</span>
                {result.relaxationOptions?.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRelaxConstraint(opt.action)}
                    className="px-2.5 py-1 bg-white border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEE2E2] font-semibold rounded text-[11px] transition-colors"
                  >
                    ⚡ {opt.action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel: Knobs, Horizon, Floor, Weights */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4 gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0F4C81]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Mathematical Model Constraints & Weights
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span>Solver: Deterministic Bounded LP</span>
            <span>•</span>
            <span>Status: <strong className={result.success ? 'text-[#166534]' : 'text-[#DC2626]'}>{result.success ? 'Optimal Solution Found' : 'Infeasible Constraints'}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Knob 1: Total Budget */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4B5563] font-medium">Relief Budget (₹ Cr)</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">₹{budget} Cr</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
              step="5"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>Min: ₹30 Cr</span>
              <span>Max: ₹250 Cr</span>
            </div>
          </div>

          {/* Knob 2: Tanker Fleet Capacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4B5563] font-medium">Tanker Fleet (Per Day)</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{maxTankersPerDay} Tankers</span>
            </div>
            <input
              type="range"
              min="800"
              max="3500"
              step="50"
              value={maxTankersPerDay}
              onChange={e => setMaxTankersPerDay(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>800 Tankers</span>
              <span>3,500 Tankers</span>
            </div>
          </div>

          {/* Knob 3: Available Fodder Stocks */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4B5563] font-medium">State Fodder Reserves</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{availableFodderTonnes.toLocaleString()} MT</span>
            </div>
            <input
              type="range"
              min="30000"
              max="150000"
              step="5000"
              value={availableFodderTonnes}
              onChange={e => setAvailableFodderTonnes(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>30,000 MT</span>
              <span>150,000 MT</span>
            </div>
          </div>

          {/* Knob 4: Statutory Minimum Floor */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#4B5563] font-medium">Statutory Service Floor</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{minServiceFloorPct}% Min Demand</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={minServiceFloorPct}
              onChange={e => setMinServiceFloorPct(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF]">
              <span>5% Floor</span>
              <span>30% Floor</span>
            </div>
          </div>
        </div>

        {/* Priority Weights & Planning Horizon Strip */}
        <div className="mt-5 pt-4 border-t border-[#E3E6EB] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
              Planning Horizon
            </label>
            <div className="flex bg-[#F9FAF8] p-0.5 rounded border border-[#E3E6EB]">
              {([15, 30, 60] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setPlanningHorizonDays(days)}
                  className={`flex-1 py-1 text-center font-medium rounded transition-colors ${
                    planningHorizonDays === days
                      ? 'bg-[#0F4C81] text-white shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
              Objective Function
            </label>
            <select
              value={objective}
              onChange={e => setObjective(e.target.value as any)}
              className="w-full bg-[#F9FAF8] border border-[#E3E6EB] rounded px-2.5 py-1.5 font-semibold text-[#111827] cursor-pointer"
            >
              <option value="max_demand_reduction">Maximize Unmet Demand Reduction</option>
              <option value="equitable_distribution">Equitable Geographic Floor</option>
              <option value="critical_needs_first">Essential Life-Support First</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
              Drinking Water Weight ({drinkingWaterWeight.toFixed(1)}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={drinkingWaterWeight}
              onChange={e => setDrinkingWaterWeight(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
              Smallholder Equity Weight ({smallholderEquityWeight.toFixed(1)}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={smallholderEquityWeight}
              onChange={e => setSmallholderEquityWeight(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards: Output Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-medium text-[#6B7280] block">Allocated Expenditure</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-[#111827] tabular-nums">
              ₹{result.totalCostCr}
            </span>
            <span className="text-xs text-[#6B7280]">Cr</span>
          </div>
          <span className="text-[10px] text-[#059669] font-medium block mt-1">
            {result.budgetUtilizationPct}% of ₹{budget} Cr limit
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-medium text-[#6B7280] block">Demand Satisfied</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-[#0F4C81] tabular-nums">
              {result.overallDemandServedPct}%
            </span>
          </div>
          <span className="text-[10px] text-[#6B7280] block mt-1">
            Unmet demand: {100 - result.overallDemandServedPct}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-medium text-[#6B7280] block">Tanker Trips Dispatched</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-[#111827] tabular-nums">
              {result.tankersUtilized.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-[#6B7280] block mt-1">
            {Math.round((result.tankersUtilized / (result.tankerFleetCapacity || 1)) * 100)}% fleet utilized
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="text-[11px] font-medium text-[#6B7280] block">Cattle Fodder Delivered</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-[#111827] tabular-nums">
              {result.fodderUtilizedTonnes.toLocaleString()}
            </span>
            <span className="text-xs text-[#6B7280]">MT</span>
          </div>
          <span className="text-[10px] text-[#6B7280] block mt-1">
            ~{result.livestockProtectedLakh} Lakh livestock
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-[#6B7280] block">Estimated Hydration Reach</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-[#0F4C81] tabular-nums">
              ~{result.peopleProtectedLakh}
            </span>
            <span className="text-xs text-[#6B7280]">Lakh</span>
          </div>
          <span className="text-[10px] text-[#6B7280] block mt-1">
            Rural population covered
          </span>
        </div>
      </div>

      {/* Binding Constraints & Mathematical Explanation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB] mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F4C81]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                Active Binding Constraints & Shadow Prices
              </h3>
            </div>
            <span className="text-xs text-[#6B7280]">Dual LP Variables</span>
          </div>

          <div className="space-y-3">
            {result.bindingConstraints.map((bc, idx) => (
              <div key={idx} className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB] text-xs">
                <div className="flex items-center justify-between font-semibold text-[#111827] mb-1">
                  <span>{bc.constraint}</span>
                  <span className="text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded">
                    Utilization: {bc.utilization}
                  </span>
                </div>
                <p className="text-[#4B5563] text-[11px] mb-2">{bc.description}</p>
                <div className="flex justify-between text-[10px] text-[#6B7280] border-t border-[#E3E6EB] pt-1.5">
                  <span>Capacity: {bc.capacity}</span>
                  <span className="font-semibold text-[#0F4C81]">Shadow Price: {bc.shadowPriceEstimated}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3E6EB] text-xs text-[#4B5563]">
            <strong className="text-[#111827] block mb-1">Deterministic Optimization Rationale:</strong>
            <p className="leading-relaxed">{result.explanation}</p>
          </div>
        </div>

        {/* Sensitivity & Scenario Lab Link */}
        <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-3">
              Sensitivity & Assumption Notes
            </h3>
            <ul className="space-y-2.5 text-xs text-[#4B5563]">
              {result.sensitivityNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C81] mt-1.5 shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#E3E6EB] mt-4">
            <button
              type="button"
              onClick={() => setCurrentModule('scenario-lab')}
              className="w-full py-2 px-3 bg-[#EEF4FA] hover:bg-[#E5EFE9] text-[#0F4C81] text-xs font-semibold rounded border border-[#BCD4EC] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Compare in AI Scenario Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* District Allocation Results Table */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              Optimized District Interventions Ledger
            </h3>
            <p className="text-xs text-[#6B7280]">
              Quantities allocated by deterministic solver subject to statutory floors and physical bounds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs font-medium text-[#4B5563] bg-[#F9FAF8] border border-[#E3E6EB] rounded hover:text-[#111827]"
            >
              Export Spreadsheet
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#4B5563] border-b border-[#E3E6EB]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">District</th>
                <th className="py-2.5 px-3 font-semibold">Risk Weight</th>
                <th className="py-2.5 px-3 font-semibold">Tanker Trips</th>
                <th className="py-2.5 px-3 font-semibold">Water Satisfied</th>
                <th className="py-2.5 px-3 font-semibold">Fodder (MT)</th>
                <th className="py-2.5 px-3 font-semibold">Fodder Satisfied</th>
                <th className="py-2.5 px-3 font-semibold">Seed Subsidy (Ha)</th>
                <th className="py-2.5 px-3 font-semibold">Direct Beneficiaries</th>
                <th className="py-2.5 px-3 font-semibold">Total Cost (Cr)</th>
                <th className="py-2.5 px-3 font-semibold">Saturation Constraint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {result.districtAllocations.map(d => (
                <tr key={d.districtId} className="hover:bg-[#F9FAFB]">
                  <td className="py-2.5 px-3 font-bold text-[#111827]">{d.districtName}</td>
                  <td className="py-2.5 px-3 tabular-nums font-semibold text-[#0F4C81]">
                    {d.riskScore.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">{d.tankerTrips.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      d.tankerSatisfactionPct >= 70 ? 'bg-[#DCFCE7] text-[#166534]' :
                      d.tankerSatisfactionPct >= 40 ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {d.tankerSatisfactionPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">{d.fodderTonnes.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      d.fodderSatisfactionPct >= 70 ? 'bg-[#DCFCE7] text-[#166534]' :
                      d.fodderSatisfactionPct >= 40 ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {d.fodderSatisfactionPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">{d.cropSubsidyHectares.toLocaleString()} Ha</td>
                  <td className="py-2.5 px-3 tabular-nums">{d.directGrantBeneficiaries.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-[#111827] tabular-nums">
                    ₹{d.totalDistrictCostCr} Cr
                  </td>
                  <td className="py-2.5 px-3">
                    {d.bindingConstraintsForDistrict.length > 0 ? (
                      <span className="text-[10px] text-[#059669] font-medium">
                        {d.bindingConstraintsForDistrict[0]}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#6B7280]">Partial fulfillment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB] text-[11px] text-[#6B7280] flex items-center justify-between">
          <span>Cost coefficients: ₹2,400/tanker trip; ₹16,500/MT fodder; ₹3,200/Ha seed voucher; ₹4,000/direct cash grant</span>
          <span>Deterministic Solver: Guaranteed Primal Optimal under Bounded Knapsack Theorem</span>
        </div>
      </div>

      {/* Treasury Authorization Modal */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E3E6EB] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E3E6EB] mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EEF4FA] text-[#0F4C81] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Authorize State Relief Allocation
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Official approval for treasury disbursement
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#4B5563] mb-5">
              <p>
                You are authorizing the requisition of <strong>₹{result.totalCostCr} Crore</strong> across {result.districtAllocations.length} districts for the <strong>{planningHorizonDays}-Day Planning Horizon</strong>.
              </p>
              <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB] space-y-1">
                <div className="flex justify-between">
                  <span>Drinking Water Tanker Trips:</span>
                  <strong className="text-[#111827]">{result.tankersUtilized.toLocaleString()} trips</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cattle Fodder Procurement:</span>
                  <strong className="text-[#111827]">{result.fodderUtilizedTonnes.toLocaleString()} MT</strong>
                </div>
                <div className="flex justify-between">
                  <span>Overall Distress Coverage:</span>
                  <strong className="text-[#0F4C81]">{result.overallDemandServedPct}% demand met</strong>
                </div>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                This ledger will be transmitted to the Department of Relief & Rehabilitation with cryptographic audit fingerprint for transparency.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E3E6EB]">
              <button
                type="button"
                onClick={() => setIsCommitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] rounded-md border border-[#E3E6EB] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCommitting}
                onClick={handleCommit}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0A3963] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
              >
                {isCommitting ? 'Committing to Database...' : 'Confirm & Disburse Ledger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
