from fastapi import APIRouter, Depends
from models import PlanRequest, StreakUpdate
from .deps import get_current_user
from services.plan_service import generate_deterministic_plan
from services.streak_service import process_streak_update
from firebase_config import db
from datetime import datetime

router = APIRouter()

@router.post("/generate-plan")
def create_plan(req: PlanRequest, uid: str = Depends(get_current_user)):
    print(f"[generate-plan] Generating plan for uid={uid}")
    plan_data = generate_deterministic_plan(req)
    plan_data['created_at'] = datetime.utcnow().isoformat()
    
    user_ref = db.collection('users').document(uid)
    user_ref.set({
        "plan": plan_data
    }, merge=True)
    print(f"[generate-plan] Saved plan to Firestore for {uid}")
    
    return plan_data

@router.post("/update-streak")
def update_streak(req: StreakUpdate, uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    data = doc.to_dict() if doc.exists else {}
    streak_data = data.get("streak", {})
    
    current = streak_data.get("current_streak", 0)
    longest = streak_data.get("longest_streak", 0)
    last_act = streak_data.get("last_active_date", "")
    
    new_streak = process_streak_update(current, longest, last_act, req.completed_today)
    
    user_ref.set({
        "streak": new_streak
    }, merge=True)
    
    return new_streak

@router.get("/dashboard")
def get_dashboard(uid: str = Depends(get_current_user)):
    """Fetch collective user data (scores, plan, streaks)"""
    print(f"[dashboard] Fetching data for uid={uid}")
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        print(f"[dashboard] No document found for uid={uid}")
        return {"message": "User not found or no data available."}
    
    data = doc.to_dict()
    print(f"[dashboard] Found data keys: {list(data.keys())} for uid={uid}")
    return data
