from fastapi import APIRouter, Depends
from models import SimulationRequest, SimulationResponse
from .deps import get_current_user
from services.simulation_service import calculate_scores
from services.groq_service import generate_ai_insights
from firebase_config import db
from datetime import datetime
import json

router = APIRouter()

@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(req: SimulationRequest, uid: str = Depends(get_current_user)):
    # Calculate deterministic base scores from constraints
    scores = calculate_scores(req)
    created_at = datetime.utcnow().isoformat()
    
    user_ref = db.collection('users').document(uid)
    
    # Save constraints
    user_ref.set({
        "constraints": req.model_dump() # Using Pydantic V2 dump
    }, merge=True)
    
    # Save the output simulation block
    sim_data = {
        "scores": scores.model_dump(),
        "created_at": created_at
    }
    user_ref.set({
        "simulation": sim_data
    }, merge=True)
    
    
    return SimulationResponse(scores=scores, created_at=created_at)

@router.get("/ai-summary")
def get_ai_summary(uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    data = doc.to_dict() if doc.exists else {}
    
    constraints = data.get("constraints", {})
    scores = data.get("simulation", {}).get("scores", {})
    
    if not constraints or not scores:
        return {"summary": "Please run a simulation first to unlock AI insights."}
        
    prompt = f"Analyze these life constraints: {constraints} and generated scores: {scores}. Provide a precise, 3-sentence predictive trajectory summary on health and finance preparedness. Speak directly to the user (e.g. 'Based on your habits...')."
    summary = generate_ai_insights(prompt)
    
    return {"summary": summary}

@router.get("/future-risks")
def get_future_risks(uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    data = doc.to_dict() if doc.exists else {}
    
    constraints = data.get("constraints", {})
    
    default_risks = [
        {"title": "Financial Crisis", "score": 72, "impact": "Medium", "recovery": "18 Months"},
        {"title": "Industry Disruption", "score": 45, "impact": "High", "recovery": "6 Months"},
        {"title": "Health Emergency", "score": 85, "impact": "Low", "recovery": "3 Months"},
        {"title": "Economic Recession", "score": 60, "impact": "Medium", "recovery": "24 Months"}
    ]
    
    if not constraints:
        return {"risks": default_risks}
        
    prompt = f"""
    Based on these constraints: {constraints}
    Generate 4 personalized shock scenarios. Return ONLY valid JSON as a list of dictionaries with keys: "title", "score" (0-100 preparedness), "impact" (Low/Medium/High), "recovery" (e.g. '12 Months').
    Example: [{{"title": "AI Disruption", "score": 40, "impact": "High", "recovery": "24 Months"}}]
    """
    
    try:
        response_text = generate_ai_insights(prompt)
        response_text = response_text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        risks = json.loads(response_text.strip())
        if isinstance(risks, list) and len(risks) > 0:
            return {"risks": risks[:4]}
    except Exception as e:
        print("Groq JSON parsing failed", e)
        
    return {"risks": default_risks}
