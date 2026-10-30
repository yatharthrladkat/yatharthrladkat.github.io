/**
 * Deterministic Baseline Allocation Engine (TypeScript)
 * Port of backend/app/engine/allocator.py for unified, high-reliability execution.
 * Guarantees non-negative allocations, stock conservation, and line-item reconciliation.
 */

export interface DemandItem {
  demand_id: string;
  pilot_area_id: string;
  resource_type: string;
  quantity: number;
  priority: number; // 1 (Highest) to 5 (Lowest)
  data_source?: string;
}

export interface StockItem {
  centre_id: string;
  pilot_area_id: string;
  resource_type: string;
  available_stock: number;
}

export interface AllocationResultLine {
  demand_id: string;
  pilot_area_id: string;
  resource_centre_id: string;
  resource_type: string;
  demand_quantity: number;
  allocated_quantity: number;
  unmet_quantity: number;
  priority: number;
  rationale: string;
}

export interface AllocationResult {
  algorithm_version: string;
  objective: string;
  total_demand: number;
  total_allocated: number;
  total_unmet: number;
  lines: AllocationResultLine[];
  explanation: string;
  total_cost: number;
  is_floor_infeasible: boolean;
}

export const DEFAULT_UNIT_COSTS: Record<string, number> = {
  tanker_water: 2400.0,
  fodder_tonnes: 16500.0,
  seed_kits: 3200.0,
  direct_grant: 4000.0
};

export class DeterministicAllocator {
  static readonly VERSION = 'v1.1.0-deterministic-multi-constraint-node';

  static allocate(
    demands: DemandItem[],
    stocks: StockItem[],
    objective: string = 'critical_needs_first',
    budgetLimit?: number,
    unitCosts?: Record<string, number>,
    fleetCapacity?: Record<string, number>,
    equityFloorPct?: number
  ): AllocationResult {
    const resolvedUnitCosts = { ...DEFAULT_UNIT_COSTS, ...(unitCosts || {}) };

    // Track remaining stock per centre
    const remainingStock: Record<string, number> = {};
    for (const s of stocks) {
      remainingStock[s.centre_id] = Math.max(0, s.available_stock);
    }

    // Group centres by resource type
    const centresByType: Record<string, StockItem[]> = {};
    for (const s of stocks) {
      if (!centresByType[s.resource_type]) {
        centresByType[s.resource_type] = [];
      }
      centresByType[s.resource_type].push(s);
    }

    let remainingBudget = budgetLimit !== undefined ? budgetLimit : null;
    const remainingFleet: Record<string, number> = {};
    if (fleetCapacity) {
      for (const [k, v] of Object.entries(fleetCapacity)) {
        remainingFleet[k] = v;
      }
    }

    // Check equity floor feasibility upfront
    let isFloorInfeasible = false;
    let floorWarning = '';
    if (equityFloorPct !== undefined && equityFloorPct > 0) {
      const floorFraction = Math.min(1.0, equityFloorPct / 100.0);
      const uniqueTypes = Array.from(new Set(demands.map(d => d.resource_type)));
      for (const rType of uniqueTypes) {
        const reqFloor = demands
          .filter(d => d.resource_type === rType)
          .reduce((sum, d) => sum + d.quantity * floorFraction, 0);
        const availTypeStock = stocks
          .filter(s => s.resource_type === rType)
          .reduce((sum, s) => sum + s.available_stock, 0);
        if (availTypeStock < reqFloor) {
          isFloorInfeasible = true;
          floorWarning = `WARNING: Statutory equity floor of ${equityFloorPct}% is infeasible for '${rType}' (requires ${Math.round(reqFloor)} units, but depot inventory is only ${Math.round(availTypeStock)}). `;
          break;
        }
      }
    }

    // Sort demands deterministically
    const sortedDemands = this.sortDemands([...demands], objective);

    const resultLines: AllocationResultLine[] = [];
    let totalDemand = 0.0;
    let totalAllocated = 0.0;
    let totalUnmet = 0.0;
    let totalCost = 0.0;

    for (const d of sortedDemands) {
      const reqQty = Math.max(0, d.quantity);
      totalDemand += reqQty;
      const typeCentres = centresByType[d.resource_type] || [];

      if (reqQty === 0) {
        resultLines.push({
          demand_id: d.demand_id,
          pilot_area_id: d.pilot_area_id,
          resource_centre_id: 'NONE',
          resource_type: d.resource_type,
          demand_quantity: 0,
          allocated_quantity: 0,
          unmet_quantity: 0,
          priority: d.priority,
          rationale: 'Zero demand: Area registered 0 units required.'
        });
        continue;
      }

      if (typeCentres.length === 0) {
        resultLines.push({
          demand_id: d.demand_id,
          pilot_area_id: d.pilot_area_id,
          resource_centre_id: 'NONE',
          resource_type: d.resource_type,
          demand_quantity: Number(reqQty.toFixed(2)),
          allocated_quantity: 0,
          unmet_quantity: Number(reqQty.toFixed(2)),
          priority: d.priority,
          rationale: `Zero supply: No resource centre carries resource type '${d.resource_type}'.`
        });
        totalUnmet += reqQty;
        continue;
      }

      let allocatedForD = 0;
      let linesForD: AllocationResultLine[] = [];
      let costForD = 0;

      if (objective === 'equitable_distribution') {
        const eqRes = this.allocateEquitable(
          d,
          typeCentres,
          remainingStock,
          demands,
          remainingBudget,
          resolvedUnitCosts,
          remainingFleet
        );
        allocatedForD = eqRes.allocated;
        linesForD = eqRes.lines;
        costForD = eqRes.cost;
      } else {
        const grRes = this.allocateGreedy(
          d,
          typeCentres,
          remainingStock,
          remainingBudget,
          resolvedUnitCosts,
          remainingFleet
        );
        allocatedForD = grRes.allocated;
        linesForD = grRes.lines;
        costForD = grRes.cost;
      }

      if (remainingBudget !== null) {
        remainingBudget = Math.max(0, remainingBudget - costForD);
      }

      totalAllocated += allocatedForD;
      totalCost += costForD;
      const unmetForD = Number((reqQty - allocatedForD).toFixed(2));
      totalUnmet += unmetForD;
      resultLines.push(...linesForD);
    }

    const fulfillmentPct = totalDemand > 0 ? Number(((totalAllocated / totalDemand) * 100).toFixed(1)) : 100;
    const explanation = `Executed ${this.VERSION} with objective '${objective}'. ${floorWarning}Processed ${sortedDemands.length} demands against ${stocks.length} depots. Total demand ${Math.round(totalDemand)} resulted in ${Math.round(totalAllocated)} allocated and ${Math.round(totalUnmet)} unmet (fulfillment: ${fulfillmentPct}%). Total relief cost: ₹${totalCost.toLocaleString('en-IN')}.`;

    return {
      algorithm_version: this.VERSION,
      objective,
      total_demand: Number(totalDemand.toFixed(2)),
      total_allocated: Number(totalAllocated.toFixed(2)),
      total_unmet: Number(totalUnmet.toFixed(2)),
      lines: resultLines,
      explanation,
      total_cost: Number(totalCost.toFixed(2)),
      is_floor_infeasible: isFloorInfeasible
    };
  }

  private static sortDemands(demands: DemandItem[], objective: string): DemandItem[] {
    if (objective === 'critical_needs_first') {
      return demands.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (b.quantity !== a.quantity) return b.quantity - a.quantity;
        return a.pilot_area_id.localeCompare(b.pilot_area_id);
      });
    } else if (objective === 'max_demand_reduction') {
      return demands.sort((a, b) => {
        if (a.quantity !== b.quantity) return a.quantity - b.quantity;
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.pilot_area_id.localeCompare(b.pilot_area_id);
      });
    } else {
      return demands.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.pilot_area_id.localeCompare(b.pilot_area_id);
      });
    }
  }

  private static allocateGreedy(
    demand: DemandItem,
    centres: StockItem[],
    remainingStock: Record<string, number>,
    remainingBudget: number | null,
    unitCosts: Record<string, number>,
    remainingFleet: Record<string, number>
  ): { allocated: number; lines: AllocationResultLine[]; cost: number } {
    let needed = demand.quantity;
    let allocatedTotal = 0;
    let costTotal = 0;
    const lines: AllocationResultLine[] = [];
    const unitCost = unitCosts[demand.resource_type] || 0;

    // Prefer centres in same area, then highest stock
    const sortedCentres = [...centres].sort((a, b) => {
      const aSame = a.pilot_area_id === demand.pilot_area_id ? 0 : 1;
      const bSame = b.pilot_area_id === demand.pilot_area_id ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return (remainingStock[b.centre_id] || 0) - (remainingStock[a.centre_id] || 0);
    });

    for (const c of sortedCentres) {
      if (needed <= 0) break;
      const available = remainingStock[c.centre_id] || 0;
      if (available <= 0) continue;

      let grant = Math.min(needed, available);

      if (remainingBudget !== null && unitCost > 0) {
        const budgetLeft = Math.max(0, remainingBudget - costTotal);
        const maxAffordable = budgetLeft / unitCost;
        grant = Math.min(grant, maxAffordable);
      }

      if (remainingFleet[demand.resource_type] !== undefined) {
        const fleetLeft = remainingFleet[demand.resource_type];
        grant = Math.min(grant, fleetLeft);
        remainingFleet[demand.resource_type] = Math.max(0, fleetLeft - grant);
      }

      grant = Number(grant.toFixed(2));
      if (grant <= 0) continue;

      remainingStock[c.centre_id] = Number((available - grant).toFixed(4));
      needed = Number((needed - grant).toFixed(4));
      allocatedTotal += grant;
      costTotal += grant * unitCost;

      const sameArea = c.pilot_area_id === demand.pilot_area_id ? 'local pilot area depot' : 'regional staging depot';
      lines.push({
        demand_id: demand.demand_id,
        pilot_area_id: demand.pilot_area_id,
        resource_centre_id: c.centre_id,
        resource_type: demand.resource_type,
        demand_quantity: Number(demand.quantity.toFixed(2)),
        allocated_quantity: grant,
        unmet_quantity: 0,
        priority: demand.priority,
        rationale: `Allocated ${grant} units from ${sameArea} '${c.centre_id}' under Priority ${demand.priority} rule.`
      });
    }

    const unmet = Number((demand.quantity - allocatedTotal).toFixed(2));
    if (lines.length > 0) {
      lines[lines.length - 1].unmet_quantity = unmet;
    } else {
      lines.push({
        demand_id: demand.demand_id,
        pilot_area_id: demand.pilot_area_id,
        resource_centre_id: 'EXHAUSTED',
        resource_type: demand.resource_type,
        demand_quantity: Number(demand.quantity.toFixed(2)),
        allocated_quantity: 0,
        unmet_quantity: Number(demand.quantity.toFixed(2)),
        priority: demand.priority,
        rationale: 'Supply exhausted: All regional depots for this resource type have 0 remaining stock or budget depleted.'
      });
    }

    return {
      allocated: Number(allocatedTotal.toFixed(2)),
      lines,
      cost: Number(costTotal.toFixed(2))
    };
  }

  private static allocateEquitable(
    demand: DemandItem,
    centres: StockItem[],
    remainingStock: Record<string, number>,
    allDemands: DemandItem[],
    remainingBudget: number | null,
    unitCosts: Record<string, number>,
    remainingFleet: Record<string, number>
  ): { allocated: number; lines: AllocationResultLine[]; cost: number } {
    const typeDemands = allDemands.filter(d => d.resource_type === demand.resource_type);
    const sumTypeDemand = typeDemands.reduce((sum, d) => sum + d.quantity, 0) || 1.0;
    const shareRatio = demand.quantity / sumTypeDemand;

    let allocatedTotal = 0;
    let costTotal = 0;
    const lines: AllocationResultLine[] = [];
    const unitCost = unitCosts[demand.resource_type] || 0;

    const sortedCentres = [...centres].sort((a, b) => a.centre_id.localeCompare(b.centre_id));

    for (const c of sortedCentres) {
      const available = remainingStock[c.centre_id] || 0;
      if (available <= 0) continue;

      const targetFromCentre = Math.min(demand.quantity - allocatedTotal, available * shareRatio);
      let grant = Math.min(targetFromCentre, available);

      if (remainingBudget !== null && unitCost > 0) {
        const budgetLeft = Math.max(0, remainingBudget - costTotal);
        const maxAffordable = budgetLeft / unitCost;
        grant = Math.min(grant, maxAffordable);
      }

      if (remainingFleet[demand.resource_type] !== undefined) {
        const fleetLeft = remainingFleet[demand.resource_type];
        grant = Math.min(grant, fleetLeft);
        remainingFleet[demand.resource_type] = Math.max(0, fleetLeft - grant);
      }

      grant = Number(grant.toFixed(2));
      if (grant > 0) {
        remainingStock[c.centre_id] = Number((available - grant).toFixed(4));
        allocatedTotal += grant;
        costTotal += grant * unitCost;

        lines.push({
          demand_id: demand.demand_id,
          pilot_area_id: demand.pilot_area_id,
          resource_centre_id: c.centre_id,
          resource_type: demand.resource_type,
          demand_quantity: Number(demand.quantity.toFixed(2)),
          allocated_quantity: grant,
          unmet_quantity: 0,
          priority: demand.priority,
          rationale: `Equitable quota: ${grant} units granted (${Math.round(shareRatio * 100)}% pooled share).`
        });
      }
    }

    const unmet = Number((demand.quantity - allocatedTotal).toFixed(2));
    if (lines.length > 0) {
      lines[lines.length - 1].unmet_quantity = unmet;
    } else {
      lines.push({
        demand_id: demand.demand_id,
        pilot_area_id: demand.pilot_area_id,
        resource_centre_id: 'EXHAUSTED',
        resource_type: demand.resource_type,
        demand_quantity: Number(demand.quantity.toFixed(2)),
        allocated_quantity: 0,
        unmet_quantity: Number(demand.quantity.toFixed(2)),
        priority: demand.priority,
        rationale: 'Equitable quota could not be fulfilled: all depot stocks depleted or budget limit reached.'
      });
    }

    return {
      allocated: Number(allocatedTotal.toFixed(2)),
      lines,
      cost: Number(costTotal.toFixed(2))
    };
  }
}
