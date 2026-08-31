"""
Utility to generate multi-year Indian climatological heatwave training data (2022-2026).
Simulates realistic thermodynamic distributions across major heatwave hotspot cities
(Delhi, Ahmedabad, Nagpur, Hyderabad, Jaipur, Lucknow) for training and evaluation.
"""

from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from app.thermal import calculate_heat_index, calculate_wbgt, calculate_utci

CITIES = [
    {"location_id": "delhi", "name": "Delhi NCR", "lat": 28.61, "pop_density": 14500.0, "elderly": 8.2, "outdoor": 19.4, "children": 10.8, "base_temp": 41.0},
    {"location_id": "ahmedabad", "name": "Ahmedabad", "lat": 23.02, "pop_density": 11200.0, "elderly": 8.8, "outdoor": 21.0, "children": 10.4, "base_temp": 42.5},
    {"location_id": "nagpur", "name": "Nagpur", "lat": 21.14, "pop_density": 4800.0, "elderly": 9.1, "outdoor": 17.2, "children": 11.5, "base_temp": 43.0},
    {"location_id": "jaipur", "name": "Jaipur", "lat": 26.91, "pop_density": 7200.0, "elderly": 8.0, "outdoor": 20.5, "children": 11.0, "base_temp": 42.0},
    {"location_id": "hyderabad", "name": "Hyderabad", "lat": 17.38, "pop_density": 9800.0, "elderly": 8.4, "outdoor": 18.0, "children": 10.2, "base_temp": 40.5},
    {"location_id": "lucknow", "name": "Lucknow", "lat": 26.84, "pop_density": 6500.0, "elderly": 8.6, "outdoor": 19.0, "children": 11.8, "base_temp": 41.5},
]


def generate_multi_year_dataset(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    np.random.seed(42)

    weather_rows = []
    health_rows = []
    demo_rows = []

    for city in CITIES:
        demo_rows.append({
            "location_id": city["location_id"],
            "location_name": city["name"],
            "population_density": city["pop_density"],
            "elderly_percentage": city["elderly"],
            "outdoor_worker_percentage": city["outdoor"],
            "children_percentage": city["children"],
        })

        # Generate daily records (March 1 to June 30) for years 2022-2026
        for year in range(2022, 2027):
            start_date = datetime(year, 3, 1)
            consec_hot = 0

            for day_idx in range(120):  # 120 days from March to June
                current_date = start_date + timedelta(days=day_idx)
                date_str = current_date.strftime("%Y-%m-%d")

                # Seasonal curve starting mild (22-28C in March) and peaking in late May/June (44-48C)
                season_progress = day_idx / 120.0
                season_factor = season_progress
                season_temp_offset = (season_progress ** 1.8) * 16.0  # +0C in March up to +16C in May/June
                heatwave_wave = 4.0 * np.sin(day_idx / 6.0) if day_idx > 45 else 0.0

                base = 24.0 + (city["base_temp"] - 38.0) * 0.8
                temp = base + season_temp_offset + heatwave_wave + np.random.normal(0, 1.0)
                temp = round(float(np.clip(temp, 20.0, 48.5)), 1)

                rh = float(np.clip(55.0 - (temp - 30.0) * 1.5 + np.random.normal(0, 4.0), 15.0, 75.0))
                wind = float(np.clip(2.5 + np.random.normal(0, 0.8), 0.5, 8.0))
                solar = float(np.clip(750.0 + season_factor * 200.0 + np.random.normal(0, 50.0), 300.0, 1050.0))
                pressure = float(np.clip(1002.0 - season_factor * 6.0 + np.random.normal(0, 2.0), 990.0, 1012.0))
                rainfall = 0.0 if temp > 38.0 else float(np.clip(np.random.exponential(0.5), 0.0, 25.0))

                if temp >= 40.0:
                    consec_hot += 1
                else:
                    consec_hot = 0

                weather_rows.append({
                    "location_id": city["location_id"],
                    "date": date_str,
                    "temperature": temp,
                    "humidity": round(rh, 1),
                    "wind_speed": round(wind, 1),
                    "solar_radiation": round(solar, 1),
                    "surface_pressure": round(pressure, 1),
                    "rainfall_mm": round(rainfall, 1),
                })

                # Correlated health outcomes (exponential human thermal physiological response)
                wbgt_approx = calculate_wbgt(temp, rh, wind, solar)
                excess_temp = max(0.0, temp - 38.0)
                excess_wbgt = max(0.0, wbgt_approx - 28.0)

                vuln_factor = (city["pop_density"] / 10000.0) * 0.15 + (city["elderly"] / 8.0) * 0.2 + (city["outdoor"] / 18.0) * 0.15

                mortality = (
                    5.0
                    + excess_temp * 3.8
                    + excess_wbgt * 5.5
                    + consec_hot * 2.2
                    + vuln_factor * 6.0
                    + np.random.normal(0, 1.5)
                )
                mortality = round(float(np.clip(mortality, 2.0, 98.0)), 1)

                hosp = (
                    mortality * 3.6
                    + excess_temp * 14.0
                    + excess_wbgt * 20.0
                    + consec_hot * 8.0
                    + (city["children"] / 10.0) * 12.0
                    + np.random.normal(0, 5.0)
                )
                hosp = round(float(np.clip(hosp, 10.0, 480.0)), 1)

                health_rows.append({
                    "location_id": city["location_id"],
                    "date": date_str,
                    "mortality_target": mortality,
                    "hospitalization_target": hosp,
                })

    weather_df = pd.DataFrame(weather_rows)
    health_df = pd.DataFrame(health_rows)
    demo_df = pd.DataFrame(demo_rows)

    weather_df.to_csv(output_dir / "historical_weather_2022_2026.csv", index=False)
    health_df.to_csv(output_dir / "health_outcomes_2022_2026.csv", index=False)
    demo_df.to_csv(output_dir / "demographics_cities.csv", index=False)

    print(f">> Generated {len(weather_df)} records across {len(CITIES)} cities in {output_dir}")


if __name__ == "__main__":
    data_dir = Path(__file__).resolve().parent.parent / "data" / "raw"
    generate_multi_year_dataset(data_dir)
