"""
Adaptive Signal Intelligence - ML API Microservice (FastAPI)
Exposes endpoints for Density Calculation, Risky Trajectory Analysis, Emergency Triage, Route Prediction, and Signal Optimization.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

from models.density_detector import DensityDetector
from models.risk_analyzer import RiskPatternAnalyzer
from models.triage_engine import EmergencyTriageEngine
from models.route_predictor import RoutePredictor
from models.signal_optimizer import SignalOptimizer

app = FastAPI(
    title="Adaptive Signal Intelligence - ML Microservice",
    version="1.0.0",
    description="Computer Vision & AI Inference Engine for Real-Time Traffic & Emergency Prioritization"
)

# Enable CORS for React Frontend and Express Web Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class ApproachData(BaseModel):
    vehicle_count: int = Field(..., ge=0)
    capacity: int = Field(50, ge=1)
    avg_speed_kmh: float = Field(25.0, ge=0.0)

class DensityEvaluationRequest(BaseModel):
    junction_id: str = "J-01"
    approaches: Dict[str, ApproachData]

class TrajectoryPoint(BaseModel):
    x: float
    y: float
    timestamp: float

class RiskAnalysisRequest(BaseModel):
    vehicle_id: str
    trajectory: List[TrajectoryPoint]
    speed_kmh: float = 45.0

class EmergencyTriageRequest(BaseModel):
    ambulance_id: str
    patient_severity: str = "CRITICAL"  # CRITICAL, SERIOUS, STABLE
    distance_to_junction_m: float = 850.0
    current_speed_kmh: float = 42.0
    route_congestion_pct: float = 65.0

class MultiJunctionRouteRequest(BaseModel):
    corridor_id: str = "CORRIDOR-AIIMS"
    junctions: List[Dict[str, Any]]

class SignalOptimizationRequest(BaseModel):
    approaches: Dict[str, Dict[str, Any]]
    cycle_time_sec: int = 120
    emergency_override: bool = False
    emergency_approach: str = "EAST"

# Health Check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Adaptive Signal Intelligence ML Backend",
        "models_loaded": ["DensityDetector", "RiskPatternAnalyzer", "EmergencyTriageEngine", "RoutePredictor", "SignalOptimizer"]
    }

# 1. Density Evaluation
@app.post("/api/ml/detect-density")
def detect_density(request: DensityEvaluationRequest):
    approaches_dict = {k: v.dict() for k, v in request.approaches.items()}
    result = DensityDetector.evaluate_junction_approaches(approaches_dict)
    result["junction_id"] = request.junction_id
    return result

# 2. Risky Driving / Cut-Maarna Trajectory Analysis
@app.post("/api/ml/analyze-risk")
def analyze_risk(request: RiskAnalysisRequest):
    points = [p.dict() for p in request.trajectory]
    return RiskPatternAnalyzer.analyze_trajectory(
        vehicle_id=request.vehicle_id,
        trajectory_points=points,
        speed_kmh=request.speed_kmh
    )

# 3. Emergency Triage & Green Corridor Engine
@app.post("/api/ml/triage-emergency")
def triage_emergency(request: EmergencyTriageRequest):
    return EmergencyTriageEngine.evaluate_triage(
        ambulance_id=request.ambulance_id,
        patient_severity=request.patient_severity,
        distance_to_junction_m=request.distance_to_junction_m,
        current_speed_kmh=request.current_speed_kmh,
        route_congestion_pct=request.route_congestion_pct
    )

# 4. Route Congestion Prediction
@app.post("/api/ml/predict-route")
def predict_route(request: MultiJunctionRouteRequest):
    result = RoutePredictor.predict_multi_junction_corridor(request.junctions)
    result["corridor_id"] = request.corridor_id
    return result

# 5. Dynamic Signal Optimizer
@app.post("/api/ml/optimize-signal")
def optimize_signal(request: SignalOptimizationRequest):
    return SignalOptimizer.calculate_phase_allocation(
        approaches=request.approaches,
        cycle_time_sec=request.cycle_time_sec,
        emergency_override=request.emergency_override,
        emergency_approach=request.emergency_approach
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
