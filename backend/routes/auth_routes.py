from fastapi import APIRouter, Depends, Header, HTTPException, Body
from firebase_admin import auth
from models import ProfileCreate
from .deps import get_current_user
from firebase_config import db
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

router = APIRouter()

class SyncUserRequest(BaseModel):
    name: Optional[str] = None

@router.post("/sync-user")
def sync_user(body: SyncUserRequest = Body(default=SyncUserRequest()), authorization: str = Header(...)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get('uid')
        email = decoded_token.get('email', 'user@example.com')
        # Use name from request body first, then token, then default
        name = body.name or decoded_token.get('name') or 'User'
        print(f"[sync-user] uid={uid}, email={email}, name={name}")
        
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            user_ref.set({
                "profile": {
                    "name": name,
                    "email": email,
                    "plan": "free",
                    "created_at": datetime.utcnow().isoformat()
                },
                "streak": {
                    "current_streak": 0,
                    "longest_streak": 0
                }
            })
            print(f"[sync-user] Created new Firestore document for {uid}")
            return {"status": "user registered", "uid": uid}
            
        print(f"[sync-user] User {uid} already exists in Firestore")
        return {"status": "user exists", "uid": uid}
    except Exception as e:
        print(f"[sync-user] ERROR: {e}")
        raise HTTPException(status_code=401, detail=str(e))

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

@router.get("/profile")
def get_profile(uid: str = Depends(get_current_user)):
    user_ref = db.collection('users').document(uid)
    doc = user_ref.get()
    if not doc.exists:
        return {"error": "User profile not found."}
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
