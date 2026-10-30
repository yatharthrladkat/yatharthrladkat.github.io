export type OperationalModule =
  | 'overview'
  | 'enso-teleconnection'
  | 'drought-risk-monitor'
  | 'risk-forecast'
  | 'relief-budget-optimizer'
  | 'scenario-lab'
  | 'claim-evidence-review'
  | 'resource-routing-logistics'
  | 'reports-and-analytics'
  | 'settings';

export type OperatingMode = 'live' | 'historical' | 'simulation';

export type StressScenario = 'mild' | 'severe' | 'extreme';

export type OptimizationObjective =
  | 'max_demand_reduction'
  | 'equitable_distribution'
  | 'critical_needs_first'
  | 'farmers'
  | 'latency'
  | 'floor'
  | 'composite';

export interface DistrictMetric {
  id: string;
  name: string;
  division: string;
  talukas: string;
  talukaCount: number;
  riskScore: number; // 0.0 - 1.0
  riskLevel: 'Critical' | 'Warning' | 'Moderate' | 'Low';
  precipDeficit: number; // e.g. -62.4
  soilMoisture: number; // e.g. 9.1
  drySpellDays: number;
  openClaims: number;
  activeClaims: number;
  farmersCount: number;
  lastAction: string;
  reqBudgetCr: number;
  baseSharePct: number;
  trend: 'up' | 'down' | 'steady';
  coordinates: { x: number; y: number };
  // ISRO SAC VEDAS Krishi-DSS Telemetry Fields
  spi3M?: number; // Standardized Precipitation Index 3-Month
  vci?: number; // Vegetation Condition Index (%)
  soilMoistureDev?: number; // Soil moisture deviation (%)
  pasgPct?: number; // % Agricultural area affected
  vedasCategory?: 'Severe' | 'Moderate' | 'Mild' | 'Normal';
  vedasLastSync?: string;
  // Reservoir and Groundwater
  reservoirStoragePct?: number;
  groundwaterDeficitM?: number;
  cattlePopulation?: number;
  vulnerableSmallholders?: number;
}

export interface ReservoirMetric {
  id: string;
  name: string;
  river: string;
  district: string;
  grossCapacityTmc: number;
  currentLiveTmc: number;
  currentPct: number;
  lastYearPct: number;
  status: 'Critical Low' | 'Depleted' | 'Moderate' | 'Adequate';
  deadStorageTmc: number;
  drinkingWaterReserveMonths: number;
}

export interface InterventionType {
  id: string;
  name: string;
  category: 'water' | 'fodder' | 'agriculture' | 'cash';
  unit: string;
  unitCostInr: number;
  defaultPriority: number;
  description: string;
  deliveryTimeDays: number;
}

export interface DistrictDemand {
  districtId: string;
  districtName: string;
  waterDemandTankerTrips: number;
  fodderDemandTonnes: number;
  contingencySeedHectares: number;
  directCashBeneficiaries: number;
  vulnerabilityWeight: number; // 0 - 1
  minServiceThresholdPct: number; // minimum % demand that MUST be met
}

export interface OptimizationParams {
  totalBudgetCr: number;
  maxTankersPerDay: number;
  availableFodderTonnes: number;
  contingencyFundCr: number;
  planningHorizonDays: 15 | 30 | 60;
  minServiceFloorPct: number;
  priorityWeights: {
    drinkingWater: number;
    fodderSecurity: number;
    cropProtection: number;
    smallholderEquity: number;
  };
  objective: 'max_demand_reduction' | 'equitable_distribution' | 'critical_needs_first';
}

export interface DistrictAllocationResult {
  districtId: string;
  districtName: string;
  riskScore: number;
  // Quantities allocated
  tankerTrips: number;
  tankerTripsDemand: number;
  tankerSatisfactionPct: number;
  fodderTonnes: number;
  fodderDemandTonnes: number;
  fodderSatisfactionPct: number;
  cropSubsidyHectares: number;
  cropSubsidyDemandHectares: number;
  directGrantBeneficiaries: number;
  // Costs in Cr
  waterCostCr: number;
  fodderCostCr: number;
  agriCostCr: number;
  cashCostCr: number;
  totalDistrictCostCr: number;
  demandReductionScore: number;
  bindingConstraintsForDistrict: string[];
}

export interface OptimizationResult {
  success: boolean;
  timestamp: string;
  totalCostCr: number;
  budgetUtilizationPct: number;
  remainingBudgetCr: number;
  overallDemandServedPct: number;
  tankersUtilized: number;
  tankerFleetCapacity: number;
  fodderUtilizedTonnes: number;
  fodderAvailableTonnes: number;
  peopleProtectedLakh: number;
  livestockProtectedLakh: number;
  districtAllocations: DistrictAllocationResult[];
  bindingConstraints: {
    constraint: string;
    resource: string;
    capacity: number | string;
    utilization: number | string;
    shadowPriceEstimated: string;
    description: string;
  }[];
  explanation: string;
  sensitivityNotes: string[];
  infeasibilityReason?: string;
  relaxationOptions?: {
    action: string;
    impact: string;
    applied: boolean;
  }[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  budgetCr: number;
  tankerCapacity: number;
  fodderTonnes: number;
  minFloorPct: number;
  focus: 'status_quo' | 'balanced' | 'essential_water';
  params: OptimizationParams;
}

export interface ConvoyRoute {
  id: string;
  orderNumber?: string;
  vehicleNo: string;
  cargoType: 'Potable Water' | 'Cattle Fodder Kits' | 'Nutri-Pouches' | 'Drought Seed Pouches';
  cargoCapacity: string;
  originDepot: string;
  targetLocation: string;
  targetTaluka: string;
  status: 'Draft' | 'Validated' | 'Approved' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled' | 'En Route - On Time' | 'Delayed +25m' | 'Loading at Depot';
  speedKmH: number;
  eta: string;
  remainingKm: number;
  progressPct: number;
  driverName: string;
  driverPhone: string;
  waypoints: { name: string; time: string; passed: boolean }[];
  pathCoordinates: string;
  assignedOfficer?: string;
  dispatchTimestamp?: string;
}

export interface FarmerClaim {
  id: string;
  farmerName: string;
  district: string;
  taluka: string;
  claimedLoss: number; // percentage
  spectralLossIndex: number; // percentage
  status: 'Genuine' | 'Needs Review' | 'Duplicate' | 'Missing Fields' | 'Pending' | 'Rejected';
  confidence: number;
  plotSizeHectares: number;
  cropType: string;
  submissionDate: string;
  dbtVoucherToken?: string;
  authorizedBy?: string;
  authorizationTimestamp?: string;
  duplicateOf?: string;
  auditNotes?: string;
}

export interface PriorityDirective {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'advisory';
  category?: 'Critical' | 'Warning' | 'Info' | 'Advisory';
  title: string;
  description: string;
  timestamp: string;
  metricLabel: string;
  actionText: string;
  targetModule?: OperationalModule;
}

export interface DepotInventory {
  id: string;
  name: string;
  region: string;
  availableCapacity: string;
  capacityPct: number;
  inTransit: number;
  statusTone: 'healthy' | 'warning' | 'critical';
  statusText: string;
}

export interface AdvisoryMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  language: 'en' | 'mr' | 'hi';
  text: string;
  timestamp: string;
  sources?: { title: string; uri: string }[];
  suggestedFollowUps?: string[];
  districtContext?: string;
  cropContext?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GroundingPlace {
  title: string;
  uri: string;
}

export interface ProteinRecord {
  accession: string;
  id: string;
  gene: string;
  proteinName: string;
  organism: string;
  length: number;
  function: string;
  uniprotLink: string;
}

export interface LiteratureRecord {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: number;
  doi?: string;
  url: string;
  abstract: string;
}

export interface UserAccount {
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
  provider: 'google' | 'gov-sso';
}

export interface EnsoTelemetryData {
  nino34Anomaly: number; // e.g. +1.48
  oniPhase: 'Strong El Niño' | 'Moderate El Niño' | 'Weak El Niño' | 'Neutral' | 'La Niña';
  soi: number; // Southern Oscillation Index, e.g. -11.4
  iodIndex: number; // Indian Ocean Dipole, e.g. +0.18
  walkerCirculationStatus: string;
  subsidenceZone: string;
  teleconnectionRisk: 'Extreme' | 'High' | 'Elevated' | 'Low';
  monsoonSuppressionPct: number; // e.g. 34%
  drySpellRiskPct: number; // e.g. 78%
  analogSeason: string;
  lastUpdated: string;
  historicalAnalogs: {
    year: string;
    nino34: string;
    phase: string;
    mpRainDeficit: string;
    outcome: string;
  }[];
}
