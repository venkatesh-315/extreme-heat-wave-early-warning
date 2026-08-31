"""
Risk Decision Configuration & Configurable Threshold Definitions
Defines explicit, configurable threshold intervals, multi-factor weighting,
and decision-support administrative action catalogs.
"""

from typing import Dict, List, Any
from dataclasses import dataclass, field
from enum import Enum


class RiskLevel(str, Enum):
    VERY_LOW = "VERY_LOW"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


DECISION_SUPPORT_DISCLAIMER = (
    "These recommendations are decision-support guidelines for public health administration "
    "and civil protection authorities only. They do not constitute clinical medical diagnosis "
    "or individualized medical treatment advice."
)


@dataclass(frozen=True)
class RiskThresholdConfig:
    """
    Configurable threshold boundaries for multi-tier risk classification.
    Boundaries are left-inclusive and right-exclusive: [min, max) except EXTREME [min, max].
    """
    very_low_max: float = 20.0
    low_max: float = 40.0
    moderate_max: float = 60.0
    high_max: float = 80.0
    extreme_max: float = 100.0


@dataclass(frozen=True)
class RiskWeightConfig:
    """
    Multi-component weighting configuration for combined risk score.
    Weights must sum to 1.0.
    """
    thermal_stress_weight: float = 0.35
    mortality_risk_weight: float = 0.40
    hospitalization_risk_weight: float = 0.25

    def __post_init__(self):
        total = self.thermal_stress_weight + self.mortality_risk_weight + self.hospitalization_risk_weight
        if abs(total - 1.0) > 1e-5:
            raise ValueError(f"Risk weights must sum to 1.0, got {total:.4f}")


@dataclass(frozen=True)
class AdministrativeAction:
    action_id: str
    title: str
    priority: str
    description: str
    target_sectors: List[str]


DEFAULT_ACTIONS_BY_LEVEL: Dict[RiskLevel, List[AdministrativeAction]] = {
    RiskLevel.VERY_LOW: [
        AdministrativeAction(
            action_id="MONITOR_BASELINE",
            title="Monitor Climatological Conditions",
            priority="ROUTINE",
            description="Maintain routine meteorological surveillance and standard microclimate monitoring.",
            target_sectors=["Meteorological Agencies", "Municipal Authorities"],
        ),
        AdministrativeAction(
            action_id="GENERAL_HYDRATION_AWARENESS",
            title="Standard Public Awareness",
            priority="ROUTINE",
            description="Disseminate standard summer hydration and seasonal wellness advisories.",
            target_sectors=["Public Information", "General Public"],
        ),
    ],
    RiskLevel.LOW: [
        AdministrativeAction(
            action_id="MONITOR_HOTSPOTS",
            title="Enhanced Ward-Level Monitoring",
            priority="ADVISORY",
            description="Track high-density urban wards and monitor vulnerable demographic clusters.",
            target_sectors=["District Disaster Management", "Municipal Health Officers"],
        ),
        AdministrativeAction(
            action_id="PUBLIC_AWARENESS_CAMPAIGN",
            title="Active Public Awareness Campaign",
            priority="ADVISORY",
            description="Broadcast heat avoidance advisories, especially during peak afternoon hours (12:00 - 15:00).",
            target_sectors=["Media & Information", "Public Transit", "Schools"],
        ),
        AdministrativeAction(
            action_id="WORKER_HYDRATION_STATIONS",
            title="Outdoor Worker Precautions (Advisory)",
            priority="ADVISORY",
            description="Ensure employers provide potable drinking water, ORS packets, and shaded rest areas.",
            target_sectors=["Labor Department", "Construction Contractors", "Municipal Sanitation"],
        ),
    ],
    RiskLevel.MODERATE: [
        AdministrativeAction(
            action_id="COOLING_CENTER_READINESS",
            title="Cooling-Center Readiness & Activation",
            priority="PRIORITY",
            description="Inspect, staff, and prepare designated air-conditioned cooling centers and shaded transit hubs.",
            target_sectors=["Municipal Corporation", "Community Centers", "Public Libraries"],
        ),
        AdministrativeAction(
            action_id="HEALTHCARE_PREPAREDNESS",
            title="Healthcare Surge Preparedness",
            priority="PRIORITY",
            description="Stock emergency departments with IV fluids, cooling baths, and ORS; brief medical triage teams.",
            target_sectors=["Primary Health Centers", "District Hospitals", "Ambulance Services"],
        ),
        AdministrativeAction(
            action_id="OUTDOOR_WORK_SHIFT_ADJUSTMENT",
            title="Outdoor Worker Shift Rescheduling",
            priority="PRIORITY",
            description="Mandate non-peak work schedules for outdoor laborers, prohibiting intense exertion between 11:30 and 15:30.",
            target_sectors=["Labor Enforcement", "Construction", "Agricultural Cooperatives"],
        ),
        AdministrativeAction(
            action_id="TARGETED_ELDERLY_OUTREACH",
            title="Vulnerable Community Outreach",
            priority="PRIORITY",
            description="Deploy community health workers (ASHA/Anganwadi) to check on elderly and isolated citizens.",
            target_sectors=["Social Welfare", "Community Health Workers"],
        ),
    ],
    RiskLevel.HIGH: [
        AdministrativeAction(
            action_id="COOLING_CENTER_FULL_OPERATION",
            title="Full Cooling Center Deployment",
            priority="URGENT",
            description="Open all municipal cooling centers 24/7 with free drinking water, electrolytes, and medical aid.",
            target_sectors=["Disaster Management", "Municipal Transit", "Red Cross"],
        ),
        AdministrativeAction(
            action_id="EMERGENCY_HEALTHCARE_MOBILIZATION",
            title="Emergency Healthcare Capacity Mobilization",
            priority="URGENT",
            description="Designate specialized heat stroke treatment units in all tertiary hospitals and cancel non-urgent elective drills.",
            target_sectors=["State Health Mission", "Government Hospitals", "Private Medical Facilities"],
        ),
        AdministrativeAction(
            action_id="OUTDOOR_WORK_SUSPENSION_PEAK",
            title="Mandatory Outdoor Work Stoppage During Peak Heat",
            priority="URGENT",
            description="Enforce mandatory work suspension for outdoor labor between 11:00 and 16:00 under NDMA guidelines.",
            target_sectors=["Labor Inspectorate", "Police Department", "Infrastructure Projects"],
        ),
        AdministrativeAction(
            action_id="WATER_TANKER_DEPLOYMENT",
            title="Emergency Water Supply Deployment",
            priority="URGENT",
            description="Dispatch emergency potable water tankers to informal settlements, slums, and high-density hotspots.",
            target_sectors=["Water Supply Board", "Urban Local Bodies"],
        ),
    ],
    RiskLevel.EXTREME: [
        AdministrativeAction(
            action_id="EMERGENCY_RESPONSE_ESCALATION",
            title="Inter-Agency Emergency Response Escalation",
            priority="CRITICAL",
            description="Activate State/District Emergency Operations Center (EOC); initiate Red Heatwave Crisis Protocol.",
            target_sectors=["State Disaster Management Authority", "District Magistrate", "Civil Defense"],
        ),
        AdministrativeAction(
            action_id="TOTAL_OUTDOOR_WORK_HALT",
            title="Strict Prohibition of Non-Essential Outdoor Activities",
            priority="CRITICAL",
            description="Enforce strict prohibition on all non-essential outdoor labor, public gatherings, and open-air sports.",
            target_sectors=["Law Enforcement", "Municipal Authorities", "District Administration"],
        ),
        AdministrativeAction(
            action_id="MASS_CASUALTY_HEAT_TRIAGE",
            title="Hospital Mass Heat-Casualty Protocol",
            priority="CRITICAL",
            description="Deploy rapid cooling immersion facilities; establish dedicated emergency triage pavilions at major hospitals.",
            target_sectors=["All Healthcare Facilities", "Ambulance Corps", "Defense Medical Units"],
        ),
        AdministrativeAction(
            action_id="POWER_GRID_PROTECTION",
            title="Critical Infrastructure & Power Grid Priority",
            priority="CRITICAL",
            description="Ensure zero power disruption to hospitals, water treatment plants, and pumping stations.",
            target_sectors=["Power Distribution Utilities", "Essential Services Maintenance"],
        ),
        AdministrativeAction(
            action_id="BROADCAST_MASS_ALERTS",
            title="High-Priority Multi-Lingual Broadcast Alerts",
            priority="CRITICAL",
            description="Issue immediate emergency cell-broadcast and SMS alerts in vernacular languages across affected districts.",
            target_sectors=["Telecom Operators", "State Disaster Warning Systems", "Radio/Television"],
        ),
    ],
}


@dataclass
class RiskEngineConfig:
    """
    Complete configuration container for the deterministic risk-decision engine.
    Allows easy customization without modifying core application code.
    """
    thresholds: RiskThresholdConfig = field(default_factory=RiskThresholdConfig)
    weights: RiskWeightConfig = field(default_factory=RiskWeightConfig)
    actions: Dict[RiskLevel, List[AdministrativeAction]] = field(
        default_factory=lambda: DEFAULT_ACTIONS_BY_LEVEL
    )
    disclaimer: str = DECISION_SUPPORT_DISCLAIMER
