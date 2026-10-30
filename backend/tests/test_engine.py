import pytest
from backend.app.engine.allocator import (
    DeterministicAllocator,
    DemandItem,
    StockItem
)


def test_deterministic_allocation_normal():
    """Verify normal allocation under sufficient supply."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=100.0, priority=1),
        DemandItem(demand_id="d2", pilot_area_id="chhatarpur", resource_type="tanker_water", quantity=150.0, priority=2),
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=300.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks, objective="critical_needs_first")

    assert result.total_demand == 250.0
    assert result.total_allocated == 250.0
    assert result.total_unmet == 0.0
    # Reconciliation invariant
    assert result.total_allocated + result.total_unmet == result.total_demand


def test_stock_conservation_demand_exceeding_supply():
    """
    CRITICAL INVARIANT TEST:
    Total allocations must NEVER exceed available depot stock,
    and allocated + unmet must strictly reconcile with total demand.
    """
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=400.0, priority=1),
        DemandItem(demand_id="d2", pilot_area_id="chhatarpur", resource_type="tanker_water", quantity=300.0, priority=2),
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=500.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks, objective="critical_needs_first")

    assert result.total_demand == 700.0
    # Stock limit respected
    assert result.total_allocated <= 500.0
    assert result.total_allocated == 500.0
    assert result.total_unmet == 200.0
    # Priority 1 got fully satisfied (400), Priority 2 got partial (100)
    p1_alloc = sum(l.allocated_quantity for l in result.lines if l.demand_id == "d1")
    p2_alloc = sum(l.allocated_quantity for l in result.lines if l.demand_id == "d2")
    assert p1_alloc == 400.0
    assert p2_alloc == 100.0
    # Reconciliation check
    assert result.total_allocated + result.total_unmet == result.total_demand


def test_zero_stock_behavior():
    """Verify system handles depots with zero stock gracefully."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=100.0, priority=1)
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=0.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks)

    assert result.total_allocated == 0.0
    assert result.total_unmet == 100.0
    assert len(result.lines) == 1
    assert "Supply exhausted" in result.lines[0].rationale or "Zero supply" in result.lines[0].rationale


def test_resource_type_compatibility():
    """Verify that resources are never allocated across incompatible types."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=100.0, priority=1)
    ]
    stocks = [
        # Only fodder is available, no water!
        StockItem(centre_id="c_fodder", pilot_area_id="tikamgarh", resource_type="fodder_tonnes", available_stock=500.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks)

    assert result.total_allocated == 0.0
    assert result.total_unmet == 100.0
    assert "No resource centre carries resource type" in result.lines[0].rationale


def test_deterministic_reproducibility():
    """Verify repeated runs with identical inputs produce identical outcomes."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="fodder_tonnes", quantity=250.0, priority=2),
        DemandItem(demand_id="d2", pilot_area_id="chhatarpur", resource_type="fodder_tonnes", quantity=350.0, priority=1),
        DemandItem(demand_id="d3", pilot_area_id="barwani", resource_type="fodder_tonnes", quantity=120.0, priority=3),
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="fodder_tonnes", available_stock=400.0)
    ]

    run1 = DeterministicAllocator.allocate(demands, stocks, objective="critical_needs_first")
    run2 = DeterministicAllocator.allocate(demands, stocks, objective="critical_needs_first")

    assert run1.total_allocated == run2.total_allocated
    assert run1.total_unmet == run2.total_unmet
    assert len(run1.lines) == len(run2.lines)
    for l1, l2 in zip(run1.lines, run2.lines):
        assert l1.demand_id == l2.demand_id
        assert l1.allocated_quantity == l2.allocated_quantity
        assert l1.unmet_quantity == l2.unmet_quantity


def test_multi_depot_allocation_and_line_item_reconciliation():
    """
    Verify single demand split across multiple depots reconciles exactly:
    sum(allocated_quantity) + sum(unmet_quantity) == demand_quantity
    """
    demands = [
        DemandItem(demand_id="d_split", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=500.0, priority=1)
    ]
    # Split stock across two depots: 200 in c1 and 400 in c2
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=200.0),
        StockItem(centre_id="c2", pilot_area_id="chhatarpur", resource_type="tanker_water", available_stock=400.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks)

    assert result.total_demand == 500.0
    assert result.total_allocated == 500.0
    assert result.total_unmet == 0.0
    assert len(result.lines) == 2
    # Verify line items sum
    sum_alloc = sum(l.allocated_quantity for l in result.lines)
    sum_unmet = sum(l.unmet_quantity for l in result.lines)
    assert sum_alloc + sum_unmet == 500.0


def test_budget_constraint_throttling():
    """Verify that allocation strictly respects monetary budget limit."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=100.0, priority=1)
    ]
    # 100 units available in depot, but unit cost is ₹2400 => ₹240,000 required
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=100.0)
    ]

    # Enforce ₹120,000 budget cap (can only afford 50 units)
    result = DeterministicAllocator.allocate(
        demands,
        stocks,
        budget_limit=120000.0,
        unit_costs={"tanker_water": 2400.0}
    )

    assert result.total_allocated == 50.0
    assert result.total_unmet == 50.0
    assert result.total_cost <= 120000.0
    assert result.total_allocated + result.total_unmet == result.total_demand


def test_tanker_fleet_capacity_constraint():
    """Verify that allocation respects fleet tanker capacity limit."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=200.0, priority=1)
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=300.0)
    ]

    # Max fleet can deliver is 80 units
    result = DeterministicAllocator.allocate(
        demands,
        stocks,
        fleet_capacity={"tanker_water": 80.0}
    )

    assert result.total_allocated == 80.0
    assert result.total_unmet == 120.0
    assert result.total_allocated + result.total_unmet == result.total_demand


def test_zero_demand_with_positive_stock():
    """Verify zero demand items are recorded cleanly without consuming stock."""
    demands = [
        DemandItem(demand_id="d0", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=0.0, priority=1)
    ]
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=500.0)
    ]

    result = DeterministicAllocator.allocate(demands, stocks)

    assert result.total_demand == 0.0
    assert result.total_allocated == 0.0
    assert result.total_unmet == 0.0
    assert len(result.lines) == 1
    assert result.lines[0].allocated_quantity == 0.0


def test_equity_floor_infeasibility_warning():
    """Verify that if statutory equity floor exceeds depot stock, is_floor_infeasible flag is set."""
    demands = [
        DemandItem(demand_id="d1", pilot_area_id="tikamgarh", resource_type="tanker_water", quantity=1000.0, priority=1)
    ]
    # Stock is only 150 units, but 20% floor requires 200 units
    stocks = [
        StockItem(centre_id="c1", pilot_area_id="tikamgarh", resource_type="tanker_water", available_stock=150.0)
    ]

    result = DeterministicAllocator.allocate(
        demands,
        stocks,
        equity_floor_pct=20.0
    )

    assert result.is_floor_infeasible is True
    assert "WARNING: Statutory equity floor of 20.0% is infeasible" in result.explanation
    # Allocations still do not exceed stock
    assert result.total_allocated <= 150.0

