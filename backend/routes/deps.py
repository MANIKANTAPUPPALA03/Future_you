from fastapi import Header, HTTPException
from firebase_admin import auth

def get_current_user(authorization: str = Header(...)):
    """
    Middleware dependency that extracts the Bearer token, verifies it against Firebase,
    and returns the user's UID.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing Authorization header")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get('uid')
        if not uid:
            raise HTTPException(status_code=401, detail="No valid UID in token")
        return uid
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
