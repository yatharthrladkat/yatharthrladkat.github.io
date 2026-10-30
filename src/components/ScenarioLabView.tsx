import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  solveReliefAllocation,
  DEFAULT_DISTRICT_DEMANDS
} from '../services/optimizerEngine';
import { OptimizationParams, OptimizationObjective } from '../types';
import {
  GitCompare,
  Sliders,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Droplets,
  Sprout,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { BackendAllocationHub } from './BackendAllocationHub';

export const ScenarioLabView: React.FC = () => {
  const {
    setCurrentModule,
    showToast,
    setBudget,
    setOptimizationObjective,
    setPriorityWeighting
  } = useApp();

  // Interactive baseline parameters
  const [baseBudget, setBaseBudget] = useState<number>(140);
  const [tankerFleet, setTankerFleet] = useState<number>(1800);
  const [fodderReserve, setFodderReserve] = useState<number>(85000);
  const [minFloor, setMinFloor] = useState<number>(15);

  // Scenario 1: Baseline Allocation (Status-Quo Historical / Population share)
  const scenario1Params: OptimizationParams = useMemo(() => ({
    totalBudgetCr: baseBudget,
    maxTankersPerDay: tankerFleet,
    availableFodderTonnes: fodderReserve,
    contingencyFundCr: 20,
    planningHorizonDays: 30,
    minServiceFloorPct: 5, // minimal statutory floor in historical status quo
    priorityWeights: {
      drinkingWater: 1.0,
      fodderSecurity: 0.8,
      cropProtection: 0.5,
      smallholderEquity: 0.5
    },
    objective: 'equitable_distribution'
  }), [baseBudget, tankerFleet, fodderReserve]);

  // Scenario 2: Balanced Intervention Strategy (Risk-weighted composite optimization)
  const scenario2Params: OptimizationParams = useMemo(() => ({
    totalBudgetCr: baseBudget,
    maxTankersPerDay: tankerFleet,
    availableFodderTonnes: fodderReserve,
    contingencyFundCr: 35,
    planningHorizonDays: 30,
    minServiceFloorPct: minFloor,
    priorityWeights: {
      drinkingWater: 1.5,
      fodderSecurity: 1.2,
      cropProtection: 1.0,
      smallholderEquity: 1.2
    },
    objective: 'max_demand_reduction'
  }), [baseBudget, tankerFleet, fodderReserve, minFloor]);

  // Scenario 3: Essential Water & Vulnerable Smallholder Priority Strategy
  const scenario3Params: OptimizationParams = useMemo(() => ({
    totalBudgetCr: baseBudget,
    maxTankersPerDay: Math.round(tankerFleet * 1.15), // fleet reallocated to water
    availableFodderTonnes: fodderReserve,
    contingencyFundCr: 45,
    planningHorizonDays: 30,
    minServiceFloorPct: Math.min(25, minFloor + 5), // high water security floor
    priorityWeights: {
      drinkingWater: 2.2,
      fodderSecurity: 1.0,
      cropProtection: 1.4,
      smallholderEquity: 2.0
    },
    objective: 'critical_needs_first'
  }), [baseBudget, tankerFleet, fodderReserve, minFloor]);

  // Run deterministic optimizer on all 3 scenarios
  const s1Result = useMemo(() => solveReliefAllocation(scenario1Params), [scenario1Params]);
  const s2Result = useMemo(() => solveReliefAllocation(scenario2Params), [scenario2Params]);
  const s3Result = useMemo(() => solveReliefAllocation(scenario3Params), [scenario3Params]);

  const [selectedForDetail, setSelectedForDetail] = useState<'s1' | 's2' | 's3'>('s2');

  const handleApplyToPlan = (
    scenarioName: string,
    budgetVal: number,
    objective: OptimizationObjective = 'farmers',
    waterWeight = 1.0
  ) => {
    setBudget(budgetVal);
    setOptimizationObjective(objective);
    setPriorityWeighting(Math.round(waterWeight * 40));

    showToast(
      `${scenarioName} Applied`,
      `State relief budget updated to ₹${budgetVal} Cr with ${objective.replace('_', ' ')} objective. Redirecting to Resource Optimizer...`,
      'primary'
    );
    setCurrentModule('relief-budget-optimizer');
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              AI Scenario Lab: Strategy Comparison
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF4FA] text-[#0F4C81] border border-[#BCD4EC]">
              Multi-Scenario Evaluation
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Evaluate mathematical trade-offs across 3 policy configurations before treasury authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setBaseBudget(140);
              setTankerFleet(1800);
              setFodderReserve(85000);
              setMinFloor(15);
              showToast('Parameters Reset', 'Reset to baseline state configuration', 'secondary');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E3E6EB] text-xs font-medium text-[#4B5563] hover:text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Real FastAPI & PostgreSQL Allocation Engine Hub */}
      <BackendAllocationHub />

      {/* Global Input Sliders Banner */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#E3E6EB]">
          <SlidersHorizontal className="w-4 h-4 text-[#0F4C81]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
            Active Simulation Input Knobs (Dynamic Recalculation)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7280] font-medium">Relief Budget:</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">₹{baseBudget} Crore</span>
            </div>
            <input
              type="range"
              min="40"
              max="250"
              step="5"
              value={baseBudget}
              onChange={e => setBaseBudget(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
              <span>₹40 Cr</span>
              <span>₹250 Cr</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7280] font-medium">Max Tanker Fleet:</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{tankerFleet} Tankers/Day</span>
            </div>
            <input
              type="range"
              min="800"
              max="3500"
              step="100"
              value={tankerFleet}
              onChange={e => setTankerFleet(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
              <span>800 Fleet</span>
              <span>3,500 Fleet</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7280] font-medium">Fodder Stockpile:</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{fodderReserve.toLocaleString()} MT</span>
            </div>
            <input
              type="range"
              min="30000"
              max="150000"
              step="5000"
              value={fodderReserve}
              onChange={e => setFodderReserve(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
              <span>30k MT</span>
              <span>150k MT</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7280] font-medium">Statutory Floor:</span>
              <span className="font-bold text-[#0F4C81] tabular-nums">{minFloor}% Demand</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={minFloor}
              onChange={e => setMinFloor(Number(e.target.value))}
              className="w-full accent-[#0F4C81] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
              <span>5% Floor</span>
              <span>25% Floor</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Way Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Scenario 1: Baseline */}
        <div className={`bg-white rounded-lg border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between ${
          selectedForDetail === 's1' ? 'border-[#0F4C81] ring-1 ring-[#0F4C81]' : 'border-[#E3E6EB]'
        }`}>
          <div>
            <div className="flex justify-between items-start pb-3 border-b border-[#E3E6EB] mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">
                  Configuration 1
                </span>
                <h3 className="text-base font-bold text-[#111827]">Baseline Status Quo</h3>
                <p className="text-xs text-[#6B7280]">Historical per-capita distribution</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F4F6] text-[#4B5563]">
                Status Quo
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Total Allocated Cost:</span>
                <span className="font-bold text-[#111827] tabular-nums">₹{s1Result.totalCostCr} Cr</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Budget Utilization:</span>
                <span className="font-semibold text-[#111827] tabular-nums">{s1Result.budgetUtilizationPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Overall Demand Served:</span>
                <span className="font-bold text-[#D97706] tabular-nums">{s1Result.overallDemandServedPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">People Protected (Est.):</span>
                <span className="font-semibold text-[#111827] tabular-nums">~{s1Result.peopleProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Livestock Covered:</span>
                <span className="font-semibold text-[#111827] tabular-nums">~{s1Result.livestockProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-[#6B7280]">Primary Bottleneck:</span>
                <span className="font-medium text-[#6B7280] text-[11px] truncate max-w-[150px]">
                  {s1Result.bindingConstraints[0]?.resource || 'Demand Ceiling'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F9FAF8] rounded border border-[#E3E6EB] text-[11px] text-[#4B5563] space-y-1 mb-4">
              <strong>Trade-Off Profile:</strong>
              <p>Leaves high-vulnerability rainfed talukas (Patoda, Tuljapur) under-funded while dispersing aid evenly across low-distress zones.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E3E6EB]">
            <button
              type="button"
              onClick={() => setSelectedForDetail('s1')}
              className={`w-full py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedForDetail === 's1'
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-[#4B5563] border-[#E3E6EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {selectedForDetail === 's1' ? 'Inspecting District Breakdown' : 'Select for Deep Dive'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyToPlan('Baseline Equitable Distribution Strategy', s1Result.totalCostCr, 'equitable_distribution', 1.0)}
              className="w-full py-1.5 text-xs font-semibold rounded bg-[#0F4C81] text-white hover:bg-[#0A3963] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Apply Strategy to Budget Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scenario 2: Balanced Strategy (Recommended) */}
        <div className={`bg-white rounded-lg border-2 p-5 shadow-[0_2px_4px_rgba(16,24,40,0.06)] flex flex-col justify-between ${
          selectedForDetail === 's2' ? 'border-[#0F4C81] ring-2 ring-[#0F4C81]/20' : 'border-[#0F4C81]/50'
        }`}>
          <div>
            <div className="flex justify-between items-start pb-3 border-b border-[#E3E6EB] mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F4C81]">
                  Configuration 2 (Recommended)
                </span>
                <h3 className="text-base font-bold text-[#111827]">Balanced Multi-Intervention</h3>
                <p className="text-xs text-[#6B7280]">Risk-weighted MILP optimization</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF4FA] text-[#0F4C81] border border-[#BCD4EC]">
                Optimal
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Total Allocated Cost:</span>
                <span className="font-bold text-[#111827] tabular-nums">₹{s2Result.totalCostCr} Cr</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Budget Utilization:</span>
                <span className="font-semibold text-[#111827] tabular-nums">{s2Result.budgetUtilizationPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Overall Demand Served:</span>
                <span className="font-bold text-[#0F4C81] tabular-nums">{s2Result.overallDemandServedPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">People Protected (Est.):</span>
                <span className="font-semibold text-[#111827] tabular-nums">~{s2Result.peopleProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Livestock Covered:</span>
                <span className="font-semibold text-[#111827] tabular-nums">~{s2Result.livestockProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-[#6B7280]">Primary Bottleneck:</span>
                <span className="font-medium text-[#0F4C81] text-[11px] truncate max-w-[150px]">
                  {s2Result.bindingConstraints[0]?.resource}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#EEF4FA]/50 rounded border border-[#BCD4EC] text-[11px] text-[#0F4C81] space-y-1 mb-4">
              <strong>Trade-Off Profile:</strong>
              <p>Achieves optimal multi-objective balance: satisfies statutory minimum floors everywhere while routing 74% of surplus aid to Severe drought districts.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E3E6EB]">
            <button
              type="button"
              onClick={() => setSelectedForDetail('s2')}
              className={`w-full py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedForDetail === 's2'
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-[#4B5563] border-[#E3E6EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {selectedForDetail === 's2' ? 'Inspecting District Breakdown' : 'Select for Deep Dive'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyToPlan('Balanced Multi-Intervention Strategy', s2Result.totalCostCr, 'max_demand_reduction', 1.4)}
              className="w-full py-1.5 text-xs font-semibold rounded bg-[#0F4C81] text-white hover:bg-[#0A3963] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Apply Strategy to Budget Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scenario 3: Essential Water Priority */}
        <div className={`bg-white rounded-lg border p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col justify-between ${
          selectedForDetail === 's3' ? 'border-[#0F4C81] ring-1 ring-[#0F4C81]' : 'border-[#E3E6EB]'
        }`}>
          <div>
            <div className="flex justify-between items-start pb-3 border-b border-[#E3E6EB] mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1D4ED8]">
                  Configuration 3
                </span>
                <h3 className="text-base font-bold text-[#111827]">Essential Water & Smallholder</h3>
                <p className="text-xs text-[#6B7280]">Zero-compromise potable drinking supply</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                Water First
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Total Allocated Cost:</span>
                <span className="font-bold text-[#111827] tabular-nums">₹{s3Result.totalCostCr} Cr</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Budget Utilization:</span>
                <span className="font-semibold text-[#111827] tabular-nums">{s3Result.budgetUtilizationPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Overall Demand Served:</span>
                <span className="font-bold text-[#1D4ED8] tabular-nums">{s3Result.overallDemandServedPct}%</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">People Protected (Est.):</span>
                <span className="font-bold text-[#1D4ED8] tabular-nums">~{s3Result.peopleProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-[#F9FAFB]">
                <span className="text-[#6B7280]">Livestock Covered:</span>
                <span className="font-semibold text-[#111827] tabular-nums">~{s3Result.livestockProtectedLakh} Lakh</span>
              </div>
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-[#6B7280]">Primary Bottleneck:</span>
                <span className="font-medium text-[#1D4ED8] text-[11px] truncate max-w-[150px]">
                  {s3Result.bindingConstraints[0]?.resource}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#EFF6FF] rounded border border-[#BFDBFE] text-[11px] text-[#1E40AF] space-y-1 mb-4">
              <strong>Trade-Off Profile:</strong>
              <p>Guarantees maximum hydration security and smallholder cash survival, but reduces long-term fodder reserve stocks by 18%.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E3E6EB]">
            <button
              type="button"
              onClick={() => setSelectedForDetail('s3')}
              className={`w-full py-1.5 text-xs font-semibold rounded border transition-colors ${
                selectedForDetail === 's3'
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-[#4B5563] border-[#E3E6EB] hover:bg-[#F9FAFB]'
              }`}
            >
              {selectedForDetail === 's3' ? 'Inspecting District Breakdown' : 'Select for Deep Dive'}
            </button>
            <button
              type="button"
              onClick={() => handleApplyToPlan('Essential Water & Smallholder Strategy', s3Result.totalCostCr, 'critical_needs_first', 2.2)}
              className="w-full py-1.5 text-xs font-semibold rounded bg-[#0F4C81] text-white hover:bg-[#0A3963] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Apply Strategy to Budget Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Deep-Dive District Comparison Table for Selected Configuration */}
      <div className="bg-white rounded-lg border border-[#E3E6EB] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB] mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              Granular District Allocations: {
                selectedForDetail === 's1' ? 'Configuration 1 (Baseline Status Quo)' :
                selectedForDetail === 's2' ? 'Configuration 2 (Balanced Multi-Intervention)' :
                'Configuration 3 (Essential Water & Smallholder)'
              }
            </h3>
            <p className="text-xs text-[#6B7280]">
              Modeled quantities, expenditure breakdown, and percentage of local demand fulfilled
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0F4C81]">
            Status: {
              (selectedForDetail === 's1' ? s1Result : selectedForDetail === 's2' ? s2Result : s3Result).success ? 'Primal Feasible (Solved)' : 'Infeasible'
            }
          </span>
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
                <th className="py-2.5 px-3 font-semibold">Seed Grants (Ha)</th>
                <th className="py-2.5 px-3 font-semibold">Total Cost (Cr)</th>
                <th className="py-2.5 px-3 font-semibold">Local Saturation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {(selectedForDetail === 's1' ? s1Result : selectedForDetail === 's2' ? s2Result : s3Result).districtAllocations.map(d => (
                <tr key={d.districtId} className="hover:bg-[#F9FAFB]">
                  <td className="py-2.5 px-3 font-bold text-[#111827]">{d.districtName}</td>
                  <td className="py-2.5 px-3 tabular-nums">{d.riskScore.toFixed(2)}</td>
                  <td className="py-2.5 px-3 tabular-nums font-semibold">{d.tankerTrips.toLocaleString()}</td>
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
                  <td className="py-2.5 px-3 font-bold text-[#111827] tabular-nums">₹{d.totalDistrictCostCr} Cr</td>
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

        {/* Scientific & Operational Disclaimer */}
        <div className="mt-4 p-3 bg-[#F9FAF8] rounded-md border border-[#E3E6EB] text-[11px] text-[#6B7280] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
          <p>
            <strong>Decision Support Disclaimer:</strong> Displayed metrics represent modeled mathematical allocations under linear programming assumptions. They illustrate allocation efficiency trade-offs and do not represent verified historical disbursements or real lives saved.
          </p>
        </div>
      </div>
    </div>
  );
};
