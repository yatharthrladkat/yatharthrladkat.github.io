from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


# --- Pilot Area Schemas ---
class PilotAreaBase(BaseModel):
    id: str = Field(..., description="Unique alphanumeric identifier (e.g. 'tikamgarh')")
    name: str = Field(..., min_length=2, max_length=128)
    state: str = Field(default="Madhya Pradesh", max_length=64)
    division: str = Field(..., max_length=128)
    talukas: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_synthetic: bool = Field(default=True, description="True if synthetic demonstration data, False for verified state data")
    provenance_notes: Optional[str] = None


class PilotAreaCreate(PilotAreaBase):
    pass


class PilotAreaResponse(PilotAreaBase):
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Resource Centre Schemas ---
class ResourceCentreBase(BaseModel):
    id: str = Field(..., description="Identifier (e.g. 'rc-sagar-depot')")
    name: str = Field(..., min_length=2, max_length=128)
    pilot_area_id: str
    location_identifier: str
    resource_type: str = Field(..., description="Resource category, e.g. 'tanker_water', 'fodder_tonnes'")
    available_stock: float = Field(..., ge=0.0, description="Available stock, must be non-negative")
    unit: str = Field(..., description="Unit of measure, e.g. 'trips', 'tonnes'")
    is_synthetic: bool = Field(default=True)


class ResourceCentreCreate(ResourceCentreBase):
    pass


class ResourceCentreUpdateStock(BaseModel):
    available_stock: float = Field(..., ge=0.0, description="Stock must be non-negative")


class ResourceCentreResponse(ResourceCentreBase):
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Demand Record Schemas ---
class DemandRecordBase(BaseModel):
    id: str
    pilot_area_id: str
    resource_type: str
    estimated_demand: float = Field(..., ge=0.0, description="Demand quantity must be >= 0")
    priority: int = Field(default=1, ge=1, le=5, description="Priority level from 1 (highest/critical) to 5 (lowest)")
    value_category: str = Field(default="synthetic", description="One of 'estimated', 'observed', 'synthetic'")
    is_synthetic: bool = Field(default=True)
    data_source: str = Field(default="MP_SDMA_DROUGHT_MANUAL_SYNTHETIC")


class DemandRecordCreate(DemandRecordBase):
    pass


class DemandRecordResponse(DemandRecordBase):
    observation_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Scenario Schemas ---
class ScenarioCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=3, max_length=128)
    description: Optional[str] = None
    stress_level: str = Field(default="severe", pattern="^(mild|severe|extreme)$")
    objective: str = Field(default="critical_needs_first", pattern="^(critical_needs_first|equitable_distribution|max_demand_reduction)$")
    input_assumptions: Dict[str, Any] = Field(default_factory=dict)
    data_provenance: str = Field(..., min_length=3, max_length=256)


class ScenarioResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    stress_level: str
    objective: str
    input_assumptions: Dict[str, Any]
    data_provenance: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Allocation Engine Schemas ---
class AllocationItemResponse(BaseModel):
    id: str
    run_id: str
    pilot_area_id: str
    resource_centre_id: str
    resource_type: str
    demand_quantity: float
    allocated_quantity: float
    unmet_quantity: float
    priority: int
    rationale: Optional[str] = None

    model_config = {"from_attributes": True}


class AllocationRunResponse(BaseModel):
    id: str
    scenario_id: str
    algorithm_version: str
    run_timestamp: datetime
    total_demand: float
    total_allocated: float
    total_unmet: float
    explanation_summary: Optional[str]
    status: str
    items: List[AllocationItemResponse] = []

    model_config = {"from_attributes": True}


class AllocationExecutionRequest(BaseModel):
    scenario_id: str
    resource_type_filter: Optional[str] = None
