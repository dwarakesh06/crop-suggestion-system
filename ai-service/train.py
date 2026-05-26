import pandas as pd
import numpy as np
import pickle
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Resolve BASE_DIR relative to script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def train_model(csv_path="dataset/crop_recommendation.csv"):
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(BASE_DIR, csv_path)
        
    print(f"Training started with dataset: {csv_path}")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
        
    df = pd.read_csv(csv_path)
    
    required_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
            
    crop_stats = {}
    unique_crops = df["label"].unique()
    
    for crop in unique_crops:
        crop_df = df[df["label"] == crop]
        crop_stats[crop] = {
            "N": {
                "mean": float(crop_df["N"].mean()),
                "min": float(crop_df["N"].min()),
                "max": float(crop_df["N"].max())
            },
            "P": {
                "mean": float(crop_df["P"].mean()),
                "min": float(crop_df["P"].min()),
                "max": float(crop_df["P"].max())
            },
            "K": {
                "mean": float(crop_df["K"].mean()),
                "min": float(crop_df["K"].min()),
                "max": float(crop_df["K"].max())
            },
            "temperature": {
                "mean": float(crop_df["temperature"].mean()),
                "min": float(crop_df["temperature"].min()),
                "max": float(crop_df["temperature"].max())
            },
            "humidity": {
                "mean": float(crop_df["humidity"].mean()),
                "min": float(crop_df["humidity"].min()),
                "max": float(crop_df["humidity"].max())
            },
            "ph": {
                "mean": float(crop_df["ph"].mean()),
                "min": float(crop_df["ph"].min()),
                "max": float(crop_df["ph"].max())
            },
            "rainfall": {
                "mean": float(crop_df["rainfall"].mean()),
                "min": float(crop_df["rainfall"].min()),
                "max": float(crop_df["rainfall"].max())
            },
            "base_yield": get_base_yield(crop)
        }
        
    X = df.drop("label", axis=1)
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained. Accuracy: {accuracy:.4f}")
    
    models_dir = os.path.join(BASE_DIR, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    with open(os.path.join(models_dir, "crop_model.pkl"), "wb") as f:
        pickle.dump(model, f)
        
    with open(os.path.join(models_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
        
    with open(os.path.join(models_dir, "crop_stats.json"), "w") as f:
        json.dump(crop_stats, f, indent=4)
        
    print(f"Model artifacts saved to: {models_dir}")
    
    return {
        "accuracy": float(accuracy),
        "total_records": int(len(df)),
        "crops": list(unique_crops),
        "status": "success"
    }

def get_base_yield(crop):
    yields = {
        "rice": {"min": 3.0, "max": 6.0},
        "maize": {"min": 4.0, "max": 7.5},
        "chickpeas": {"min": 1.2, "max": 2.5},
        "kidneybeans": {"min": 1.0, "max": 2.2},
        "pigeonpeas": {"min": 0.8, "max": 1.8},
        "mothbeans": {"min": 0.5, "max": 1.2},
        "mungbean": {"min": 0.6, "max": 1.4},
        "blackgram": {"min": 0.7, "max": 1.5},
        "lentil": {"min": 0.8, "max": 1.6},
        "pomegranate": {"min": 15.0, "max": 25.0},
        "banana": {"min": 30.0, "max": 50.0},
        "mango": {"min": 8.0, "max": 15.0},
        "grapes": {"min": 12.0, "max": 22.0},
        "watermelon": {"min": 25.0, "max": 45.0},
        "muskmelon": {"min": 15.0, "max": 30.0},
        "apple": {"min": 20.0, "max": 35.0},
        "orange": {"min": 18.0, "max": 28.0},
        "papaya": {"min": 40.0, "max": 80.0},
        "coconut": {"min": 10.0, "max": 20.0},
        "cotton": {"min": 1.5, "max": 3.5},
        "jute": {"min": 2.0, "max": 3.8},
        "coffee": {"min": 1.0, "max": 2.5},
        
        # Yield specifications for the 10 new crops
        "wheat": {"min": 2.5, "max": 5.0},
        "sugarcane": {"min": 60.0, "max": 90.0},
        "soybeans": {"min": 2.0, "max": 3.8},
        "barley": {"min": 2.0, "max": 4.5},
        "potato": {"min": 18.0, "max": 30.0},
        "groundnut": {"min": 1.5, "max": 3.2},
        "tea": {"min": 1.5, "max": 3.0},
        "tobacco": {"min": 1.8, "max": 3.0},
        "rubber": {"min": 1.2, "max": 2.5},
        "sweetpotato": {"min": 12.0, "max": 22.0}
    }
    return yields.get(crop.lower(), {"min": 1.0, "max": 5.0})

if __name__ == "__main__":
    train_model()
