import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models import (
    PilotArea,
    ResourceCentre,
    DemandRecord,
    Scenario,
    AllocationRun,
    AllocationItem
)
from backend.app.schemas import (
    PilotAreaCreate,
    PilotAreaResponse,
    ResourceCentreCreate,
    ResourceCentreResponse,
    ResourceCentreUpdateStock,
    DemandRecordCreate,
    DemandRecordResponse,
    ScenarioCreate,
    ScenarioResponse,
    AllocationRunResponse,
    AllocationItemResponse
)
from backend.app.engine.allocator import (
    DeterministicAllocator,
    DemandItem,
    StockItem
)

router = APIRouter(prefix="/api/v1")


# =========================================================================
# Pilot Areas
# =========================================================================

@router.get("/pilot-areas", response_model=List[PilotAreaResponse], tags=["Pilot Areas"])
def list_pilot_areas(db: Session = Depends(get_db)):
    """Retrieve all pilot areas with location metadata and synthetic flags."""
    return db.query(PilotArea).order_by(PilotArea.name.asc()).all()


@router.get("/pilot-areas/{area_id}", response_model=PilotAreaResponse, tags=["Pilot Areas"])
def get_pilot_area(area_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific pilot area."""
    area = db.query(PilotArea).filter(PilotArea.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail=f"Pilot area '{area_id}' not found")
    return area


@router.post("/pilot-areas", response_model=PilotAreaResponse, status_code=status.HTTP_201_CREATED, tags=["Pilot Areas"])
def create_pilot_area(payload: PilotAreaCreate, db: Session = Depends(get_db)):
    """Register a new pilot area record."""
    existing = db.query(PilotArea).filter(PilotArea.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Pilot area with id '{payload.id}' already exists")
    
    area = PilotArea(**payload.model_dump())
    db.add(area)
    db.commit()
    db.refresh(area)
    return area


# =========================================================================
# Resource Centres
# =========================================================================

@router.get("/resource-centres", response_model=List[ResourceCentreResponse], tags=["Resource Centres"])
def list_resource_centres(
    pilot_area_id: Optional[str] = Query(None, description="Filter by pilot area"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    db: Session = Depends(get_db)
):
    """Retrieve resource centres, storage depots, and available relief stocks."""
    query = db.query(ResourceCentre)
    if pilot_area_id:
        query = query.filter(ResourceCentre.pilot_area_id == pilot_area_id)
    if resource_type:
        query = query.filter(ResourceCentre.resource_type == resource_type)
    return query.order_by(ResourceCentre.name.asc()).all()


@router.post("/resource-centres", response_model=ResourceCentreResponse, status_code=status.HTTP_201_CREATED, tags=["Resource Centres"])
def create_resource_centre(payload: ResourceCentreCreate, db: Session = Depends(get_db)):
    """Register a new relief resource centre or supply depot."""
    existing = db.query(ResourceCentre).filter(ResourceCentre.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Resource centre '{payload.id}' already exists")

    # Verify that the referenced pilot area exists
    area = db.query(PilotArea).filter(PilotArea.id == payload.pilot_area_id).first()
    if not area:
        raise HTTPException(status_code=400, detail=f"Referenced pilot area '{payload.pilot_area_id}' does not exist")

    centre = ResourceCentre(**payload.model_dump())
    db.add(centre)
    db.commit()
    db.refresh(centre)
    return centre


@router.patch("/resource-centres/{centre_id}/stock", response_model=ResourceCentreResponse, tags=["Resource Centres"])
def update_centre_stock(centre_id: str, payload: ResourceCentreUpdateStock, db: Session = Depends(get_db)):
    """Update stock level for a resource centre, strictly enforcing non-negative balances."""
    centre = db.query(ResourceCentre).filter(ResourceCentre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail=f"Resource centre '{centre_id}' not found")

    centre.available_stock = payload.available_stock
    centre.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(centre)
    return centre


# =========================================================================
# Demand Records
# =========================================================================

@router.get("/demand-records", response_model=List[DemandRecordResponse], tags=["Demand Records"])
def list_demand_records(
    pilot_area_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve relief demand records with priority and value category labels."""
    query = db.query(DemandRecord)
    if pilot_area_id:
        query = query.filter(DemandRecord.pilot_area_id == pilot_area_id)
    if resource_type:
        query = query.filter(DemandRecord.resource_type == resource_type)
    return query.order_by(DemandRecord.priority.asc(), DemandRecord.estimated_demand.desc()).all()


@router.post("/demand-records", response_model=DemandRecordResponse, status_code=status.HTTP_201_CREATED, tags=["Demand Records"])
def create_demand_record(payload: DemandRecordCreate, db: Session = Depends(get_db)):
    """Register a relief demand requirement for an area."""
    existing = db.query(DemandRecord).filter(DemandRecord.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Demand record '{payload.id}' already exists")

    area = db.query(PilotArea).filter(PilotArea.id == payload.pilot_area_id).first()
    if not area:
        raise HTTPException(status_code=400, detail=f"Referenced pilot area '{payload.pilot_area_id}' does not exist")

    record = DemandRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# =========================================================================
# Scenario Management & Allocation Engine
# =========================================================================

@router.get("/scenarios", response_model=List[ScenarioResponse], tags=["Scenarios"])
def list_scenarios(db: Session = Depends(get_db)):
    """List all preemption scenarios with their input assumptions and data provenance."""
    scenarios = db.query(Scenario).order_by(Scenario.created_at.desc()).all()
    results = []
    for s in scenarios:
        assumptions = {}
        if s.input_assumptions:
            try:
                assumptions = json.loads(s.input_assumptions)
            except Exception:
                assumptions = {"raw": s.input_assumptions}
        results.append(
            ScenarioResponse(
                id=s.id,
                name=s.name,
                description=s.description,
                stress_level=s.stress_level,
                objective=s.objective,
                input_assumptions=assumptions,
                data_provenance=s.data_provenance,
                created_at=s.created_at
            )
        )
    return results


@router.get("/scenarios/{scenario_id}", response_model=ScenarioResponse, tags=["Scenarios"])
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Retrieve details and input assumptions for a specific scenario."""
    s = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    
    assumptions = {}
    if s.input_assumptions:
        try:
            assumptions = json.loads(s.input_assumptions)
        except Exception:
            assumptions = {"raw": s.input_assumptions}
    
    return ScenarioResponse(
        id=s.id,
        name=s.name,
        description=s.description,
        stress_level=s.stress_level,
        objective=s.objective,
        input_assumptions=assumptions,
        data_provenance=s.data_provenance,
        created_at=s.created_at
    )


@router.post("/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED, tags=["Scenarios"])
def create_scenario(payload: ScenarioCreate, db: Session = Depends(get_db)):
    """Create a new allocation scenario recording assumptions and data provenance."""
    scenario_id = payload.id or f"scen-{uuid.uuid4().hex[:8]}"
    existing = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Scenario with id '{scenario_id}' already exists")

    scenario = Scenario(
        id=scenario_id,
        name=payload.name,
        description=payload.description,
        stress_level=payload.stress_level,
        objective=payload.objective,
        input_assumptions=json.dumps(payload.input_assumptions),
        data_provenance=payload.data_provenance
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    return ScenarioResponse(
        id=scenario.id,
        name=scenario.name,
        description=scenario.description,
        stress_level=scenario.stress_level,
        objective=scenario.objective,
        input_assumptions=payload.input_assumptions,
        data_provenance=scenario.data_provenance,
        created_at=scenario.created_at
    )


@router.post("/scenarios/{scenario_id}/run", response_model=AllocationRunResponse, tags=["Allocation Engine"])
def run_scenario_allocation(
    scenario_id: str,
    resource_type: Optional[str] = Query(None, description="Optional resource filter"),
    db: Session = Depends(get_db)
):
    """
    Executes the deterministic allocation engine against a scenario and current depot stocks.
    Enforces stock limits, records unmet demand, logs explanations, and stores the audit history.
    """
    scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    # Fetch active demands
    demand_query = db.query(DemandRecord)
    if resource_type:
        demand_query = demand_query.filter(DemandRecord.resource_type == resource_type)
    db_demands = demand_query.all()

    # Fetch current stocks
    stock_query = db.query(ResourceCentre)
    if resource_type:
        stock_query = stock_query.filter(ResourceCentre.resource_type == resource_type)
    db_stocks = stock_query.all()

    # Transform into engine domain models
    engine_demands = [
        DemandItem(
            demand_id=d.id,
            pilot_area_id=d.pilot_area_id,
            resource_type=d.resource_type,
            quantity=d.estimated_demand,
            priority=d.priority,
            data_source=d.data_source
        )
        for d in db_demands
    ]

    engine_stocks = [
        StockItem(
            centre_id=s.id,
            pilot_area_id=s.pilot_area_id,
            resource_type=s.resource_type,
            available_stock=s.available_stock
        )
        for s in db_stocks
    ]

    # Run deterministic allocation
    result = DeterministicAllocator.allocate(
        demands=engine_demands,
        stocks=engine_stocks,
        objective=scenario.objective
    )

    # Persist the allocation run audit record
    run_id = f"run-{uuid.uuid4().hex[:10]}"
    alloc_run = AllocationRun(
        id=run_id,
        scenario_id=scenario.id,
        algorithm_version=result.algorithm_version,
        run_timestamp=datetime.now(timezone.utc),
        total_demand=result.total_demand,
        total_allocated=result.total_allocated,
        total_unmet=result.total_unmet,
        explanation_summary=result.explanation,
        status="completed"
    )
    db.add(alloc_run)

    # Persist allocation line items
    item_responses = []
    for line in result.lines:
        # Default placeholder centre if none available
        centre_id_to_store = line.resource_centre_id
        if centre_id_to_store in ("NONE", "EXHAUSTED"):
            # Assign first centre or create fallback reference
            first_c = next((s.id for s in db_stocks if s.resource_type == line.resource_type), None)
            centre_id_to_store = first_c or db_stocks[0].id if db_stocks else "rc-unassigned"

        item_id = f"item-{uuid.uuid4().hex[:10]}"
        item = AllocationItem(
            id=item_id,
            run_id=run_id,
            pilot_area_id=line.pilot_area_id,
            resource_centre_id=centre_id_to_store,
            resource_type=line.resource_type,
            demand_quantity=line.demand_quantity,
            allocated_quantity=line.allocated_quantity,
            unmet_quantity=line.unmet_quantity,
            priority=line.priority,
            rationale=line.rationale
        )
        db.add(item)
        item_responses.append(
            AllocationItemResponse(
                id=item_id,
                run_id=run_id,
                pilot_area_id=line.pilot_area_id,
                resource_centre_id=line.resource_centre_id,
                resource_type=line.resource_type,
                demand_quantity=line.demand_quantity,
                allocated_quantity=line.allocated_quantity,
                unmet_quantity=line.unmet_quantity,
                priority=line.priority,
                rationale=line.rationale
            )
        )

    db.commit()

    return AllocationRunResponse(
        id=run_id,
        scenario_id=scenario.id,
        algorithm_version=result.algorithm_version,
        run_timestamp=alloc_run.run_timestamp,
        total_demand=result.total_demand,
        total_allocated=result.total_allocated,
        total_unmet=result.total_unmet,
        explanation_summary=result.explanation,
        status="completed",
        items=item_responses
    )


# =========================================================================
# Results and Audit History
# =========================================================================

@router.get("/allocation-runs", response_model=List[AllocationRunResponse], tags=["Audit History"])
def list_allocation_runs(
    scenario_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve audit history of past allocation scenario executions."""
    query = db.query(AllocationRun)
    if scenario_id:
        query = query.filter(AllocationRun.scenario_id == scenario_id)
    runs = query.order_by(desc(AllocationRun.run_timestamp)).limit(limit).all()
    
    return [
        AllocationRunResponse(
            id=r.id,
            scenario_id=r.scenario_id,
            algorithm_version=r.algorithm_version,
            run_timestamp=r.run_timestamp,
            total_demand=r.total_demand,
            total_allocated=r.total_allocated,
            total_unmet=r.total_unmet,
            explanation_summary=r.explanation_summary,
            status=r.status,
            items=[AllocationItemResponse.model_validate(it) for it in r.items]
        )
        for r in runs
    ]


@router.get("/allocation-runs/{run_id}", response_model=AllocationRunResponse, tags=["Audit History"])
def get_allocation_run(run_id: str, db: Session = Depends(get_db)):
    """Retrieve complete audit details and itemized decisions for a specific run."""
    run = db.query(AllocationRun).filter(AllocationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Allocation run '{run_id}' not found")

    return AllocationRunResponse(
        id=run.id,
        scenario_id=run.scenario_id,
        algorithm_version=run.algorithm_version,
        run_timestamp=run.run_timestamp,
        total_demand=run.total_demand,
        total_allocated=run.total_allocated,
        total_unmet=run.total_unmet,
        explanation_summary=run.explanation_summary,
        status=run.status,
        items=[AllocationItemResponse.model_validate(it) for it in run.items]
    )


# =========================================================================
# Route Aliases for Audit Specification Compliance
# =========================================================================

@router.get("/demands", response_model=List[DemandRecordResponse], tags=["Demand Records (Alias)"])
def list_demands_alias(
    pilot_area_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Alias for /api/v1/demand-records."""
    return list_demand_records(pilot_area_id=pilot_area_id, resource_type=resource_type, db=db)


@router.get("/stock-centres", response_model=List[ResourceCentreResponse], tags=["Resource Centres (Alias)"])
def list_stock_centres_alias(
    pilot_area_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Alias for /api/v1/resource-centres."""
    return list_resource_centres(pilot_area_id=pilot_area_id, resource_type=resource_type, db=db)


@router.get("/allocations/history", response_model=List[AllocationRunResponse], tags=["Audit History (Alias)"])
def list_allocations_history_alias(
    scenario_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Alias for /api/v1/allocation-runs."""
    return list_allocation_runs(scenario_id=scenario_id, limit=limit, db=db)


@router.post("/allocations/run", response_model=AllocationRunResponse, tags=["Allocation Engine (Alias)"])
def run_general_allocation_alias(
    resource_type: Optional[str] = Query(None),
    scenario_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Alias to execute allocation against specified or latest available scenario."""
    target_scenario = None
    if scenario_id:
        target_scenario = db.query(Scenario).filter(Scenario.id == scenario_id).first()
    else:
        target_scenario = db.query(Scenario).order_by(Scenario.created_at.desc()).first()

    if not target_scenario:
        # Create a default baseline scenario if none exists
        target_scenario = Scenario(
            id="scen-baseline-default",
            name="Baseline Preemption Scenario",
            description="Auto-generated default baseline for allocation run",
            stress_level="moderate",
            objective="critical_needs_first",
            input_assumptions="{}",
            data_provenance="Default audit engine runner"
        )
        db.add(target_scenario)
        db.commit()
        db.refresh(target_scenario)

    return run_scenario_allocation(scenario_id=target_scenario.id, resource_type=resource_type, db=db)

