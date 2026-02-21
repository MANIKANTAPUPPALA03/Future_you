import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from routes import simulation_routes, plan_routes, auth_routes

app = FastAPI(title="Future You API")

# Custom CORS middleware that guarantees headers are added
class CORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = JSONResponse(content={"detail": "OK"}, status_code=200)
        else:
            response = await call_next(request)

        # Add CORS headers to EVERY response
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response

app.add_middleware(CORSMiddleware)

# Route Imports
app.include_router(auth_routes.router, prefix="/api", tags=["Auth & Profile"])
app.include_router(simulation_routes.router, prefix="/api", tags=["Simulation"])
app.include_router(plan_routes.router, prefix="/api", tags=["Plans & Streaks"])

@app.get("/")
def health_check():
    return {"status": "ok", "cors": "custom-middleware-active"}
