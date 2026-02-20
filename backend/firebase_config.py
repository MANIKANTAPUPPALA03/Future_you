import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv(override=True)

def initialize_firebase():
    # Only initialize if it hasn't been initialized yet
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if not cred_path:
            raise ValueError("FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set.")
        
        # Resolve path relative to this backend file 
        # (e.g. "../futureyou...json" -> resolves to project root)
        absolute_cred_path = os.path.normpath(os.path.join(os.path.dirname(__file__), cred_path))
        
        try:
            cred = credentials.Certificate(absolute_cred_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Failed to initialize Firebase Admin SDK: {e}")
            raise e

    return firestore.client()

# Global database instance
db = initialize_firebase()
