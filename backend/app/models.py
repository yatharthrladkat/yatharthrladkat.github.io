from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class PilotArea(Base):
    """
    Stores administrative pilot areas (e.g. Bundelkhand / Nimar districts in Madhya Pradesh).
    Clearly distinguishes real records from synthetic demonstration records via `is_synthetic`.
    """
    __tablename__ = "pilot_areas"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    state = Column(String(64), default="Madhya Pradesh", nullable=False)
    division = Column(String(128), nullable=False)
    talukas = Column(String(512), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_synthetic = Column(Boolean, default=True, nullable=False)
    provenance_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    resource_centres = relationship("ResourceCentre", back_populates="pilot_area", cascade="all, delete-orphan")
    demand_records = relationship("DemandRecord", back_populates="pilot_area", cascade="all, delete-orphan")
    allocation_items = relationship("AllocationItem", back_populates="pilot_area")


class ResourceCentre(Base):
    """
    Physical supply depot, reservoir headwork, or grain godown with available relief stock.
    Enforces available_stock >= 0 constraint to prevent negative balances.
    """
    __tablename__ = "resource_centres"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    pilot_area_id = Column(String(64), ForeignKey("pilot_areas.id"), nullable=False, index=True)
    location_identifier = Column(String(128), nullable=False)
    resource_type = Column(String(64), nullable=False, index=True)  # e.g., tanker_water, fodder_tonnes
    available_stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(32), nullable=False)  # e.g., trips, tonnes, kits, beneficiaries
    is_synthetic = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("available_stock >= 0", name="chk_stock_non_negative"),
    )

    pilot_area = relationship("PilotArea", back_populates="resource_centres")
    allocation_items = relationship("AllocationItem", back_populates="resource_centre")


class DemandRecord(Base):
    """
    Relief demand requirements per pilot area.
    Clearly labels whether values are estimated, observed, or synthetic.
    """
    __tablename__ = "demand_records"

    id = Column(String(64), primary_key=True, index=True)
    pilot_area_id = Column(String(64), ForeignKey("pilot_areas.id"), nullable=False, index=True)
    resource_type = Column(String(64), nullable=False, index=True)
    estimated_demand = Column(Float, nullable=False)
    priority = Column(Integer, nullable=False, default=1)  # 1 = Critical, 2 = High, 3 = Moderate, 4 = Low
    observation_date = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    value_category = Column(String(32), nullable=False, default="synthetic")  # 'estimated', 'observed', 'synthetic'
    is_synthetic = Column(Boolean, default=True, nullable=False)
    data_source = Column(String(128), nullable=False, default="MP_SDMA_DROUGHT_MANUAL_SYNTHETIC")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("estimated_demand >= 0", name="chk_demand_non_negative"),
        CheckConstraint("priority >= 1 AND priority <= 5", name="chk_priority_valid_range"),
    )

    pilot_area = relationship("PilotArea", back_populates="demand_records")


class Scenario(Base):
    """
    Allocation scenario defining input assumptions, stress levels, and data provenance.
    """
    __tablename__ = "scenarios"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    stress_level = Column(String(32), default="severe", nullable=False)  # mild, severe, extreme
    objective = Column(String(64), default="critical_needs_first", nullable=False)
    input_assumptions = Column(Text, nullable=False)  # JSON-encoded assumptions
    data_provenance = Column(String(256), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    runs = relationship("AllocationRun", back_populates="scenario", cascade="all, delete-orphan")


class AllocationRun(Base):
    """
    Audit history for each execution of the allocation engine.
    Records timestamp, algorithm version, input scenario, and summary outcomes.
    """
    __tablename__ = "allocation_runs"

    id = Column(String(64), primary_key=True, index=True)
    scenario_id = Column(String(64), ForeignKey("scenarios.id"), nullable=False, index=True)
    algorithm_version = Column(String(64), default="v1.0.0-deterministic-greedy", nullable=False)
    run_timestamp = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    total_demand = Column(Float, nullable=False, default=0.0)
    total_allocated = Column(Float, nullable=False, default=0.0)
    total_unmet = Column(Float, nullable=False, default=0.0)
    explanation_summary = Column(Text, nullable=True)
    status = Column(String(32), default="completed", nullable=False)

    scenario = relationship("Scenario", back_populates="runs")
    items = relationship("AllocationItem", back_populates="run", cascade="all, delete-orphan")


class AllocationItem(Base):
    """
    Individual line item in an allocation run, matching resource centre to pilot area demand.
    """
    __tablename__ = "allocation_items"

    id = Column(String(64), primary_key=True, index=True)
    run_id = Column(String(64), ForeignKey("allocation_runs.id"), nullable=False, index=True)
    pilot_area_id = Column(String(64), ForeignKey("pilot_areas.id"), nullable=False)
    resource_centre_id = Column(String(64), ForeignKey("resource_centres.id"), nullable=False)
    resource_type = Column(String(64), nullable=False)
    demand_quantity = Column(Float, nullable=False)
    allocated_quantity = Column(Float, nullable=False)
    unmet_quantity = Column(Float, nullable=False)
    priority = Column(Integer, nullable=False)
    rationale = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("allocated_quantity >= 0", name="chk_allocated_non_negative"),
        CheckConstraint("unmet_quantity >= 0", name="chk_unmet_non_negative"),
    )

    run = relationship("AllocationRun", back_populates="items")
    pilot_area = relationship("PilotArea", back_populates="allocation_items")
    resource_centre = relationship("ResourceCentre", back_populates="allocation_items")
