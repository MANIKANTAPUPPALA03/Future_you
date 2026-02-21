import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv(override=True)

def initialize_firebase():
    # Only initialize if it hasn't been initialized yet
    if not firebase_admin._apps:
        try:
            # Try JSON string first (for Render deployment), then fall back to file path (local dev)
            json_str = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
            if json_str:
                firebase_json = json.loads(json_str)
                print("[firebase_config] Initialized from FIREBASE_SERVICE_ACCOUNT_JSON env var")
            else:
                path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "")
                if not path:
                    raise ValueError("Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH is set")
                with open(path, "r") as f:
                    firebase_json = json.load(f)
                print(f"[firebase_config] Initialized from file: {path}")
            cred = credentials.Certificate(firebase_json)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Failed to initialize Firebase Admin SDK: {e}")
            raise e

    return firestore.client()

# Global database instance
db = initialize_firebase()
