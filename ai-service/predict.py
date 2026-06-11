import pickle
import os
import json
import numpy as np

# Resolve BASE_DIR relative to script location (c:/Users/papan/OneDrive/Desktop/p1)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_cached_model = None
_cached_scaler = None
_cached_stats = None

def clear_artifacts_cache():
    global _cached_model, _cached_scaler, _cached_stats
    _cached_model = None
    _cached_scaler = None
    _cached_stats = None

def load_artifacts():
    global _cached_model, _cached_scaler, _cached_stats
    if _cached_model is not None and _cached_scaler is not None:
        return _cached_model, _cached_scaler, _cached_stats

    model_path = os.path.join(BASE_DIR, "models", "crop_model.pkl")
    scaler_path = os.path.join(BASE_DIR, "models", "scaler.pkl")
    stats_path = os.path.join(BASE_DIR, "models", "crop_stats.json")
    
    if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
        raise FileNotFoundError(f"Model artifacts not found at {model_path}. Please train the model first.")
        
    with open(model_path, "rb") as f:
        _cached_model = pickle.load(f)
        
    with open(scaler_path, "rb") as f:
        _cached_scaler = pickle.load(f)
        
    crop_stats = {}
    if os.path.exists(stats_path):
        with open(stats_path, "r") as f:
            crop_stats = json.load(f)
    _cached_stats = crop_stats
            
    return _cached_model, _cached_scaler, _cached_stats

def predict_crop_and_advise(inputs):
    """
    inputs: dict with keys: N, P, K, temperature, humidity, ph, rainfall
    """
    model, scaler, crop_stats = load_artifacts()
    
    # Format inputs for model
    features = [
        inputs["N"],
        inputs["P"],
        inputs["K"],
        inputs["temperature"],
        inputs["humidity"],
        inputs["ph"],
        inputs["rainfall"]
    ]
    
    # Scale features
    features_scaled = scaler.transform([features])
    
    # Predict crop and confidence
    predicted_crop = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    class_index = list(model.classes_).index(predicted_crop)
    confidence = float(probabilities[class_index])
    
    # Get crop-specific stats
    stats = crop_stats.get(predicted_crop, None)
    
    # 1. Fertilizer recommendations
    fertilizer_recommendations = []
    fertilizer_status = "Optimal"
    
    if stats:
        ideal_N = stats["N"]["mean"]
        ideal_P = stats["P"]["mean"]
        ideal_K = stats["K"]["mean"]
        
        # Check Nitrogen
        n_ratio = inputs["N"] / ideal_N if ideal_N > 0 else 1.0
        if n_ratio < 0.75:
            fertilizer_recommendations.append({
                "nutrient": "Nitrogen",
                "status": "Low",
                "message": f"Soil Nitrogen ({inputs['N']} ppm) is low (Ideal: ~{round(ideal_N, 1)} ppm). Apply Nitrogen-based fertilizers like Urea or Ammonium Nitrate to boost foliage and vegetative growth.",
                "remedy": "Urea (46% N) or Ammonium Sulfate"
            })
            fertilizer_status = "Action Required"
        elif n_ratio > 1.3:
            fertilizer_recommendations.append({
                "nutrient": "Nitrogen",
                "status": "High",
                "message": f"Soil Nitrogen ({inputs['N']} ppm) is high (Ideal: ~{round(ideal_N, 1)} ppm). Avoid excess nitrogen application as it causes excessive leaf growth at the expense of fruits/grain, and increases pest susceptibility.",
                "remedy": "Avoid adding Nitrogen; water deep to leach excess, or add carbon-rich organic material"
            })
            fertilizer_status = "Attention Needed"
            
        # Check Phosphorus
        p_ratio = inputs["P"] / ideal_P if ideal_P > 0 else 1.0
        if p_ratio < 0.75:
            fertilizer_recommendations.append({
                "nutrient": "Phosphorus",
                "status": "Low",
                "message": f"Soil Phosphorus ({inputs['P']} ppm) is low (Ideal: ~{round(ideal_P, 1)} ppm). Apply Phosphate fertilizers like DAP (Diammonium Phosphate) or Single Super Phosphate (SSP) to promote robust root development and early flowering.",
                "remedy": "DAP (Diammonium Phosphate) or Bone Meal"
            })
            fertilizer_status = "Action Required"
        elif p_ratio > 1.4:
            fertilizer_recommendations.append({
                "nutrient": "Phosphorus",
                "status": "High",
                "message": f"Soil Phosphorus ({inputs['P']} ppm) is higher than needed (Ideal: ~{round(ideal_P, 1)} ppm). Excess phosphorus can lock up other micronutrients like zinc and iron.",
                "remedy": "Avoid phosphate fertilizer; add organic compost to balance absorption"
            })
            
        # Check Potassium
        k_ratio = inputs["K"] / ideal_K if ideal_K > 0 else 1.0
        if k_ratio < 0.75:
            fertilizer_recommendations.append({
                "nutrient": "Potassium",
                "status": "Low",
                "message": f"Soil Potassium ({inputs['K']} ppm) is low (Ideal: ~{round(ideal_K, 1)} ppm). Apply Potassium fertilizers like Muriate of Potash (MOP) or Potassium Sulfate to increase crop resistance to disease, drought, and improve fruit size.",
                "remedy": "Muriate of Potash (MOP) or Potash"
            })
            if fertilizer_status != "Action Required":
                fertilizer_status = "Action Required"
        elif k_ratio > 1.35:
            fertilizer_recommendations.append({
                "nutrient": "Potassium",
                "status": "High",
                "message": f"Soil Potassium ({inputs['K']} ppm) is high (Ideal: ~{round(ideal_K, 1)} ppm). Excess potassium may inhibit magnesium and calcium uptake.",
                "remedy": "Reduce potash applications, ensure proper soil drainage"
            })
            
        # Check Soil pH
        ph = inputs["ph"]
        if ph < 5.5:
            fertilizer_recommendations.append({
                "nutrient": "Soil pH",
                "status": "Acidic",
                "message": f"Soil pH ({ph}) is acidic. This restricts nutrient availability. Add agricultural lime (Calcium Carbonate) or Dolomite to neutralize the acidity.",
                "remedy": "Agricultural Lime or Wood Ash"
            })
            fertilizer_status = "Action Required"
        elif ph > 7.5:
            fertilizer_recommendations.append({
                "nutrient": "Soil pH",
                "status": "Alkaline",
                "message": f"Soil pH ({ph}) is alkaline. This restricts iron, manganese and boron uptake. Apply agricultural sulfur or organic mulch to reduce pH.",
                "remedy": "Elemental Sulfur, Gypsum or organic compost"
            })
            fertilizer_status = "Action Required"
            
    if not fertilizer_recommendations:
        fertilizer_recommendations.append({
            "nutrient": "N-P-K & pH",
            "status": "Optimal",
            "message": "Your soil parameters are well-balanced and closely match the optimal values for this crop. No corrective fertilizer applications are immediately required. Maintain soil health using general organic matter.",
            "remedy": "Organic compost maintenance"
        })
        
    # 2. Yield estimation
    yield_reduction = 0.0
    yield_explanation = ""
    
    if stats:
        ideal_temp = stats["temperature"]["mean"]
        ideal_humidity = stats["humidity"]["mean"]
        ideal_rainfall = stats["rainfall"]["mean"]
        
        # Temp deviation
        temp_dev = abs(inputs["temperature"] - ideal_temp) / ideal_temp if ideal_temp > 0 else 0
        if temp_dev > 0.15:
            yield_reduction += min(0.15, temp_dev * 0.5)
            yield_explanation += "Temperature deviates significantly from optimal, which may restrict growth. "
            
        # Humidity deviation
        hum_dev = abs(inputs["humidity"] - ideal_humidity) / ideal_humidity if ideal_humidity > 0 else 0
        if hum_dev > 0.20:
            yield_reduction += min(0.10, hum_dev * 0.3)
            yield_explanation += "Sub-optimal humidity levels may impact pollination and transpiration. "
            
        # Rainfall deviation
        rain_dev = (inputs["rainfall"] - ideal_rainfall) / ideal_rainfall if ideal_rainfall > 0 else 0
        if rain_dev < -0.25:
            yield_reduction += min(0.25, abs(rain_dev) * 0.6)
            yield_explanation += "Low rainfall detected; artificial irrigation is highly recommended to prevent crop water stress. "
        elif rain_dev > 0.40:
            yield_reduction += min(0.15, rain_dev * 0.2)
            yield_explanation += "Excess rainfall observed; ensure proper field drainage to avoid root rot and waterlogging. "
            
        base_min = stats["base_yield"]["min"]
        base_max = stats["base_yield"]["max"]
        
        efficiency = max(0.5, 1.0 - yield_reduction)
        
        estimated_min = base_min * efficiency
        estimated_max = base_max * efficiency
        
        estimated_min = max(base_min * 0.4, round(estimated_min, 2))
        estimated_max = max(base_min * 0.6, round(estimated_max, 2))
        
        if yield_explanation == "":
            yield_explanation = "Climate conditions (temperature, rainfall, and humidity) are highly optimal. Expected yields are in the upper normal range."
        else:
            yield_explanation = yield_explanation.strip()
    else:
        estimated_min = 1.5
        estimated_max = 3.5
        yield_explanation = "Standard crop yield range under typical management practices."
        
    return {
        "crop": predicted_crop,
        "confidence": confidence,
        "fertilizer_recommendation": {
            "status": fertilizer_status,
            "details": fertilizer_recommendations
        },
        "yield_estimation": {
            "min_yield": float(estimated_min),
            "max_yield": float(estimated_max),
            "unit": "tons per hectare",
            "explanation": yield_explanation
        }
    }
