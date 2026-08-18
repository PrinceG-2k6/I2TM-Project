import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

def generate_synthetic_data(n_samples=1000, n_anomalies=50):
    # Features: [avg_speed, max_acceleration, heading_variance, lateral_deviation]
    
    # 1. Normal driving behavior
    # Speed: 30-70 km/h
    # Accel: 0-3 m/s^2
    # Heading Var: 0-10 degrees
    # Lat Dev: 0-1 meters
    X_normal = np.column_stack([
        np.random.normal(50, 10, n_samples),
        np.random.exponential(1.0, n_samples),
        np.random.normal(5, 2, n_samples),
        np.random.exponential(0.5, n_samples)
    ])
    
    # Clip to realistic bounds
    X_normal[:, 0] = np.clip(X_normal[:, 0], 10, 80)
    X_normal[:, 1] = np.clip(X_normal[:, 1], 0, 5)
    X_normal[:, 2] = np.clip(X_normal[:, 2], 0, 15)
    
    # 2. Anomalous driving behavior (Zig-zag, Wrong side, Extreme speed, Abrupt stop)
    X_anomaly = np.column_stack([
        np.random.choice([0, 120, 150], n_anomalies), # Stopped or speeding
        np.random.uniform(8, 15, n_anomalies),       # Hard braking / accel
        np.random.uniform(40, 180, n_anomalies),     # High heading variance (zig-zag / wrong side)
        np.random.uniform(3, 10, n_anomalies)        # High lateral deviation
    ])
    
    X = np.vstack([X_normal, X_anomaly])
    return X

def train_and_save_model():
    print("Generating synthetic trajectory data...")
    X = generate_synthetic_data()
    
    print("Training Isolation Forest model...")
    # contamination is the expected proportion of outliers
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(X)
    
    import os
    os.makedirs('app/models', exist_ok=True)
    
    model_path = 'app/models/anomaly_iforest.pkl'
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
