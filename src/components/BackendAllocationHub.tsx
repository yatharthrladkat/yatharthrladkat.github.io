import React, { useState, useEffect } from 'react';
import {
  fetchBackendHealth,
  fetchPilotAreas,
  fetchResourceCentres,
  updateDepotStock,
  fetchDemandRecords,
  fetchScenarios,
  createScenario,
  runScenarioAllocation,
  fetchAllocationRuns,
  BackendHealthResponse,
  PilotAreaModel,
  ResourceCentreModel,
  DemandRecordModel,
  ScenarioModel,
  AllocationRunModel
} from '../services/api';
import {
  Database,
  Server,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Plus,
  ArrowRight,
  Layers,
  FileText,
  Building,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { checkSupabaseConnection } from '../services/supabaseClient';

export const BackendAllocationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'depots' | 'audit' | 'health'>('scenarios');
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; url: string; error?: string } | null>(null);
  const [pilotAreas, setPilotAreas] = useState<PilotAreaModel[]>([]);
  const [depots, setDepots] = useState<ResourceCentreModel[]>([]);
  const [demands, setDemands] = useState<DemandRecordModel[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioModel[]>([]);
  const [auditRuns, setAuditRuns] = useState<AllocationRunModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active execution state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [latestRunResult, setLatestRunResult] = useState<AllocationRunModel | null>(null);

  // Stock edit state
  const [editingDepotId, setEditingDepotId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Create scenario modal/form state
  const [isCreateScenarioOpen, setIsCreateScenarioOpen] = useState(false);
  const [newScenName, setNewScenName] = useState('');
  const [newScenStress, setNewScenStress] = useState<'mild' | 'severe' | 'extreme'>('severe');
  const [newScenObjective, setNewScenObjective] = useState<'critical_needs_first' | 'equitable_distribution' | 'max_demand_reduction'>('critical_needs_first');
  const [newScenDesc, setNewScenDesc] = useState('');
  const [newScenProvenance, setNewScenProvenance] = useState('Synthetically calibrated to MP Drought Scarcity Manual');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [h, sb, areas, deps, dems, scens, runs] = await Promise.all([
        fetchBackendHealth().catch(() => null),
        checkSupabaseConnection().catch(() => null),
        fetchPilotAreas().catch(() => []),
        fetchResourceCentres().catch(() => []),
        fetchDemandRecords().catch(() => []),
        fetchScenarios().catch(() => []),
        fetchAllocationRuns().catch(() => [])
      ]);
      setHealth(h);
      setSupabaseStatus(sb);
      setPilotAreas(areas);
      setDepots(deps);
      setDemands(dems);
      setScenarios(scens);
      setAuditRuns(runs);
      if (scens.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(scens[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to communicate with FastAPI backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAllocation = async () => {
    if (!selectedScenarioId) return;
    setIsRunning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const run = await runScenarioAllocation(
        selectedScenarioId,
        resourceFilter || undefined
      );
      setLatestRunResult(run);
      setSuccessMsg(`Allocation run ${run.id} completed successfully using ${run.algorithm_version}.`);
      // Refresh audit runs and stocks
      const [updatedRuns, updatedDeps] = await Promise.all([
        fetchAllocationRuns(),
        fetchResourceCentres()
      ]);
      setAuditRuns(updatedRuns);
      setDepots(updatedDeps);
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error during deterministic allocation pass.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleStockSave = async (depotId: string) => {
    setIsUpdatingStock(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await updateDepotStock(depotId, editStockValue);
      setDepots(prev => prev.map(d => d.id === depotId ? updated : d));
      setEditingDepotId(null);
      setSuccessMsg(`Stock for '${updated.name}' updated to ${updated.available_stock} ${updated.unit}.`);
    } catch (err: any) {
      setErrorMsg(`Validation Error: ${err.message}`);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleCreateScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenName.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const created = await createScenario({
        name: newScenName.trim(),
        description: newScenDesc.trim() || undefined,
        stress_level: newScenStress,
        objective: newScenObjective,
        input_assumptions: {
          created_via: 'React Frontend UI',
          timestamp: new Date().toISOString()
        },
        data_provenance: newScenProvenance.trim()
      });
      setScenarios(prev => [created, ...prev]);
      setSelectedScenarioId(created.id);
      setIsCreateScenarioOpen(false);
      setNewScenName('');
      setNewScenDesc('');
      setSuccessMsg(`Scenario '${created.name}' stored in database successfully.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to store new scenario.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E3E6EB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#0F4C81] flex items-center justify-center text-white shadow-xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-sm font-bold text-[#111827]">
                FastAPI & Supabase Preemption Engine
              </h2>
              {/* Supabase project badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                <Database className="w-3 h-3 text-[#16A34A]" />
                Supabase: gfnuqcpbrniwrfuwiorf.supabase.co
              </span>
              {health?.status === 'healthy' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  DB Engine Connected ({health.database.dialect})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                  <AlertCircle className="w-3 h-3 text-[#D97706]" />
                  Fallback Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280]">
              Deterministic baseline solver, persistent scenario models, and non-negative stock controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E3E6EB] bg-white text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors"
          >
            <span>OpenAPI Docs</span>
            <ExternalLink className="w-3 h-3 text-[#6B7280]" />
          </a>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F4C81] text-xs font-semibold text-white hover:bg-[#0A3963] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E3E6EB] px-4 bg-white text-xs font-semibold text-[#6B7280]">
        {[
          { id: 'scenarios', label: 'Allocation Engine & Scenarios', icon: Play },
          { id: 'depots', label: 'Resource Depots & Stock Limits', icon: Building },
          { id: 'audit', label: 'Audit Run History', icon: Clock },
          { id: 'health', label: 'System & Database Health', icon: ShieldCheck }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#0F4C81] text-[#0F4C81]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="m-4 p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
        </div>
      )}
      {successMsg && (
        <div className="m-4 p-3 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
        </div>
      )}

      {/* Tab 1: Allocation Engine & Scenarios */}
      {activeTab === 'scenarios' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scenario Picker */}
            <div className="md:col-span-1 p-3.5 rounded-lg border border-[#E3E6EB] bg-[#F8FAFC] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                  Select Preemption Scenario
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateScenarioOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F4C81] hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {scenarios.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full text-left p-2.5 rounded-md border text-xs transition-all cursor-pointer ${
                      selectedScenarioId === sc.id
                        ? 'bg-white border-[#0F4C81] shadow-xs'
                        : 'bg-white/60 border-[#E3E6EB] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111827] truncate">{sc.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        sc.stress_level === 'extreme' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        sc.stress_level === 'severe' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#DCFCE7] text-[#166534]'
                      }`}>
                        {sc.stress_level}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6B7280] mt-1 line-clamp-1">
                      Objective: <span className="font-mono text-[#0F4C81]">{sc.objective}</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">
                      Provenance: {sc.data_provenance}
                    </div>
                  </button>
                ))}
              </div>

              {/* Resource Filter */}
              <div className="pt-2 border-t border-[#E3E6EB]">
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  Resource Filter (Optional)
                </label>
                <select
                  value={resourceFilter}
                  onChange={e => setResourceFilter(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-[#E3E6EB] bg-white text-[#111827]"
                >
                  <option value="">All Resources (Water, Fodder, Seeds)</option>
                  <option value="tanker_water">Drinking Water Tankers (trips)</option>
                  <option value="fodder_tonnes">Cattle Fodder (tonnes)</option>
                  <option value="seed_kits">Drought Seed Kits</option>
                </select>
              </div>

              {/* Run Trigger */}
              <button
                type="button"
                onClick={handleRunAllocation}
                disabled={isRunning || !selectedScenarioId}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#0F4C81] text-white text-xs font-bold hover:bg-[#0A3963] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Solving Baseline Allocation...' : 'Run Deterministic Allocation'}</span>
              </button>
            </div>

            {/* Execution Result & Explanation Panel */}
            <div className="md:col-span-2 space-y-4">
              {latestRunResult ? (
                <div className="space-y-3">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E3E6EB] rounded-lg">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Total Demand</div>
                      <div className="text-lg font-bold text-[#111827] mt-0.5 tabular-nums">
                        {latestRunResult.total_demand.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">Registered across districts</div>
                    </div>
                    <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">Total Allocated</div>
                      <div className="text-lg font-bold text-[#16A34A] mt-0.5 tabular-nums">
                        {latestRunResult.total_allocated.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#15803D]">Depot stock conserved</div>
                    </div>
                    <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B]">Unmet Demand</div>
                      <div className="text-lg font-bold text-[#DC2626] mt-0.5 tabular-nums">
                        {latestRunResult.total_unmet.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#B91C1C]">Pending budget augmentation</div>
                    </div>
                  </div>

                  {/* Audit explanation banner */}
                  <div className="p-3 bg-[#EEF4FA] border border-[#C6DCF0] rounded-md text-xs text-[#0F4C81] space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>Algorithm: {latestRunResult.algorithm_version}</span>
                      <span className="text-[10px] font-mono text-[#4B5563]">Run ID: {latestRunResult.id}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#1E3A8A]">
                      {latestRunResult.explanation_summary}
                    </p>
                    <div className="pt-1 text-[10px] font-semibold text-[#047857]">
                      ✓ Mathematical Reconciliation: Allocated ({latestRunResult.total_allocated}) + Unmet ({latestRunResult.total_unmet}) = Demand ({latestRunResult.total_demand})
                    </div>
                  </div>

                  {/* Line Item Decisions Table */}
                  <div className="border border-[#E3E6EB] rounded-lg overflow-x-auto">
                    <div className="p-2.5 bg-[#F9FAFB] border-b border-[#E3E6EB] font-bold text-xs text-[#111827]">
                      Itemized Allocation Decisions ({latestRunResult.items.length} records)
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E3E6EB]">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Pilot Area</th>
                          <th className="py-2 px-3 font-semibold">Resource</th>
                          <th className="py-2 px-3 font-semibold">Demand</th>
                          <th className="py-2 px-3 font-semibold">Allocated</th>
                          <th className="py-2 px-3 font-semibold">Unmet</th>
                          <th className="py-2 px-3 font-semibold">Depot Source</th>
                          <th className="py-2 px-3 font-semibold">Engine Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3E6EB]">
                        {latestRunResult.items.map((it, idx) => (
                          <tr key={it.id || idx} className="hover:bg-[#F9FAFB]">
                            <td className="py-2 px-3 font-bold text-[#111827] capitalize">
                              {it.pilot_area_id}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-[#4B5563]">
                              {it.resource_type}
                            </td>
                            <td className="py-2 px-3 tabular-nums font-medium">{it.demand_quantity}</td>
                            <td className="py-2 px-3 tabular-nums font-bold text-[#16A34A]">{it.allocated_quantity}</td>
                            <td className="py-2 px-3 tabular-nums font-bold text-[#DC2626]">{it.unmet_quantity}</td>
                            <td className="py-2 px-3 text-[11px] text-[#4B5563]">{it.resource_centre_id}</td>
                            <td className="py-2 px-3 text-[11px] text-[#6B7280]">{it.rationale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-[#E3E6EB] rounded-lg text-center space-y-2">
                  <Play className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                  <p className="text-xs font-semibold text-[#4B5563]">
                    Ready to execute baseline deterministic solver.
                  </p>
                  <p className="text-[11px] text-[#6B7280] max-w-sm mx-auto">
                    Select a scenario on the left and click "Run Deterministic Allocation" to execute the Python backend engine and store persistent audit records.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Resource Depots & Stock Limits */}
      {activeTab === 'depots' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Resource Centres & Physical Depot Inventories
              </h3>
              <p className="text-xs text-[#6B7280]">
                Strict server-side validation enforces non-negative stock (available_stock &gt;= 0).
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0F4C81]">
              {depots.length} Active Storage Hubs
            </span>
          </div>

          <div className="border border-[#E3E6EB] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E3E6EB]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Centre Name</th>
                  <th className="py-2.5 px-3 font-semibold">Pilot Area</th>
                  <th className="py-2.5 px-3 font-semibold">Location ID</th>
                  <th className="py-2.5 px-3 font-semibold">Resource Type</th>
                  <th className="py-2.5 px-3 font-semibold">Available Stock</th>
                  <th className="py-2.5 px-3 font-semibold">Data Provenance</th>
                  <th className="py-2.5 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EB]">
                {depots.map(dp => {
                  const isEditing = editingDepotId === dp.id;
                  return (
                    <tr key={dp.id} className="hover:bg-[#F9FAFB]">
                      <td className="py-2.5 px-3 font-bold text-[#111827]">
                        {dp.name}
                      </td>
                      <td className="py-2.5 px-3 capitalize font-semibold text-[#374151]">
                        {dp.pilot_area_id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B7280]">
                        {dp.location_identifier}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#0F4C81]">
                        {dp.resource_type}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="-100"
                              step="1"
                              value={editStockValue}
                              onChange={e => setEditStockValue(parseFloat(e.target.value) || 0)}
                              className="w-24 p-1 border rounded text-xs font-bold bg-white text-[#111827]"
                            />
                            <span className="text-[11px] text-[#6B7280]">{dp.unit}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-[#111827]">
                            {dp.available_stock.toLocaleString()} {dp.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                          Synthetic Demo
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStockSave(dp.id)}
                              disabled={isUpdatingStock}
                              className="px-2 py-1 rounded bg-[#0F4C81] text-white text-[11px] font-bold hover:bg-[#0A3963] cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDepotId(null)}
                              className="px-2 py-1 rounded bg-[#F3F4F6] text-[#4B5563] text-[11px] hover:bg-[#E5E7EB] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDepotId(dp.id);
                              setEditStockValue(dp.available_stock);
                            }}
                            className="text-xs font-semibold text-[#0F4C81] hover:underline cursor-pointer"
                          >
                            Update Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Run History */}
      {activeTab === 'audit' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
              Scenario Run Audit Logs & Algorithmic History
            </h3>
            <span className="text-xs text-[#6B7280]">
              {auditRuns.length} recorded runs stored in PostgreSQL
            </span>
          </div>

          <div className="border border-[#E3E6EB] rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] border-b border-[#E3E6EB]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Run ID</th>
                  <th className="py-2 px-3 font-semibold">Scenario</th>
                  <th className="py-2 px-3 font-semibold">Algorithm Version</th>
                  <th className="py-2 px-3 font-semibold">Demand</th>
                  <th className="py-2 px-3 font-semibold">Allocated</th>
                  <th className="py-2 px-3 font-semibold">Unmet</th>
                  <th className="py-2 px-3 font-semibold">Timestamp (UTC)</th>
                  <th className="py-2 px-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EB]">
                {auditRuns.map(r => (
                  <tr key={r.id} className="hover:bg-[#F9FAFB]">
                    <td className="py-2 px-3 font-mono font-bold text-[#0F4C81]">{r.id}</td>
                    <td className="py-2 px-3 font-medium text-[#111827]">{r.scenario_id}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-[#6B7280]">{r.algorithm_version}</td>
                    <td className="py-2 px-3 tabular-nums font-semibold">{r.total_demand}</td>
                    <td className="py-2 px-3 tabular-nums font-bold text-[#16A34A]">{r.total_allocated}</td>
                    <td className="py-2 px-3 tabular-nums font-bold text-[#DC2626]">{r.total_unmet}</td>
                    <td className="py-2 px-3 text-[11px] text-[#6B7280]">
                      {new Date(r.run_timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => {
                          setLatestRunResult(r);
                          setActiveTab('scenarios');
                        }}
                        className="text-xs font-semibold text-[#0F4C81] hover:underline cursor-pointer"
                      >
                        Inspect Decisions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: System & Database Health */}
      {activeTab === 'health' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8FAFC] border border-[#E3E6EB] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-[#111827] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0F4C81]" />
                Database Engine Status
              </h4>
              <div className="text-xs space-y-1.5 text-[#4B5563]">
                <div>
                  Status:{' '}
                  <span className="font-bold text-[#16A34A]">
                    {health?.database.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  SQL Dialect:{' '}
                  <span className="font-mono font-semibold text-[#111827]">
                    {health?.database.dialect}
                  </span>
                </div>
                <div>
                  Active Pilot Areas:{' '}
                  <span className="font-bold text-[#111827]">{pilotAreas.length}</span>
                </div>
                <div>
                  Active Depots:{' '}
                  <span className="font-bold text-[#111827]">{depots.length}</span>
                </div>
                <div>
                  Active Demands:{' '}
                  <span className="font-bold text-[#111827]">{demands.length}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E3E6EB] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-[#111827] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#0F4C81]" />
                FastAPI Service Metadata
              </h4>
              <div className="text-xs space-y-1.5 text-[#4B5563]">
                <div>
                  Service:{' '}
                  <span className="font-bold text-[#111827]">{health?.service}</span>
                </div>
                <div>
                  API Version:{' '}
                  <span className="font-mono text-[#0F4C81]">{health?.version}</span>
                </div>
                <div>
                  Probe Timestamp:{' '}
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    {health?.timestamp}
                  </span>
                </div>
                <div>
                  OpenAPI Documentation:{' '}
                  <a
                    href="/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F4C81] underline font-bold"
                  >
                    /docs (Interactive Swagger)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Modal */}
      {isCreateScenarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-xl w-full max-w-md p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#111827]">Create New Preemption Scenario</h3>
            <form onSubmit={handleCreateScenarioSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  required
                  value={newScenName}
                  onChange={e => setNewScenName(e.target.value)}
                  placeholder="e.g. Bundelkhand Rain-Shadow Contingency"
                  className="w-full p-2 border border-[#E3E6EB] rounded-md bg-[#F8FAFC] text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  Drought Stress Level
                </label>
                <select
                  value={newScenStress}
                  onChange={e => setNewScenStress(e.target.value as any)}
                  className="w-full p-2 border border-[#E3E6EB] rounded-md bg-[#F8FAFC] text-[#111827]"
                >
                  <option value="mild">Mild (Localized dry spell)</option>
                  <option value="severe">Severe (Late monsoon failure)</option>
                  <option value="extreme">Extreme (Consecutive seasonal deficits)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  Optimization Objective
                </label>
                <select
                  value={newScenObjective}
                  onChange={e => setNewScenObjective(e.target.value as any)}
                  className="w-full p-2 border border-[#E3E6EB] rounded-md bg-[#F8FAFC] text-[#111827]"
                >
                  <option value="critical_needs_first">Critical Needs First (Priority 1 Tankers First)</option>
                  <option value="equitable_distribution">Equitable Distribution (Proportional District Quota)</option>
                  <option value="max_demand_reduction">Maximum Demand Reduction (Satisfy smallest deficits)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                  Data Provenance *
                </label>
                <input
                  type="text"
                  required
                  value={newScenProvenance}
                  onChange={e => setNewScenProvenance(e.target.value)}
                  className="w-full p-2 border border-[#E3E6EB] rounded-md bg-[#F8FAFC] text-[#111827]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E3E6EB]">
                <button
                  type="button"
                  onClick={() => setIsCreateScenarioOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] cursor-pointer"
                >
                  Save Scenario to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
