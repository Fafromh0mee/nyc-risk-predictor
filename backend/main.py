from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import json
import numpy as np
import os

app = FastAPI(title="NYC Accident Risk Predictor API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load model and scaler
model = joblib.load(os.path.join(MODELS_DIR, "accident_risk_model.pkl"))
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
with open(os.path.join(MODELS_DIR, "selected_features.json")) as f:
    features = json.load(f)

# Contributing factors mapping (from notebook's LabelEncoder)
CONTRIB_FACTORS = [
    "Unspecified",
    "Driver Inattention/Distraction",
    "Failure to Yield Right-of-Way",
    "Following Too Closely",
    "Passing or Lane Usage Improper",
    "Unsafe Speed",
    "Traffic Control Disregarded",
    "Other Vehicular",
    "Backing Unsafely",
    "Turning Improperly",
    "Pavement Slippery",
    "Reaction to Uninvolved Vehicle",
    "Pedestrian/Bicyclist/Other Pedestrian Error/Confusion",
    "View Obstructed/Limited",
    "Aggressive Driving/Road Rage",
    "Alcohol Involvement",
    "Driver Inexperience",
    "Fatigued/Drowsy",
    "Lost Consciousness",
    "Oversized Vehicle",
]


class PredictionRequest(BaseModel):
    lat: float
    lng: float
    hour: int = 12
    day_of_week: int = 0  # 0=Monday, 6=Sunday
    contrib_factor: Optional[int] = 0  # Default to "Unspecified"


class PredictionResponse(BaseModel):
    lat: float
    lng: float
    level: str
    score: float
    probabilities: dict
    contrib_factor_name: str


@app.get("/")
def root():
    return {"message": "NYC Accident Risk Predictor API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/factors")
def get_factors():
    """Get list of contributing factors"""
    return {
        "factors": [
            {"id": i, "name": name} for i, name in enumerate(CONTRIB_FACTORS)
        ]
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    """Predict accident risk for a location"""
    
    # Calculate derived features
    lat_long_interaction = req.lat * req.lng
    is_weekend = 1 if req.day_of_week >= 5 else 0
    is_rush_hour = 1 if (6 <= req.hour <= 8) or (16 <= req.hour <= 19) else 0
    hour_weekend = req.hour * is_weekend
    rush_hour_weekday = is_rush_hour * (1 - is_weekend)
    
    # Build feature array in the correct order
    # ['LATITUDE', 'LONGITUDE', 'lat_long_interaction', 'hour', 'hour_weekend', 
    #  'day_of_week', 'is_weekend', 'is_rush_hour', 'rush_hour_weekday', 'contrib_factor_encoded']
    X = np.array([[
        req.lat,
        req.lng,
        lat_long_interaction,
        req.hour,
        hour_weekend,
        req.day_of_week,
        is_weekend,
        is_rush_hour,
        rush_hour_weekday,
        req.contrib_factor or 0
    ]])
    
    # Scale features
    X_scaled = scaler.transform(X)
    
    # Predict
    pred = model.predict(X_scaled)[0]
    proba = model.predict_proba(X_scaled)[0]
    
    # Map prediction to level
    level_map = {0: "low", 1: "medium", 2: "high"}
    level = level_map.get(int(pred), "unknown")
    
    # Get contributing factor name
    contrib_name = CONTRIB_FACTORS[req.contrib_factor] if req.contrib_factor < len(CONTRIB_FACTORS) else "Unknown"
    
    return PredictionResponse(
        lat=req.lat,
        lng=req.lng,
        level=level,
        score=float(max(proba)),
        probabilities={
            "low": round(float(proba[0]) * 100, 1),
            "medium": round(float(proba[1]) * 100, 1),
            "high": round(float(proba[2]) * 100, 1),
        },
        contrib_factor_name=contrib_name
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)

