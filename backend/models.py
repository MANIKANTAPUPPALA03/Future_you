from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class PersonalConstraints(BaseModel):
    sleep: int
    exercise: str
    screenTime: int
    stressLevel: int
    productivity: int
    savings: int

class SocioEconomicConstraints(BaseModel):
    familyIncome: str
    supportSystem: str
    accessResources: str

class EnvironmentalConstraints(BaseModel):
    urbanRural: str
    workCulture: str
    stressExposure: str

class MacroDynamicConstraints(BaseModel):
    economicCondition: str
    industryVolatility: str
    techAdaptability: str
    automationRisk: str

class SimulationRequest(BaseModel):
    personal: PersonalConstraints
    socio_economic: SocioEconomicConstraints
    environmental: EnvironmentalConstraints
    macro_dynamic: MacroDynamicConstraints

class Scores(BaseModel):
    health: int
    career: int
    finance: int
    mental: int
    shock_preparedness: int

class SimulationResponse(BaseModel):
    scores: Scores
    created_at: str

class PlanRequest(BaseModel):
    intensity_mode: str = "all"
    wake_time: Optional[str] = "07:00 AM"
    sleep_time: Optional[str] = "11:00 PM"
    college_timing_start: Optional[str] = "09:00 AM"
    college_timing_end: Optional[str] = "03:00 PM"
    routine_status: Optional[str] = "Professional"
    routine_pace: Optional[str] = "Steady"
    work_start: Optional[str] = "09:00 AM"
    work_end: Optional[str] = "05:00 PM"
    commute_duration: Optional[str] = "None"
    industry: Optional[str] = "Tech"
    stress_source: Optional[str] = "Work"
    recovery_activity: Optional[str] = "Exercise"
    fin_target: Optional[str] = "500"
    fin_interval: Optional[str] = "Monthly"
    income_focus: Optional[str] = "Salary"
    frugality: Optional[str] = "Moderate"
    primary_goal: Optional[str] = "Wealth"
    exercise_days: Optional[str] = "3-4"

class StreakUpdate(BaseModel):
    completed_today: bool

class ProfileCreate(BaseModel):
    name: str = "User"
    email: str = "user@example.com"
    plan: str = "free"
    age: Optional[str] = ""
    occupation: Optional[str] = "Professional"
    location: Optional[str] = ""
