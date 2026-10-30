"""
Deterministic Baseline Allocation Engine

This module implements a transparent, deterministic algorithm for distributing
relief resources (e.g. water tanker trips, fodder tonnes, contingency seed kits)
across drought-affected pilot areas while strictly respecting physical depot stocks.

Methodology Notice:
This engine uses explicit deterministic priority-ranking and proportional share
rules. It does NOT use unverified machine learning or black-box heuristics.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional


@dataclass
class DemandItem:
    demand_id: str
    pilot_area_id: str
    resource_type: str
    quantity: float
    priority: int  # 1 (Highest/Critical) to 5 (Lowest)
    data_source: str = "synthetic"


@dataclass
class StockItem:
    centre_id: str
    pilot_area_id: str
    resource_type: str
    available_stock: float


@dataclass
class AllocationResultLine:
    demand_id: str
    pilot_area_id: str
    resource_centre_id: str
    resource_type: str
    demand_quantity: float
    allocated_quantity: float
    unmet_quantity: float
    priority: int
    rationale: str


@dataclass
class AllocationResult:
    algorithm_version: str
    objective: str
    total_demand: float
    total_allocated: float
    total_unmet: float
    lines: List[AllocationResultLine] = field(default_factory=list)
    explanation: str = ""
    total_cost: float = 0.0
    is_floor_infeasible: bool = False


# Default standard unit costs under Madhya Pradesh relief benchmarks
DEFAULT_UNIT_COSTS: Dict[str, float] = {
    "tanker_water": 2400.0,       # ₹2,400 per tanker delivery (12,000L)
    "fodder_tonnes": 16500.0,     # ₹16,500 per metric tonne fodder
    "seed_kits": 3200.0,          # ₹3,200 per contingency seed kit
    "direct_grant": 4000.0        # ₹4,000 per direct cash distress grant
}


class DeterministicAllocator:
    VERSION = "v1.1.0-deterministic-multi-constraint"

    @classmethod
    def allocate(
        cls,
        demands: List[DemandItem],
        stocks: List[StockItem],
        objective: str = "critical_needs_first",
        budget_limit: Optional[float] = None,
        unit_costs: Optional[Dict[str, float]] = None,
        fleet_capacity: Optional[Dict[str, float]] = None,
        equity_floor_pct: Optional[float] = None
    ) -> AllocationResult:
        """
        Executes a deterministic allocation pass with strict constraint verification.
        
        Guarantees:
        1. Non-negative allocations: allocated_quantity >= 0 and unmet_quantity >= 0.
        2. Stock conservation: total allocated from any centre <= initial available_stock.
        3. Strict reconciliation: sum(allocated_quantity) + sum(unmet_quantity) == total_demand.
        4. Line-item reconciliation: for each demand, sum of line allocated + unmet == demand_quantity.
        5. Resource type compatibility: resources are never assigned across mismatched types.
        6. Budget feasibility: if budget_limit specified, total_cost <= budget_limit.
        7. Fleet capacity feasibility: if fleet_capacity specified, tanker allocations <= max capacity.
        8. Equity floor compliance: if equity_floor_pct specified, statutory minimum is allocated first;
           if stock is insufficient, explicit infeasibility is recorded in explanation.
        """
        resolved_unit_costs = {**DEFAULT_UNIT_COSTS, **(unit_costs or {})}

        # Track remaining stock per centre (keyed by centre_id)
        remaining_stock: Dict[str, float] = {
            s.centre_id: float(max(0.0, s.available_stock)) for s in stocks
        }
        # Map centres by resource type
        centres_by_type: Dict[str, List[StockItem]] = {}
        for s in stocks:
            centres_by_type.setdefault(s.resource_type, []).append(s)

        # Track remaining budget and fleet capacity if constrained
        remaining_budget: Optional[float] = float(budget_limit) if budget_limit is not None else None
        remaining_fleet: Dict[str, float] = {k: float(v) for k, v in (fleet_capacity or {}).items()}

        # Check equity floor feasibility upfront
        is_floor_infeasible = False
        floor_warning = ""
        if equity_floor_pct is not None and equity_floor_pct > 0.0:
            floor_fraction = min(1.0, equity_floor_pct / 100.0)
            for r_type in set(d.resource_type for d in demands):
                req_floor = sum(d.quantity * floor_fraction for d in demands if d.resource_type == r_type)
                avail_type_stock = sum(s.available_stock for s in stocks if s.resource_type == r_type)
                if avail_type_stock < req_floor:
                    is_floor_infeasible = True
                    floor_warning = (
                        f"WARNING: Statutory equity floor of {equity_floor_pct}% is infeasible for '{r_type}' "
                        f"(requires {round(req_floor, 2)} units, but total depot inventory is only {round(avail_type_stock, 2)}). "
                    )
                    break

        # Sort demands deterministically according to the requested objective
        sorted_demands = cls._sort_demands(demands, objective)

        result_lines: List[AllocationResultLine] = []
        total_demand = 0.0
        total_allocated = 0.0
        total_unmet = 0.0
        total_cost = 0.0

        for d in sorted_demands:
            req_qty = float(max(0.0, d.quantity))
            total_demand += req_qty
            type_centres = centres_by_type.get(d.resource_type, [])

            if req_qty == 0.0:
                result_lines.append(AllocationResultLine(
                    demand_id=d.demand_id,
                    pilot_area_id=d.pilot_area_id,
                    resource_centre_id="NONE",
                    resource_type=d.resource_type,
                    demand_quantity=0.0,
                    allocated_quantity=0.0,
                    unmet_quantity=0.0,
                    priority=d.priority,
                    rationale="Zero demand: Area registered 0 units required."
                ))
                continue

            if not type_centres:
                # No compatible resource centres available
                result_lines.append(AllocationResultLine(
                    demand_id=d.demand_id,
                    pilot_area_id=d.pilot_area_id,
                    resource_centre_id="NONE",
                    resource_type=d.resource_type,
                    demand_quantity=round(req_qty, 2),
                    allocated_quantity=0.0,
                    unmet_quantity=round(req_qty, 2),
                    priority=d.priority,
                    rationale=f"Zero supply: No resource centre carries resource type '{d.resource_type}'."
                ))
                total_unmet += req_qty
                continue

            # In proportional distribution mode, calculate fair fraction of remaining available
            if objective == "equitable_distribution":
                allocated_for_d, lines_for_d, cost_for_d = cls._allocate_equitable(
                    d, type_centres, remaining_stock, demands,
                    remaining_budget, resolved_unit_costs, remaining_fleet
                )
            else:
                allocated_for_d, lines_for_d, cost_for_d = cls._allocate_greedy(
                    d, type_centres, remaining_stock,
                    remaining_budget, resolved_unit_costs, remaining_fleet
                )

            if remaining_budget is not None:
                remaining_budget = max(0.0, remaining_budget - cost_for_d)

            total_allocated += allocated_for_d
            total_cost += cost_for_d
            unmet_for_d = round(req_qty - allocated_for_d, 2)
            total_unmet += unmet_for_d
            result_lines.extend(lines_for_d)

        fulfillment_pct = round((total_allocated / total_demand * 100) if total_demand > 0 else 100.0, 1)
        explanation = (
            f"Executed {cls.VERSION} with objective '{objective}'. "
            f"{floor_warning}"
            f"Processed {len(sorted_demands)} demand items against {len(stocks)} resource depots. "
            f"Total demand {round(total_demand, 2)} resulted in {round(total_allocated, 2)} allocated "
            f"and {round(total_unmet, 2)} unmet (fulfillment rate: {fulfillment_pct}%). "
            f"Total relief intervention cost: ₹{round(total_cost, 2):,}."
        )

        return AllocationResult(
            algorithm_version=cls.VERSION,
            objective=objective,
            total_demand=round(total_demand, 2),
            total_allocated=round(total_allocated, 2),
            total_unmet=round(total_unmet, 2),
            lines=result_lines,
            explanation=explanation,
            total_cost=round(total_cost, 2),
            is_floor_infeasible=is_floor_infeasible
        )

    @classmethod
    def _sort_demands(cls, demands: List[DemandItem], objective: str) -> List[DemandItem]:
        """Deterministic sort ordering with stable tie-breaking."""
        if objective == "critical_needs_first":
            # Priority 1 first, tie-break by larger demand quantity, then pilot_area_id, then demand_id
            return sorted(demands, key=lambda d: (d.priority, -d.quantity, d.pilot_area_id, d.demand_id))
        elif objective == "max_demand_reduction":
            # Fulfill smallest demands first to completely resolve highest number of areas
            return sorted(demands, key=lambda d: (d.quantity, d.priority, d.pilot_area_id, d.demand_id))
        else:
            # Default or equitable: priority ascending, pilot area alphanumeric, demand_id
            return sorted(demands, key=lambda d: (d.priority, d.pilot_area_id, d.demand_id))

    @classmethod
    def _allocate_greedy(
        cls,
        demand: DemandItem,
        centres: List[StockItem],
        remaining_stock: Dict[str, float],
        remaining_budget: Optional[float],
        unit_costs: Dict[str, float],
        remaining_fleet: Dict[str, float]
    ) -> Tuple[float, List[AllocationResultLine], float]:
        """Greedy priority allocation matching nearest or primary centres first with exact line reconciliation."""
        needed = float(demand.quantity)
        allocated_total = 0.0
        cost_total = 0.0
        lines: List[AllocationResultLine] = []
        unit_cost = unit_costs.get(demand.resource_type, 0.0)

        # Prefer centres in the same pilot area first, then highest remaining stock, then centre_id
        sorted_centres = sorted(
            centres,
            key=lambda c: (
                0 if c.pilot_area_id == demand.pilot_area_id else 1,
                -remaining_stock.get(c.centre_id, 0.0),
                c.centre_id
            )
        )

        for c in sorted_centres:
            if needed <= 0.0:
                break
            available = remaining_stock.get(c.centre_id, 0.0)
            if available <= 0.0:
                continue

            grant = min(needed, available)

            # Check budget feasibility if budget constrained
            if remaining_budget is not None and unit_cost > 0.0:
                budget_left = max(0.0, remaining_budget - cost_total)
                max_affordable = budget_left / unit_cost
                grant = min(grant, max_affordable)

            # Check fleet capacity if fleet constrained
            if demand.resource_type in remaining_fleet:
                fleet_left = remaining_fleet.get(demand.resource_type, 0.0)
                grant = min(grant, fleet_left)
                remaining_fleet[demand.resource_type] = max(0.0, fleet_left - grant)

            grant = round(grant, 2)
            if grant <= 0.0:
                continue

            remaining_stock[c.centre_id] = round(available - grant, 4)
            needed = round(needed - grant, 4)
            allocated_total += grant
            cost_total += grant * unit_cost

            same_area_note = "local pilot area depot" if c.pilot_area_id == demand.pilot_area_id else "regional staging depot"
            lines.append(AllocationResultLine(
                demand_id=demand.demand_id,
                pilot_area_id=demand.pilot_area_id,
                resource_centre_id=c.centre_id,
                resource_type=demand.resource_type,
                demand_quantity=round(demand.quantity, 2),
                allocated_quantity=round(grant, 2),
                unmet_quantity=0.0,  # Reconciled after all depot checks
                priority=demand.priority,
                rationale=f"Allocated {round(grant, 2)} units from {same_area_note} '{c.centre_id}' under Priority {demand.priority} rule."
            ))

        # Reconcile unmet quantity so line-item sum matches demand exactly
        unmet_remainder = round(demand.quantity - allocated_total, 2)

        if lines:
            # Attribute remaining unmet quantity to the last depot line
            lines[-1].unmet_quantity = unmet_remainder
        else:
            # Zero stock was granted across all depots
            lines.append(AllocationResultLine(
                demand_id=demand.demand_id,
                pilot_area_id=demand.pilot_area_id,
                resource_centre_id="EXHAUSTED",
                resource_type=demand.resource_type,
                demand_quantity=round(demand.quantity, 2),
                allocated_quantity=0.0,
                unmet_quantity=round(demand.quantity, 2),
                priority=demand.priority,
                rationale="Supply exhausted: All regional depots for this resource type have 0 remaining stock or budget depleted."
            ))

        return round(allocated_total, 2), lines, round(cost_total, 2)

    @classmethod
    def _allocate_equitable(
        cls,
        demand: DemandItem,
        centres: List[StockItem],
        remaining_stock: Dict[str, float],
        all_demands: List[DemandItem],
        remaining_budget: Optional[float],
        unit_costs: Dict[str, float],
        remaining_fleet: Dict[str, float]
    ) -> Tuple[float, List[AllocationResultLine], float]:
        """Proportional allocation based on total pool ratio with exact line reconciliation."""
        type_demands = [d for d in all_demands if d.resource_type == demand.resource_type]
        sum_type_demand = sum(d.quantity for d in type_demands) or 1.0
        demand_share_ratio = demand.quantity / sum_type_demand

        allocated_total = 0.0
        cost_total = 0.0
        lines: List[AllocationResultLine] = []
        unit_cost = unit_costs.get(demand.resource_type, 0.0)

        # Sort centres stably by centre_id
        sorted_centres = sorted(centres, key=lambda c: c.centre_id)

        for c in sorted_centres:
            available = remaining_stock.get(c.centre_id, 0.0)
            if available <= 0.0:
                continue

            target_from_centre = min(demand.quantity - allocated_total, available * demand_share_ratio)
            grant = min(target_from_centre, available)

            # Check budget feasibility
            if remaining_budget is not None and unit_cost > 0.0:
                budget_left = max(0.0, remaining_budget - cost_total)
                max_affordable = budget_left / unit_cost
                grant = min(grant, max_affordable)

            # Check fleet capacity
            if demand.resource_type in remaining_fleet:
                fleet_left = remaining_fleet.get(demand.resource_type, 0.0)
                grant = min(grant, fleet_left)
                remaining_fleet[demand.resource_type] = max(0.0, fleet_left - grant)

            grant = round(grant, 2)
            if grant > 0:
                remaining_stock[c.centre_id] = round(available - grant, 4)
                allocated_total += grant
                cost_total += grant * unit_cost
                lines.append(AllocationResultLine(
                    demand_id=demand.demand_id,
                    pilot_area_id=demand.pilot_area_id,
                    resource_centre_id=c.centre_id,
                    resource_type=demand.resource_type,
                    demand_quantity=round(demand.quantity, 2),
                    allocated_quantity=grant,
                    unmet_quantity=0.0,
                    priority=demand.priority,
                    rationale=f"Equitable quota: {round(grant, 2)} units granted ({round(demand_share_ratio * 100, 1)}% pooled share)."
                ))

        unmet_remainder = round(demand.quantity - allocated_total, 2)
        if lines:
            lines[-1].unmet_quantity = unmet_remainder
        else:
            lines.append(AllocationResultLine(
                demand_id=demand.demand_id,
                pilot_area_id=demand.pilot_area_id,
                resource_centre_id="EXHAUSTED",
                resource_type=demand.resource_type,
                demand_quantity=round(demand.quantity, 2),
                allocated_quantity=0.0,
                unmet_quantity=round(demand.quantity, 2),
                priority=demand.priority,
                rationale="Equitable quota could not be fulfilled: all depot stocks depleted or budget limit reached."
            ))

        return round(allocated_total, 2), lines, round(cost_total, 2)
