from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import simulation_routes, plan_routes, auth_routes

app = FastAPI(title="Future You API")

# Setup CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:5173"
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
