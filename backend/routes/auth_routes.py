from fastapi import APIRouter, Depends
from models import ProfileCreate
from .deps import get_current_user
from firebase_config import db
from datetime import datetime

router = APIRouter()

@router.post("/profile")
def update_profile(req: ProfileCreate, uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    
    # Standard profile data merging
    profile_data = {
        "name": req.name,
        "email": req.email,
        "plan": req.plan,
        "created_at": datetime.utcnow().isoformat()
    }

    if req.age:
        profile_data['age'] = req.age
    if req.occupation:
        profile_data['occupation'] = req.occupation
    if req.location:
        profile_data['location'] = req.location
    
    user_ref.set({
        "profile": profile_data
    }, merge=True)
    
    return {"status": "success", "profile": profile_data}

@router.post("/upgrade")
def upgrade_plan(uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        return {"error": "User not found"}
        
    user_ref.set({
        "profile": {
            "plan": "premium",
            "upgraded_at": datetime.utcnow().isoformat()
        }
    }, merge=True)
    
    return {"status": "success", "plan": "premium"}

@router.post("/cancel-subscription")
def cancel_plan(uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        return {"error": "User not found"}
        
    user_ref.set({
        "profile": {
            "plan": "free",
            "canceled_at": datetime.utcnow().isoformat()
        }
    }, merge=True)
    
    return {"status": "success", "plan": "free"}

@router.get("/export-data")
def export_user_data(uid: str = Depends(get_current_user)):
    """Export all simulation data, plans, and profile info for the user"""
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        return {"error": "No user data found"}
        
    return doc.to_dict()

@router.delete("/reset-data")
def reset_user_data(uid: str = Depends(get_current_user)):
    """Clear all simulation configurations and streaks but keep the base profile"""
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        return {"error": "User not found"}
        
    # Overwrite the arrays and sub-objects but keep auth profiles
    db_state = doc.to_dict()
    new_state = {}
    if "profile" in db_state:
        new_state["profile"] = db_state["profile"]
        
    user_ref.set(new_state)
    
    return {"status": "success", "message": "Simulation data reset successfully"}
