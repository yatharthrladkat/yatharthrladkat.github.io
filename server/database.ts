import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'app_database.json');

export interface PilotAreaEntity {
  id: string;
  name: string;
  state: string;
  division: string;
  talukas?: string;
  latitude: number;
  longitude: number;
  is_synthetic: boolean;
  provenance_notes?: string;
  created_at: string;
}

export interface ResourceCentreEntity {
  id: string;
  name: string;
  pilot_area_id: string;
  location_identifier: string;
  resource_type: string;
  available_stock: number;
  unit: string;
  is_synthetic: boolean;
  updated_at: string;
}

export interface DemandRecordEntity {
  id: string;
  pilot_area_id: string;
  resource_type: string;
  estimated_demand: number;
  priority: number;
  observation_date: string;
  value_category: 'estimated' | 'observed' | 'synthetic';
  is_synthetic: boolean;
  data_source: string;
  created_at: string;
}

export interface ScenarioEntity {
  id: string;
  name: string;
  description?: string;
  stress_level: 'mild' | 'severe' | 'extreme';
  objective: 'critical_needs_first' | 'equitable_distribution' | 'max_demand_reduction';
  input_assumptions: Record<string, any>;
  data_provenance: string;
  created_at: string;
}

export interface AllocationItemEntity {
  id: string;
  run_id: string;
  pilot_area_id: string;
  resource_centre_id: string;
  resource_type: string;
  demand_quantity: number;
  allocated_quantity: number;
  unmet_quantity: number;
  priority: number;
  rationale?: string;
}

export interface AllocationRunEntity {
  id: string;
  scenario_id: string;
  algorithm_version: string;
  run_timestamp: string;
  total_demand: number;
  total_allocated: number;
  total_unmet: number;
  explanation_summary?: string;
  status: string;
  items: AllocationItemEntity[];
}

export interface ConvoyOrderEntity {
  id: string;
  order_number: string;
  vehicle_no: string;
  origin_depot: string;
  target_taluka: string;
  cargo_type: string;
  cargo_capacity: string;
  status: 'Draft' | 'Validated' | 'Approved' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled';
  speed_kmh: number;
  eta: string;
  remaining_km: number;
  progress_pct: number;
  driver_name: string;
  driver_phone: string;
  assigned_officer: string;
  created_at: string;
  updated_at: string;
  audit_log: string[];
}

export interface DistressClaimEntity {
  id: string;
  farmer_name: string;
  district: string;
  taluka: string;
  claimed_loss: number;
  spectral_loss_index: number;
  variance: number;
  status: 'Pending' | 'Genuine' | 'Needs Review' | 'Duplicate' | 'Rejected';
  confidence: number;
  plot_size_hectares: number;
  crop_type: string;
  khasra_record: string;
  submission_date: string;
  authorized_at?: string;
  authorized_by?: string;
  dbt_voucher_token?: string;
  audit_notes?: string;
}

export interface ScarcityDirectiveEntity {
  id: string;
  severity: 'critical' | 'warning' | 'advisory';
  title: string;
  description: string;
  timestamp: string;
  metric_label: string;
  action_text: string;
  target_module: string;
  is_active: boolean;
  dismissed_at?: string;
}

export interface AppDatabaseSchema {
  version: string;
  last_updated: string;
  pilot_areas: PilotAreaEntity[];
  resource_centres: ResourceCentreEntity[];
  demand_records: DemandRecordEntity[];
  scenarios: ScenarioEntity[];
  allocation_runs: AllocationRunEntity[];
  convoys: ConvoyOrderEntity[];
  claims: DistressClaimEntity[];
  directives: ScarcityDirectiveEntity[];
}

class AppDatabase {
  private db: AppDatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): AppDatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('Failed to parse existing DB file, re-initializing seeds:', err);
      }
    }

    const initial = this.getInitialSeed();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(data?: AppDatabaseSchema): void {
    const toSave = data || this.db;
    toSave.last_updated = new Date().toISOString();
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(toSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Pilot Areas ---
  getPilotAreas(): PilotAreaEntity[] {
    return [...this.db.pilot_areas];
  }

  getPilotArea(id: string): PilotAreaEntity | undefined {
    return this.db.pilot_areas.find(p => p.id === id);
  }

  addPilotArea(area: PilotAreaEntity): PilotAreaEntity {
    this.db.pilot_areas.push(area);
    this.saveDatabase();
    return area;
  }

  // --- Resource Centres / Depots ---
  getResourceCentres(pilotAreaId?: string, resourceType?: string): ResourceCentreEntity[] {
    return this.db.resource_centres.filter(c => {
      if (pilotAreaId && c.pilot_area_id !== pilotAreaId) return false;
      if (resourceType && c.resource_type !== resourceType) return false;
      return true;
    });
  }

  getResourceCentre(id: string): ResourceCentreEntity | undefined {
    return this.db.resource_centres.find(c => c.id === id);
  }

  updateStock(centreId: string, stock: number): ResourceCentreEntity {
    if (stock < 0) {
      throw new Error(`Stock validation failed: Available stock cannot be negative (provided: ${stock}).`);
    }
    const centre = this.db.resource_centres.find(c => c.id === centreId);
    if (!centre) {
      throw new Error(`Resource centre '${centreId}' not found.`);
    }
    centre.available_stock = stock;
    centre.updated_at = new Date().toISOString();
    this.saveDatabase();
    return centre;
  }

  // --- Demand Records ---
  getDemandRecords(pilotAreaId?: string, resourceType?: string): DemandRecordEntity[] {
    return this.db.demand_records.filter(d => {
      if (pilotAreaId && d.pilot_area_id !== pilotAreaId) return false;
      if (resourceType && d.resource_type !== resourceType) return false;
      return true;
    });
  }

  addDemandRecord(demand: DemandRecordEntity): DemandRecordEntity {
    this.db.demand_records.push(demand);
    this.saveDatabase();
    return demand;
  }

  // --- Scenarios ---
  getScenarios(): ScenarioEntity[] {
    return [...this.db.scenarios];
  }

  getScenario(id: string): ScenarioEntity | undefined {
    return this.db.scenarios.find(s => s.id === id);
  }

  addScenario(scen: ScenarioEntity): ScenarioEntity {
    this.db.scenarios.unshift(scen);
    this.saveDatabase();
    return scen;
  }

  // --- Allocation Runs & Items ---
  getAllocationRuns(scenarioId?: string, limit = 20): AllocationRunEntity[] {
    let list = this.db.allocation_runs;
    if (scenarioId) {
      list = list.filter(r => r.scenario_id === scenarioId);
    }
    return list.slice(0, limit);
  }

  getAllocationRun(id: string): AllocationRunEntity | undefined {
    return this.db.allocation_runs.find(r => r.id === id);
  }

  addAllocationRun(run: AllocationRunEntity): AllocationRunEntity {
    this.db.allocation_runs.unshift(run);
    this.saveDatabase();
    return run;
  }

  // --- Convoys & Orders ---
  getConvoys(statusFilter?: string): ConvoyOrderEntity[] {
    if (!statusFilter || statusFilter === 'all') {
      return [...this.db.convoys];
    }
    return this.db.convoys.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
  }

  getConvoy(id: string): ConvoyOrderEntity | undefined {
    return this.db.convoys.find(c => c.id === id);
  }

  createConvoyOrder(order: {
    origin_depot: string;
    target_taluka: string;
    cargo_type: string;
    cargo_capacity: string;
    assigned_officer?: string;
  }): ConvoyOrderEntity {
    // 1. Validation: Verify destination & capacity
    if (!order.origin_depot || !order.target_taluka) {
      throw new Error('Validation failed: origin_depot and target_taluka are required.');
    }
    if (!order.cargo_capacity) {
      throw new Error('Validation failed: cargo_capacity is required.');
    }

    // 2. Depot inventory deduction: Check if a matching depot exists and reserve
    const depotMatch = this.db.resource_centres.find(d =>
      d.name.toLowerCase().includes(order.origin_depot.toLowerCase().split(' ')[0]) ||
      order.origin_depot.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
    );

    const deductionUnits = order.cargo_type.toLowerCase().includes('water') ? 1 : 10;
    if (depotMatch) {
      if (depotMatch.available_stock < deductionUnits) {
        throw new Error(
          `Insufficient stock at depot '${depotMatch.name}': requires ${deductionUnits} ${depotMatch.unit}, but only ${depotMatch.available_stock} available.`
        );
      }
      depotMatch.available_stock = Number((depotMatch.available_stock - deductionUnits).toFixed(1));
      depotMatch.updated_at = new Date().toISOString();
    }

    const orderNumber = `ORD-MP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const regNum = Math.floor(1000 + Math.random() * 9000);
    const districtPrefix = Math.floor(10 + Math.random() * 40);

    const newOrder: ConvoyOrderEntity = {
      id: orderNumber,
      order_number: orderNumber,
      vehicle_no: `MP-${districtPrefix}-TX-${regNum}`,
      origin_depot: order.origin_depot,
      target_taluka: order.target_taluka,
      cargo_type: order.cargo_type,
      cargo_capacity: order.cargo_capacity,
      status: 'Dispatched',
      speed_kmh: 52,
      eta: '02:30 IST (Pre-Cleared)',
      remaining_km: 78,
      progress_pct: 15,
      driver_name: 'Rameshwar Lodhi',
      driver_phone: '+91 98261 44019',
      assigned_officer: order.assigned_officer || 'State Relief Officer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audit_log: [
        `Order ${orderNumber} authorized by ${order.assigned_officer || 'Relief Officer'} at ${new Date().toLocaleTimeString('en-IN')}`,
        `FASTag Disaster Exemption Token FASTAG-DIS-MP-${Math.floor(10000 + Math.random() * 90000)} generated.`,
        depotMatch ? `Deducted ${deductionUnits} ${depotMatch.unit} from ${depotMatch.name} (remaining: ${depotMatch.available_stock}).` : 'No direct depot link deducted.'
      ]
    };

    this.db.convoys.unshift(newOrder);
    this.saveDatabase();
    return newOrder;
  }

  updateConvoyStatus(
    id: string,
    newStatus: ConvoyOrderEntity['status'],
    reason?: string
  ): ConvoyOrderEntity {
    const convoy = this.db.convoys.find(c => c.id === id);
    if (!convoy) {
      throw new Error(`Convoy deployment order '${id}' not found.`);
    }

    const oldStatus = convoy.status;
    convoy.status = newStatus;
    convoy.updated_at = new Date().toISOString();
    convoy.audit_log.push(
      `Status changed from ${oldStatus} to ${newStatus} at ${new Date().toLocaleTimeString('en-IN')}${reason ? ` (${reason})` : ''}`
    );

    // If cancelled, release stock back to depot
    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
      const depotMatch = this.db.resource_centres.find(d =>
        d.name.toLowerCase().includes(convoy.origin_depot.toLowerCase().split(' ')[0])
      );
      if (depotMatch) {
        const units = convoy.cargo_type.toLowerCase().includes('water') ? 1 : 10;
        depotMatch.available_stock = Number((depotMatch.available_stock + units).toFixed(1));
        depotMatch.updated_at = new Date().toISOString();
        convoy.audit_log.push(`Restored ${units} ${depotMatch.unit} to ${depotMatch.name}.`);
      }
    }

    this.saveDatabase();
    return convoy;
  }

  // --- Claims Management ---
  getClaims(district?: string, status?: string, search?: string): DistressClaimEntity[] {
    return this.db.claims.filter(c => {
      if (district && district !== 'all' && c.district.toLowerCase() !== district.toLowerCase()) return false;
      if (status && status !== 'all' && c.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!c.id.toLowerCase().includes(s) && !c.farmer_name.toLowerCase().includes(s)) {
          return false;
        }
      }
      return true;
    });
  }

  getClaim(id: string): DistressClaimEntity | undefined {
    return this.db.claims.find(c => c.id === id);
  }

  authorizeClaim(id: string, authorizedBy = 'State Relief Officer'): DistressClaimEntity {
    const claim = this.db.claims.find(c => c.id === id);
    if (!claim) {
      throw new Error(`Distress claim '${id}' not found.`);
    }
    if (claim.status === 'Duplicate') {
      throw new Error(`Cannot authorize duplicate parcel claim '${id}'. Manual field review required.`);
    }

    const variance = Math.abs(claim.claimed_loss - claim.spectral_loss_index);
    if (variance > 25) {
      throw new Error(
        `Authorization rejected: Spectral variance is ${variance}% (tolerance ceiling: 25%). Field inspection required.`
      );
    }

    const token = `DBT-MP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    claim.status = 'Genuine';
    claim.authorized_at = new Date().toISOString();
    claim.authorized_by = authorizedBy;
    claim.dbt_voucher_token = token;
    claim.audit_notes = `Digitally authorized under PMFBY Rule 14.2; DBT token ${token} issued.`;

    this.saveDatabase();
    return claim;
  }

  batchAuthorizeClaims(claimIds?: string[], authorizedBy = 'State Relief Officer'): DistressClaimEntity[] {
    const targetClaims = this.db.claims.filter(c => {
      if (claimIds && claimIds.length > 0 && !claimIds.includes(c.id)) return false;
      if (c.status === 'Duplicate') return false;
      const variance = Math.abs(c.claimed_loss - c.spectral_loss_index);
      return variance <= 15; // Strict tolerance for batch authorization
    });

    const now = new Date().toISOString();
    for (const c of targetClaims) {
      c.status = 'Genuine';
      c.authorized_at = now;
      c.authorized_by = authorizedBy;
      c.dbt_voucher_token = `DBT-MP-BATCH-${Math.floor(100000 + Math.random() * 900000)}`;
      c.audit_notes = `Batch authorized (spectral variance: ${Math.abs(c.claimed_loss - c.spectral_loss_index)}% <= 15%).`;
    }

    this.saveDatabase();
    return targetClaims;
  }

  updateClaimStatus(id: string, status: DistressClaimEntity['status'], notes?: string): DistressClaimEntity {
    const claim = this.db.claims.find(c => c.id === id);
    if (!claim) {
      throw new Error(`Claim '${id}' not found.`);
    }
    claim.status = status;
    claim.audit_notes = notes || `Status updated to ${status} on ${new Date().toLocaleTimeString('en-IN')}`;
    this.saveDatabase();
    return claim;
  }

  // --- Directives ---
  getDirectives(): ScarcityDirectiveEntity[] {
    return this.db.directives.filter(d => d.is_active);
  }

  dismissDirective(id: string): ScarcityDirectiveEntity {
    const directive = this.db.directives.find(d => d.id === id);
    if (!directive) {
      throw new Error(`Directive '${id}' not found.`);
    }
    directive.is_active = false;
    directive.dismissed_at = new Date().toISOString();
    this.saveDatabase();
    return directive;
  }

  // --- Initial Seed Generator ---
  private getInitialSeed(): AppDatabaseSchema {
    return {
      version: '1.2.0',
      last_updated: new Date().toISOString(),
      pilot_areas: [
        {
          id: 'tikamgarh',
          name: 'Tikamgarh',
          state: 'Madhya Pradesh',
          division: 'Sagar Division (Bundelkhand)',
          talukas: 'Baldeogarh, Jatara, Palera, Mohangarh, Tikamgarh',
          latitude: 24.745,
          longitude: 78.835,
          is_synthetic: true,
          provenance_notes: 'Bundelkhand rain-shadow drought preemption profile.',
          created_at: new Date().toISOString()
        },
        {
          id: 'chhatarpur',
          name: 'Chhatarpur',
          state: 'Madhya Pradesh',
          division: 'Sagar Division (Bundelkhand)',
          talukas: 'Nowgong, Rajnagar, Bijawar, Bada Malhera, Chhatarpur',
          latitude: 24.9164,
          longitude: 79.5811,
          is_synthetic: true,
          provenance_notes: 'Bundelkhand agrarian drought indices.',
          created_at: new Date().toISOString()
        },
        {
          id: 'barwani',
          name: 'Barwani',
          state: 'Madhya Pradesh',
          division: 'Indore Division (Nimar)',
          talukas: 'Sendhwa, Pansemal, Rajpur, Thikri, Barwani',
          latitude: 22.036,
          longitude: 74.903,
          is_synthetic: true,
          provenance_notes: 'Tribal dryland agricultural belt in Nimar.',
          created_at: new Date().toISOString()
        },
        {
          id: 'sheopur',
          name: 'Sheopur',
          state: 'Madhya Pradesh',
          division: 'Chambal Division',
          talukas: 'Vijaypur, Karahal, Sheopur',
          latitude: 25.669,
          longitude: 76.698,
          is_synthetic: true,
          provenance_notes: 'Arid Chambal ravines zone.',
          created_at: new Date().toISOString()
        },
        {
          id: 'panna',
          name: 'Panna',
          state: 'Madhya Pradesh',
          division: 'Sagar Division (Bundelkhand)',
          talukas: 'Ajaigarh, Pawai, Shahnagar, Gunnor, Panna',
          latitude: 24.72,
          longitude: 80.19,
          is_synthetic: true,
          provenance_notes: 'Ken-Betwa river basin rain-shadow sector.',
          created_at: new Date().toISOString()
        }
      ],
      resource_centres: [
        {
          id: 'rc-sagar-depot',
          name: 'Sagar Bundelkhand Regional Grain Depot (APMC)',
          pilot_area_id: 'tikamgarh',
          location_identifier: 'APMC-SGR-01 (23.8388, 78.7378)',
          resource_type: 'fodder_tonnes',
          available_stock: 1450.0,
          unit: 'tonnes',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 'rc-gandhi-sagar',
          name: 'Gandhi Sagar Dam Headworks Staging Hub',
          pilot_area_id: 'tikamgarh',
          location_identifier: 'GSD-HEAD-01 (24.7061, 75.7336)',
          resource_type: 'tanker_water',
          available_stock: 850.0,
          unit: 'trips',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 'rc-nowgong-fodder',
          name: 'Nowgong Veterinary & Fodder Depot',
          pilot_area_id: 'chhatarpur',
          location_identifier: 'VET-NWG-02 (25.0560, 79.4420)',
          resource_type: 'fodder_tonnes',
          available_stock: 920.0,
          unit: 'tonnes',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 'rc-chhatarpur-water',
          name: 'Chhatarpur Municipal Hydrant Staging Depot',
          pilot_area_id: 'chhatarpur',
          location_identifier: 'CHH-HYD-04 (24.9160, 79.5800)',
          resource_type: 'tanker_water',
          available_stock: 620.0,
          unit: 'trips',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 'rc-sendhwa-seed',
          name: 'Sendhwa Tribal Agricultural Seed Bank',
          pilot_area_id: 'barwani',
          location_identifier: 'SND-SEED-01 (21.6880, 75.0930)',
          resource_type: 'seed_kits',
          available_stock: 3500.0,
          unit: 'kits',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        },
        {
          id: 'rc-barwani-water',
          name: 'Narmada Riverbed Extraction Depot Barwani',
          pilot_area_id: 'barwani',
          location_identifier: 'NRM-BRW-02 (22.0360, 74.9030)',
          resource_type: 'tanker_water',
          available_stock: 480.0,
          unit: 'trips',
          is_synthetic: true,
          updated_at: new Date().toISOString()
        }
      ],
      demand_records: [
        {
          id: 'dem-tikamgarh-water-01',
          pilot_area_id: 'tikamgarh',
          resource_type: 'tanker_water',
          estimated_demand: 580.0,
          priority: 1,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        },
        {
          id: 'dem-tikamgarh-fodder-01',
          pilot_area_id: 'tikamgarh',
          resource_type: 'fodder_tonnes',
          estimated_demand: 820.0,
          priority: 2,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        },
        {
          id: 'dem-chhatarpur-water-01',
          pilot_area_id: 'chhatarpur',
          resource_type: 'tanker_water',
          estimated_demand: 510.0,
          priority: 1,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        },
        {
          id: 'dem-chhatarpur-fodder-01',
          pilot_area_id: 'chhatarpur',
          resource_type: 'fodder_tonnes',
          estimated_demand: 740.0,
          priority: 2,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        },
        {
          id: 'dem-barwani-water-01',
          pilot_area_id: 'barwani',
          resource_type: 'tanker_water',
          estimated_demand: 380.0,
          priority: 1,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        },
        {
          id: 'dem-barwani-seed-01',
          pilot_area_id: 'barwani',
          resource_type: 'seed_kits',
          estimated_demand: 2800.0,
          priority: 3,
          observation_date: new Date().toISOString(),
          value_category: 'synthetic',
          is_synthetic: true,
          data_source: 'SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK',
          created_at: new Date().toISOString()
        }
      ],
      scenarios: [
        {
          id: 'scen-bundelkhand-severe-baseline',
          name: 'Bundelkhand Severe Drought Baseline',
          description: 'Standard contingency preemption run prioritizing emergency drinking water tankers and cattle fodder.',
          stress_level: 'severe',
          objective: 'critical_needs_first',
          input_assumptions: { budget_ceiling_cr: 85.0, tanker_contingency_days: 30, floor_service_level_pct: 50 },
          data_provenance: 'Synthetic assumptions calibrated to MP Relief Code Table 4 guidelines.',
          created_at: new Date().toISOString()
        },
        {
          id: 'scen-equitable-fair-share',
          name: 'Statewide Equitable Resource Rationing',
          description: 'Proportional rationing scenario ensuring each vulnerable district receives an equitable percentage of its registered demand.',
          stress_level: 'extreme',
          objective: 'equitable_distribution',
          input_assumptions: { budget_ceiling_cr: 60.0, equity_tolerance_pct: 5.0, min_quota_per_district_pct: 40 },
          data_provenance: 'Synthetic multi-district rationing test scenario.',
          created_at: new Date().toISOString()
        }
      ],
      allocation_runs: [],
      convoys: [
        {
          id: 'ORD-MP-2026-4019',
          order_number: 'ORD-MP-2026-4019',
          vehicle_no: 'MP-36-T-8821',
          origin_depot: 'Sagar Bundelkhand Regional Grain & Water Reserve',
          target_taluka: 'Baldeogarh (Tikamgarh)',
          cargo_type: 'Potable Water',
          cargo_capacity: '20,000 Litres',
          status: 'In Transit',
          speed_kmh: 48,
          eta: '11:15 IST (25 min)',
          remaining_km: 24,
          progress_pct: 72,
          driver_name: 'Rameshwar Lodhi',
          driver_phone: '+91 98261 44019',
          assigned_officer: 'Yatharth Ladkat (State Relief Officer)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          audit_log: [
            'Order generated and pre-cleared by Relief Cell',
            'Disaster FASTag Toll Exemption validated at NH-44 Naka'
          ]
        },
        {
          id: 'ORD-MP-2026-4025',
          order_number: 'ORD-MP-2026-4025',
          vehicle_no: 'MP-16-G-4412',
          origin_depot: 'Chhatarpur Regional Reserve Depot',
          target_taluka: 'Nowgong (Chhatarpur)',
          cargo_type: 'Cattle Fodder Kits',
          cargo_capacity: '14 Metric Tonnes',
          status: 'In Transit',
          speed_kmh: 52,
          eta: '10:45 IST (15 min)',
          remaining_km: 16,
          progress_pct: 80,
          driver_name: 'Gopal Yadav',
          driver_phone: '+91 94250 77104',
          assigned_officer: 'Yatharth Ladkat (State Relief Officer)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          audit_log: ['Order approved; fodder consignment weighted at APMC Nowgong']
        },
        {
          id: 'ORD-MP-2026-4031',
          order_number: 'ORD-MP-2026-4031',
          vehicle_no: 'MP-09-U-1288',
          origin_depot: 'Indore Nimar Transit Sub-Station',
          target_taluka: 'Sendhwa (Barwani)',
          cargo_type: 'Potable Water',
          cargo_capacity: '20,000 Litres',
          status: 'Dispatched',
          speed_kmh: 36,
          eta: '12:30 IST (1h 05m)',
          remaining_km: 42,
          progress_pct: 48,
          driver_name: 'Vikram Singh Chouhan',
          driver_phone: '+91 97552 88288',
          assigned_officer: 'Yatharth Ladkat (State Relief Officer)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          audit_log: ['Dispatched from Indore staging headworks']
        }
      ],
      claims: [
        {
          id: 'CLM-MP-2026-9812',
          farmer_name: 'Ramkishore Lodhi',
          district: 'Tikamgarh',
          taluka: 'Baldeogarh',
          claimed_loss: 88,
          spectral_loss_index: 84,
          variance: 4,
          status: 'Genuine',
          confidence: 97.2,
          plot_size_hectares: 2.8,
          crop_type: 'Soybean (JS-9560)',
          khasra_record: 'MP-TIK-BAL-2026-44102',
          submission_date: '21 Oct 2026',
          authorized_at: '2026-10-24T09:15:00Z',
          authorized_by: 'State Relief Officer, Grade I',
          dbt_voucher_token: 'DBT-MP-2026-881920',
          audit_notes: 'Sentinel-2 NDVI spectral loss verified (84% vs 88% reported).'
        },
        {
          id: 'CLM-MP-2026-9813',
          farmer_name: 'Harprasad Yadav',
          district: 'Chhatarpur',
          taluka: 'Nowgong',
          claimed_loss: 92,
          spectral_loss_index: 56,
          variance: 36,
          status: 'Needs Review',
          confidence: 69.4,
          plot_size_hectares: 4.5,
          crop_type: 'Mustard & Soybean',
          khasra_record: 'MP-CHH-NWG-2026-11804',
          submission_date: '21 Oct 2026',
          audit_notes: 'High variance detected (Δ 36%). Ground verification scheduled with Block Agriculture Officer.'
        },
        {
          id: 'CLM-MP-2026-9814',
          farmer_name: 'Mansaram Bhil',
          district: 'Barwani',
          taluka: 'Sendhwa',
          claimed_loss: 78,
          spectral_loss_index: 81,
          variance: 3,
          status: 'Genuine',
          confidence: 98.4,
          plot_size_hectares: 1.8,
          crop_type: 'Bt Cotton',
          khasra_record: 'MP-BRW-SND-2026-90214',
          submission_date: '22 Oct 2026',
          authorized_at: '2026-10-24T10:00:00Z',
          authorized_by: 'State Relief Officer, Grade I',
          dbt_voucher_token: 'DBT-MP-2026-881922',
          audit_notes: 'Vegetation condition index (VCI) confirms severe leaf desiccation.'
        },
        {
          id: 'CLM-MP-2026-9815',
          farmer_name: 'Jagdish Meena',
          district: 'Sheopur',
          taluka: 'Karahal',
          claimed_loss: 45,
          spectral_loss_index: 42,
          variance: 3,
          status: 'Pending',
          confidence: 95.5,
          plot_size_hectares: 3.2,
          crop_type: 'Pearl Millet (Bajra)',
          khasra_record: 'MP-SHP-KRH-2026-55102',
          submission_date: '23 Oct 2026'
        },
        {
          id: 'CLM-MP-2026-9816',
          farmer_name: 'Devendra Patidar',
          district: 'Khargone',
          taluka: 'Kasrawad',
          claimed_loss: 75,
          spectral_loss_index: 73,
          variance: 2,
          status: 'Pending',
          confidence: 96.8,
          plot_size_hectares: 2.1,
          crop_type: 'Nimari Chilli & Cotton',
          khasra_record: 'MP-KHG-KSW-2026-33910',
          submission_date: '23 Oct 2026'
        },
        {
          id: 'CLM-MP-2026-9817',
          farmer_name: 'Gajendra Singh',
          district: 'Chhatarpur',
          taluka: 'Nowgong',
          claimed_loss: 85,
          spectral_loss_index: 82,
          variance: 3,
          status: 'Duplicate',
          confidence: 30.0,
          plot_size_hectares: 4.5,
          crop_type: 'Soybean',
          khasra_record: 'MP-CHH-NWG-2026-11804', // Same khasra as Harprasad Yadav
          submission_date: '24 Oct 2026',
          audit_notes: 'Duplicate parcel claim detected: overlapping Khasra record with CLM-MP-2026-9813.'
        }
      ],
      directives: [
        {
          id: 'DIR-01',
          severity: 'critical',
          title: 'Gandhi Sagar Dam live storage critical threshold',
          description: 'Chambal basin usable storage down to 18.7%. Emergency drinking water preservation order enforced.',
          timestamp: 'Today, 08:30 IST',
          metric_label: '18.7% live storage',
          action_text: 'Issue order',
          target_module: 'resource-routing-logistics',
          is_active: true
        },
        {
          id: 'DIR-02',
          severity: 'critical',
          title: 'Bundelkhand Drought Tranche B approval pending',
          description: '₹45.0 Cr requisition for Baldeogarh & Nowgong tehsils requires MP Relief Cell digital approval.',
          timestamp: 'Today, 07:45 IST',
          metric_label: '₹45.0 Cr requisition',
          action_text: 'Review tranche',
          target_module: 'relief-budget-optimizer',
          is_active: true
        },
        {
          id: 'DIR-03',
          severity: 'warning',
          title: 'NH-44 Lalitpur-Sagar culvert diversion',
          description: 'Bridge maintenance near Babina. Water tanker convoy MP-36-T-8821 rerouted via State Highway SH-19.',
          timestamp: 'Today, 06:15 IST',
          metric_label: '+20 min detour',
          action_text: 'View route',
          target_module: 'resource-routing-logistics',
          is_active: true
        },
        {
          id: 'DIR-04',
          severity: 'warning',
          title: 'Barwani Sendhwa tribal belt fodder deficit',
          description: 'Depot stock at Sendhwa camp down to 2 days reserve; 45 MT fodder convoy dispatched from Indore.',
          timestamp: 'Yesterday, 18:20 IST',
          metric_label: '2 days stock',
          action_text: 'Authorize dispatch',
          target_module: 'resource-routing-logistics',
          is_active: true
        }
      ]
    };
  }
}

export const db = new AppDatabase();
