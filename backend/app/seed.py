"""
Seed Script for Madhya Pradesh Pilot Areas, Depots, Demands, and Baseline Scenarios.
All records created by this script are explicitly labeled as synthetic demonstration records
(is_synthetic=True, value_category='synthetic') in compliance with project rules.
"""

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, Base, engine
from backend.app.models import PilotArea, ResourceCentre, DemandRecord, Scenario


def seed_database(db: Session) -> None:
    # Ensure all tables exist in the target database
    Base.metadata.create_all(bind=engine)

    # 1. Seed Pilot Areas (Districts in Madhya Pradesh)
    pilot_areas_data = [
        {
            "id": "tikamgarh",
            "name": "Tikamgarh",
            "state": "Madhya Pradesh",
            "division": "Sagar Division (Bundelkhand)",
            "talukas": "Baldeogarh, Jatara, Palera, Mohangarh, Tikamgarh",
            "latitude": 24.7450,
            "longitude": 78.8350,
            "is_synthetic": True,
            "provenance_notes": "Synthetic pilot record modeled after MP Scarcity Manual Bundelkhand profile."
        },
        {
            "id": "chhatarpur",
            "name": "Chhatarpur",
            "state": "Madhya Pradesh",
            "division": "Sagar Division (Bundelkhand)",
            "talukas": "Nowgong, Rajnagar, Bijawar, Bada Malhera, Chhatarpur",
            "latitude": 24.9164,
            "longitude": 79.5811,
            "is_synthetic": True,
            "provenance_notes": "Synthetic pilot record modeled after Bundelkhand agrarian drought indices."
        },
        {
            "id": "barwani",
            "name": "Barwani",
            "state": "Madhya Pradesh",
            "division": "Indore Division (Nimar)",
            "talukas": "Sendhwa, Pansemal, Rajpur, Thikri, Barwani",
            "latitude": 22.0360,
            "longitude": 74.9030,
            "is_synthetic": True,
            "provenance_notes": "Synthetic pilot record for tribal dryland agricultural belt in Nimar."
        },
        {
            "id": "sheopur",
            "name": "Sheopur",
            "state": "Madhya Pradesh",
            "division": "Chambal Division",
            "talukas": "Vijaypur, Karahal, Sheopur",
            "latitude": 25.6690,
            "longitude": 76.6980,
            "is_synthetic": True,
            "provenance_notes": "Synthetic pilot record representing arid Chambal ravines zone."
        },
        {
            "id": "panna",
            "name": "Panna",
            "state": "Madhya Pradesh",
            "division": "Sagar Division (Bundelkhand)",
            "talukas": "Ajaigarh, Pawai, Shahnagar, Gunnor, Panna",
            "latitude": 24.7200,
            "longitude": 80.1900,
            "is_synthetic": True,
            "provenance_notes": "Synthetic pilot record for Ken-Betwa river basin rain-shadow sector."
        }
    ]

    for pa in pilot_areas_data:
        existing = db.query(PilotArea).filter(PilotArea.id == pa["id"]).first()
        if not existing:
            db.add(PilotArea(**pa))

    db.commit()

    # 2. Seed Resource Centres / Depots
    centres_data = [
        {
            "id": "rc-sagar-depot",
            "name": "Sagar Bundelkhand Regional Grain Depot (APMC)",
            "pilot_area_id": "tikamgarh",
            "location_identifier": "APMC-SGR-01 (23.8388, 78.7378)",
            "resource_type": "fodder_tonnes",
            "available_stock": 1450.0,
            "unit": "tonnes",
            "is_synthetic": True
        },
        {
            "id": "rc-gandhi-sagar",
            "name": "Gandhi Sagar Dam Headworks Staging Hub",
            "pilot_area_id": "tikamgarh",
            "location_identifier": "GSD-HEAD-01 (24.7061, 75.7336)",
            "resource_type": "tanker_water",
            "available_stock": 850.0,
            "unit": "trips",
            "is_synthetic": True
        },
        {
            "id": "rc-nowgong-fodder",
            "name": "Nowgong Veterinary & Fodder Depot",
            "pilot_area_id": "chhatarpur",
            "location_identifier": "VET-NWG-02 (25.0560, 79.4420)",
            "resource_type": "fodder_tonnes",
            "available_stock": 920.0,
            "unit": "tonnes",
            "is_synthetic": True
        },
        {
            "id": "rc-chhatarpur-water",
            "name": "Chhatarpur Municipal Hydrant Staging Depot",
            "pilot_area_id": "chhatarpur",
            "location_identifier": "CHH-HYD-04 (24.9160, 79.5800)",
            "resource_type": "tanker_water",
            "available_stock": 620.0,
            "unit": "trips",
            "is_synthetic": True
        },
        {
            "id": "rc-sendhwa-seed",
            "name": "Sendhwa Tribal Agricultural Seed Bank",
            "pilot_area_id": "barwani",
            "location_identifier": "SND-SEED-01 (21.6880, 75.0930)",
            "resource_type": "seed_kits",
            "available_stock": 3500.0,
            "unit": "kits",
            "is_synthetic": True
        },
        {
            "id": "rc-barwani-water",
            "name": "Narmada Riverbed Extraction Depot Barwani",
            "pilot_area_id": "barwani",
            "location_identifier": "NRM-BRW-02 (22.0360, 74.9030)",
            "resource_type": "tanker_water",
            "available_stock": 480.0,
            "unit": "trips",
            "is_synthetic": True
        }
    ]

    for rc in centres_data:
        existing = db.query(ResourceCentre).filter(ResourceCentre.id == rc["id"]).first()
        if not existing:
            db.add(ResourceCentre(**rc))

    db.commit()

    # 3. Seed Demand Records
    demands_data = [
        {
            "id": "dem-tikamgarh-water-01",
            "pilot_area_id": "tikamgarh",
            "resource_type": "tanker_water",
            "estimated_demand": 580.0,
            "priority": 1,  # Critical
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-tikamgarh-fodder-01",
            "pilot_area_id": "tikamgarh",
            "resource_type": "fodder_tonnes",
            "estimated_demand": 820.0,
            "priority": 2,  # High
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-chhatarpur-water-01",
            "pilot_area_id": "chhatarpur",
            "resource_type": "tanker_water",
            "estimated_demand": 510.0,
            "priority": 1,
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-chhatarpur-fodder-01",
            "pilot_area_id": "chhatarpur",
            "resource_type": "fodder_tonnes",
            "estimated_demand": 740.0,
            "priority": 2,
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-barwani-water-01",
            "pilot_area_id": "barwani",
            "resource_type": "tanker_water",
            "estimated_demand": 380.0,
            "priority": 1,
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-barwani-seed-01",
            "pilot_area_id": "barwani",
            "resource_type": "seed_kits",
            "estimated_demand": 2800.0,
            "priority": 3,
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        },
        {
            "id": "dem-sheopur-water-01",
            "pilot_area_id": "sheopur",
            "resource_type": "tanker_water",
            "estimated_demand": 320.0,
            "priority": 2,
            "value_category": "synthetic",
            "is_synthetic": True,
            "data_source": "SYNTHETIC_MP_SDMA_DROUGHT_MANUAL_BENCHMARK"
        }
    ]

    for d in demands_data:
        existing = db.query(DemandRecord).filter(DemandRecord.id == d["id"]).first()
        if not existing:
            db.add(DemandRecord(**d))

    db.commit()

    # 4. Seed Standard Scenarios
    scenarios_data = [
        {
            "id": "scen-bundelkhand-severe-baseline",
            "name": "Bundelkhand Severe Drought Baseline",
            "description": "Standard contingency preemption run prioritizing emergency drinking water tankers and cattle fodder under severe rainfall deficit.",
            "stress_level": "severe",
            "objective": "critical_needs_first",
            "input_assumptions": json.dumps({
                "budget_ceiling_cr": 85.0,
                "tanker_contingency_days": 30,
                "floor_service_level_pct": 50,
                "unmet_penalty_weight": 2.5
            }),
            "data_provenance": "Synthetic assumptions calibrated to MP Relief Code Table 4 guidelines."
        },
        {
            "id": "scen-equitable-fair-share",
            "name": "Statewide Equitable Resource Rationing",
            "description": "Proportional rationing scenario ensuring each vulnerable district receives an equitable percentage of its registered demand.",
            "stress_level": "extreme",
            "objective": "equitable_distribution",
            "input_assumptions": json.dumps({
                "budget_ceiling_cr": 60.0,
                "equity_tolerance_pct": 5.0,
                "min_quota_per_district_pct": 40
            }),
            "data_provenance": "Synthetic multi-district rationing test scenario."
        }
    ]

    for s in scenarios_data:
        existing = db.query(Scenario).filter(Scenario.id == s["id"]).first()
        if not existing:
            db.add(Scenario(**s))

    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeded successfully with labeled synthetic records.")
    finally:
        db.close()
