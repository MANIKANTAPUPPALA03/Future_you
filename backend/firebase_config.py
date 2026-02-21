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
            firebase_json = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
            cred = credentials.Certificate(firebase_json)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Failed to initialize Firebase Admin SDK: {e}")
            raise e

    return firestore.client()

# Global database instance
db = initialize_firebase()
