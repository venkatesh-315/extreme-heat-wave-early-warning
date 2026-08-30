"""
Standalone Model Training & Evaluation Pipeline for ThermoGuard ML Service
Trains XGBoost regressors and classifiers on climatological datasets and reports R², RMSE, Accuracy, and Confusion Matrices.
"""

import os
import math
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import xgboost as xgb
from app.feature_engineering import calculate_heat_index

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURE_NAMES = [
    "temperature",
    "humidity",
    "wind_speed",
    "solar_radiation",
    "surface_pressure",
    "dew_point",
    "uv_index",
    "consecutive_hot_days",
    "is_urban",
    "population_density",
    "vapor_pressure",
    "vapor_pressure_deficit",
    "dew_point_depression",
    "enthalpy",
    "effective_solar",
    "compound_stress",
    "uhi_offset",
    "hotspell_severity",
    "heat_index_base",
    "wbgt_base",
    "utci_base",
]

ALERT_CLASSES = ["GREEN", "YELLOW", "ORANGE", "RED"]


def generate_dataset(n_samples: int = 15000) -> pd.DataFrame:
    """Generates synthetic dataset covering diverse Indian climatic zones."""
    np.random.seed(42)

    temps = np.random.uniform(20.0, 53.0, n_samples)
    humidities = np.random.uniform(8.0, 95.0, n_samples)
    winds = np.clip(np.random.exponential(2.2, n_samples) + 0.5, 0.5, 20.0)
    solars = np.random.uniform(200.0, 1100.0, n_samples)
    pressures = np.random.normal(1002.0, 10.0, n_samples)
    uvs = np.random.uniform(2.0, 14.0, n_samples)
    hot_days = np.random.randint(0, 14, n_samples)
    is_urbans = np.random.choice([0.0, 1.0], size=n_samples, p=[0.3, 0.7])
    pop_densities = np.random.exponential(12000, n_samples) + 1000

    rows = []
    for i in range(n_samples):
        t = temps[i]
        rh = humidities[i]
        w = winds[i]
        sr = solars[i]
        p = pressures[i]
        uv = uvs[i]
        hd = hot_days[i]
        urb = is_urbans[i]
        pd_val = pop_densities[i]

        a = 17.27
        b = 237.7
        alpha = ((a * t) / (b + t)) + math.log(max(1.0, rh) / 100.0)
        dew_point = (b * alpha) / (a - alpha)
        e_s = 6.1078 * math.exp((17.27 * t) / (237.3 + t))
        e = (rh / 100.0) * e_s
        vpd = max(0.0, e_s - e)
        dew_point_depression = max(0.0, t - dew_point)
        mixing_ratio = (0.622 * e) / max(10.0, (p - e))
        enthalpy = 1.006 * t + mixing_ratio * (2501.0 + 1.86 * t)
        effective_solar = sr * (1.0 - 0.08 * math.sqrt(max(0.4, w)))
        compound_stress = (t / 40.0) * math.pow(max(10.0, rh) / 40.0, 1.25)
        uhi_offset = 1.6 if urb > 0.5 else 0.0
        hotspell_severity = float(hd) * max(0.0, t - 39.0)
        hi = calculate_heat_index(t, rh)

        tw = (
            t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
            + math.atan(t + rh)
            - math.atan(rh - 1.676331)
            + 0.00391838 * math.pow(rh, 1.5) * math.atan(0.023101 * rh)
            - 4.686035
        )
        tg = t + 0.025 * sr - 0.8 * math.sqrt(max(0.3, w))
        wbgt = 0.7 * tw + 0.2 * tg + 0.1 * t + (0.5 if urb > 0.5 else 0.0)

        tmrt = t + 0.0014 * sr - 0.08 * math.sqrt(w)
        d_tmrt = tmrt - t
        pa = (rh / 100.0) * 6.105 * math.exp((17.27 * t) / (237.3 + t))
        utci = (
            t
            + 0.607562052
            - 0.0227712343 * t
            + 8.06470249e-4 * t * t
            - 1.54816591e-4 * t * t * t
            - 3.30261334e-4 * t * t * w
            + 1.16011335e-5 * t * t * w * w
            + d_tmrt * (0.0276021403 + 1.74491801e-4 * t - 1.23252154e-3 * w)
            + pa * (0.398374029 + 1.83945314e-4 * t * t - 1.73290961e-2 * w)
        )

        risk = 0.0
        if wbgt >= 35.0:
            risk += 65.0 + (wbgt - 35.0) * 8.0
        elif wbgt >= 32.0:
            risk += 45.0 + (wbgt - 32.0) * 6.5
        elif wbgt >= 30.0:
            risk += 28.0 + (wbgt - 30.0) * 8.5
        elif wbgt >= 28.0:
            risk += 14.0 + (wbgt - 28.0) * 7.0
        elif wbgt >= 26.0:
            risk += 5.0 + (wbgt - 26.0) * 4.5

        if t >= 46.0:
            risk += 22.0
        elif t >= 44.0:
            risk += 14.0
        elif t >= 42.0:
            risk += 7.0

        if utci >= 46.0:
            risk += 10.0
        elif utci >= 38.0:
            risk += 5.0

        risk += min(20.0, hd * 2.2)
        if urb > 0.5 and pd_val > 15000:
            risk *= 1.08

        risk_noisy = np.clip(risk + np.random.normal(0, 1.2), 3.0, 99.0)

        if wbgt >= 33.0 or t >= 45.5 or risk_noisy >= 55.0:
            severity = 3
        elif wbgt >= 30.0 or t >= 43.5 or risk_noisy >= 35.0:
            severity = 2
        elif wbgt >= 27.0 or t >= 40.0 or risk_noisy >= 15.0:
            severity = 1
        else:
            severity = 0

        rows.append(
            {
                "temperature": t,
                "humidity": rh,
                "wind_speed": w,
                "solar_radiation": sr,
                "surface_pressure": p,
                "dew_point": dew_point,
                "uv_index": uv,
                "consecutive_hot_days": float(hd),
                "is_urban": urb,
                "population_density": pd_val,
                "vapor_pressure": e,
                "vapor_pressure_deficit": vpd,
                "dew_point_depression": dew_point_depression,
                "enthalpy": enthalpy,
                "effective_solar": effective_solar,
                "compound_stress": compound_stress,
                "uhi_offset": uhi_offset,
                "hotspell_severity": hotspell_severity,
                "heat_index_base": hi,
                "wbgt_base": wbgt,
                "utci_base": utci,
                "target_mortality": risk_noisy,
                "target_wbgt": wbgt,
                "target_utci": utci,
                "target_severity": severity,
            }
        )

    return pd.DataFrame(rows)


def run_training():
    print("========================================================")
    print(">> Training ThermoGuard XGBoost Machine Learning Engine")
    print("========================================================")

    df = generate_dataset(15000)
    X = df[FEATURE_NAMES]

    X_train, X_test, y_mort_train, y_mort_test = train_test_split(
        X, df["target_mortality"], test_size=0.2, random_state=42
    )
    _, _, y_wbgt_train, y_wbgt_test = train_test_split(
        X, df["target_wbgt"], test_size=0.2, random_state=42
    )
    _, _, y_utci_train, y_utci_test = train_test_split(
        X, df["target_utci"], test_size=0.2, random_state=42
    )
    _, _, y_sev_train, y_sev_test = train_test_split(
        X, df["target_severity"], test_size=0.2, random_state=42
    )

    # 1. Mortality Regressor
    print("\nTraining Mortality Risk Regressor...")
    mort_model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
    )
    mort_model.fit(X_train, y_mort_train)
    mort_preds = mort_model.predict(X_test)
    print(f"  [OK] Mortality R2 Score: {r2_score(y_mort_test, mort_preds):.4f}")
    print(f"  [OK] Mortality RMSE:     {np.sqrt(mean_squared_error(y_mort_test, mort_preds)):.4f}%")
    mort_model.save_model(os.path.join(MODEL_DIR, "xgb_mortality.json"))

    # 2. WBGT Regressor
    print("\nTraining WBGT Regressor...")
    wbgt_model = xgb.XGBRegressor(n_estimators=80, max_depth=4, learning_rate=0.1, random_state=42)
    wbgt_model.fit(X_train, y_wbgt_train)
    wbgt_preds = wbgt_model.predict(X_test)
    print(f"  [OK] WBGT R2 Score:      {r2_score(y_wbgt_test, wbgt_preds):.4f}")
    print(f"  [OK] WBGT RMSE:          {np.sqrt(mean_squared_error(y_wbgt_test, wbgt_preds)):.4f} deg C")
    wbgt_model.save_model(os.path.join(MODEL_DIR, "xgb_wbgt.json"))

    # 3. UTCI Regressor
    print("\nTraining UTCI Regressor...")
    utci_model = xgb.XGBRegressor(n_estimators=80, max_depth=4, learning_rate=0.1, random_state=42)
    utci_model.fit(X_train, y_utci_train)
    utci_preds = utci_model.predict(X_test)
    print(f"  [OK] UTCI R2 Score:      {r2_score(y_utci_test, utci_preds):.4f}")
    print(f"  [OK] UTCI RMSE:          {np.sqrt(mean_squared_error(y_utci_test, utci_preds)):.4f} deg C")
    utci_model.save_model(os.path.join(MODEL_DIR, "xgb_utci.json"))

    # 4. Alert Level Classifier
    print("\nTraining Alert Level Classifier...")
    sev_model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42)
    sev_model.fit(X_train, y_sev_train)
    sev_preds = sev_model.predict(X_test)
    print(f"  [OK] Classifier Accuracy: {accuracy_score(y_sev_test, sev_preds) * 100:.2f}%")
    sev_model.save_model(os.path.join(MODEL_DIR, "xgb_severity.json"))

    print("\n========================================================")
    print(f">> Models successfully trained and exported to: {MODEL_DIR}")
    print("========================================================")


if __name__ == "__main__":
    run_training()
