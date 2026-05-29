import os
import asyncio
import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from train import train_model
from predict import predict_crop_and_advise

logger = logging.getLogger("keepalive")

# Self-ping task to prevent Render free tier from sleeping
async def keep_alive():
    """Pings our own /health endpoint every 10 minutes to stay awake."""
    await asyncio.sleep(60)  # Wait 1 min after startup before first ping
    self_url = os.environ.get("SELF_URL", "")
    if not self_url:
        logger.info("SELF_URL not set — keep-alive ping disabled.")
        return
    try:
        import httpx
        while True:
            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    resp = await client.get(f"{self_url}/health")
                    logger.info(f"Keep-alive ping → {resp.status_code}")
            except Exception as e:
                logger.warning(f"Keep-alive ping failed: {e}")
            await asyncio.sleep(600)  # Ping every 10 minutes
    except ImportError:
        logger.warning("httpx not installed — keep-alive ping disabled. Add httpx to requirements.txt")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start keep-alive background task on startup
    task = asyncio.create_task(keep_alive())
    yield
    task.cancel()


app = FastAPI(
    title="Crop Suggestion AI Service",
    description="Machine Learning Service for Crop Prediction, Fertilizer Recommendations, and Yield Estimation",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve BASE_DIR relative to script location (c:/Users/papan/OneDrive/Desktop/p1)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class CropInput(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Nitrogen in ppm")
    P: float = Field(..., ge=0, le=200, description="Phosphorus in ppm")
    K: float = Field(..., ge=0, le=300, description="Potassium in ppm")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in %")
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm")

class TrainRequest(BaseModel):
    csv_path: str = Field("dataset/crop_recommendation.csv", description="Path to the training dataset CSV")

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    # Resolve files using absolute paths
    model_loaded = os.path.exists(os.path.join(BASE_DIR, "models", "crop_model.pkl"))
    scaler_loaded = os.path.exists(os.path.join(BASE_DIR, "models", "scaler.pkl"))
    stats_loaded = os.path.exists(os.path.join(BASE_DIR, "models", "crop_stats.json"))
    
    return {
        "status": "healthy" if (model_loaded and scaler_loaded and stats_loaded) else "needs_training",
        "model_exists": model_loaded,
        "scaler_exists": scaler_loaded,
        "stats_exists": stats_loaded
    }

@app.post("/predict", status_code=status.HTTP_200_OK)
def predict(payload: CropInput):
    try:
        inputs = payload.model_dump()
        result = predict_crop_and_advise(inputs)
        return result
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e) + " Trigger model training first via /train."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )

@app.post("/train", status_code=status.HTTP_200_OK)
def train(payload: TrainRequest):
    try:
        # Pass the csv_path directly (train_model resolves it internally relative to BASE_DIR)
        metrics = train_model(payload.csv_path)
        return {
            "message": "Model trained and saved successfully.",
            "metrics": metrics
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
