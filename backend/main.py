import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import simulation_routes, plan_routes, auth_routes

app = FastAPI(title="Future You API")

# Setup CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "https://futureyou-2021.web.app",
        "https://futureyou-2021.firebaseapp.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Imports
app.include_router(auth_routes.router, prefix="/api", tags=["Auth & Profile"])
app.include_router(simulation_routes.router, prefix="/api", tags=["Simulation"])
app.include_router(plan_routes.router, prefix="/api", tags=["Plans & Streaks"])

@app.get("/")
def health_check():
    return {"status": "ok"}
