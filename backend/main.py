import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from routes import simulation_routes, plan_routes, auth_routes

app = FastAPI(title="Future You API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://futureyou-2021.web.app",
        "https://futureyou-2021.firebaseapp.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Route Imports
app.include_router(auth_routes.router, prefix="/api", tags=["Auth & Profile"])
app.include_router(simulation_routes.router, prefix="/api", tags=["Simulation"])
app.include_router(plan_routes.router, prefix="/api", tags=["Plans & Streaks"])

@app.get("/")
def health_check():
    return {"status": "ok", "version": "v3-cors-fixed"}

@app.get("/cors-test")
def cors_test():
    return {"cors": "working", "message": "If you can see this from the browser, CORS is working"}
