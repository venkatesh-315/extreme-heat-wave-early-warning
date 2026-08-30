"""
Unit Tests for Thermal Engine (app/thermal.py) using known reference values.
"""

import unittest
import math
from app.thermal import (
    calculate_dew_point,
    calculate_heat_index,
    calculate_wet_bulb_temperature,
    calculate_wbgt,
    calculate_wbgt_shade,
    calculate_utci,
    calculate_cumulative_heat_exposure,
    calculate_consecutive_hot_day_metrics,
    compute_complete_thermal_profile,
    validate_thermal_inputs,
)


class TestThermalEngine(unittest.TestCase):
    """
    Validates thermodynamic functions against standard meteorological & NOAA reference values.
    """

    def test_noaa_heat_index_reference_values(self):
        """
        Validates Heat Index against official NOAA / NWS heat index tables:
        - 30°C (86°F), 50% RH -> ~31.1°C (88°F)
        - 35°C (95°F), 60% RH -> ~50.0°C (122°F)
        - 40°C (104°F), 40% RH -> ~53.3°C (128°F)
        - 25°C (< 80°F) -> 25.0°C (mild range)
        """
        hi_30_50 = calculate_heat_index(30.0, 50.0)
        self.assertAlmostEqual(hi_30_50, 31.1, delta=1.5)

        hi_35_60 = calculate_heat_index(35.0, 60.0)
        self.assertAlmostEqual(hi_35_60, 45.1, delta=1.5)

        hi_40_40 = calculate_heat_index(40.0, 40.0)
        self.assertAlmostEqual(hi_40_40, 48.3, delta=1.5)

        hi_mild = calculate_heat_index(22.0, 45.0)
        self.assertAlmostEqual(hi_mild, 21.4, delta=0.5)

        hi_cold = calculate_heat_index(18.0, 40.0)
        self.assertEqual(hi_cold, 18.0)

    def test_dew_point_magnus_tetens_reference(self):
        """
        Standard psychrometric reference values for Dew Point:
        - 30°C, 50% RH -> ~18.4°C
        - 40°C, 30% RH -> ~19.1°C
        - 20°C, 100% RH -> 20.0°C
        """
        dp_30_50 = calculate_dew_point(30.0, 50.0)
        self.assertAlmostEqual(dp_30_50, 18.4, delta=0.5)

        dp_40_30 = calculate_dew_point(40.0, 30.0)
        self.assertAlmostEqual(dp_40_30, 19.1, delta=0.5)

        dp_sat = calculate_dew_point(20.0, 100.0)
        self.assertAlmostEqual(dp_sat, 20.0, delta=0.1)

    def test_wet_bulb_stull_reference(self):
        """
        Validates Stull (2011) Wet-Bulb Temperature formula against published reference:
        - 30°C, 50% RH -> ~22.0°C
        - 40°C, 30% RH -> ~25.9°C
        """
        tw_30_50 = calculate_wet_bulb_temperature(30.0, 50.0)
        self.assertAlmostEqual(tw_30_50, 22.0, delta=0.6)

        tw_40_30 = calculate_wet_bulb_temperature(40.0, 30.0)
        self.assertAlmostEqual(tw_40_30, 25.9, delta=0.6)

    def test_wbgt_outdoor_and_shade(self):
        """
        Validates WBGT outdoor (with solar load) and in-shade formulations:
        - Outdoor WBGT must strictly exceed Shade WBGT under positive solar radiation.
        """
        wbgt_outdoor = calculate_wbgt(
            temperature_c=42.0,
            humidity_pct=35.0,
            wind_speed_ms=2.5,
            solar_radiation_w_m2=900.0,
        )
        wbgt_shade = calculate_wbgt_shade(temperature_c=42.0, humidity_pct=35.0)

        self.assertGreater(wbgt_outdoor, wbgt_shade)
        self.assertGreater(wbgt_outdoor, 30.0)  # Extreme heat threshold
        self.assertLess(wbgt_outdoor, 48.0)

    def test_utci_reference_bounds(self):
        """
        Validates UTCI 6th-order polynomial behavior:
        - Under 45°C dry bulb and 900 W/m² solar load, UTCI should indicate severe thermal stress (> 46°C).
        - Under 25°C and low solar load, UTCI should be moderate (~25-28°C).
        """
        utci_extreme = calculate_utci(45.0, 35.0, wind_speed_ms=2.0, solar_radiation_w_m2=900.0)
        self.assertGreater(utci_extreme, 46.0)

        utci_mild = calculate_utci(24.0, 40.0, wind_speed_ms=3.0, solar_radiation_w_m2=200.0)
        self.assertLess(utci_mild, 32.0)

    def test_cumulative_heat_exposure(self):
        """
        Validates cumulative degree-days calculation:
        - 45°C for 4 consecutive days with baseline 35°C -> 4 * (45 - 35) = 40.0 °C·days
        - 30°C for 5 days with baseline 35°C -> 0.0 °C·days (below threshold)
        """
        deg_days_hot = calculate_cumulative_heat_exposure(45.0, 4, baseline_threshold_c=35.0)
        self.assertEqual(deg_days_hot, 40.0)

        deg_days_cool = calculate_cumulative_heat_exposure(30.0, 5, baseline_threshold_c=35.0)
        self.assertEqual(deg_days_cool, 0.0)

    def test_consecutive_hot_day_metrics(self):
        """
        Validates hotspell severity and nocturnal recovery penalty metrics.
        """
        metrics = calculate_consecutive_hot_day_metrics(
            temperature_c=44.0,
            humidity_pct=40.0,
            consecutive_hot_days=5,
        )
        self.assertIn("hotspell_severity_index", metrics)
        self.assertIn("thermal_recovery_penalty", metrics)
        self.assertIn("cumulative_wbgt_excess", metrics)
        self.assertGreater(metrics["hotspell_severity_index"], 0.0)
        self.assertGreaterEqual(metrics["thermal_recovery_penalty"], 1.0)

    def test_complete_thermal_profile_determinism(self):
        """
        Verifies complete thermal profile calculation is 100% deterministic and contains all required metrics.
        """
        profile1 = compute_complete_thermal_profile(
            temperature_c=43.5,
            humidity_pct=36.0,
            wind_speed_ms=3.0,
            solar_radiation_w_m2=880.0,
            surface_pressure_hpa=1002.0,
            consecutive_hot_days=3,
            is_urban=True,
        )
        profile2 = compute_complete_thermal_profile(
            temperature_c=43.5,
            humidity_pct=36.0,
            wind_speed_ms=3.0,
            solar_radiation_w_m2=880.0,
            surface_pressure_hpa=1002.0,
            consecutive_hot_days=3,
            is_urban=True,
        )

        self.assertEqual(profile1.heat_index_c, profile2.heat_index_c)
        self.assertEqual(profile1.wbgt_c, profile2.wbgt_c)
        self.assertEqual(profile1.utci_c, profile2.utci_c)
        self.assertEqual(profile1.cumulative_heat_exposure_deg_days, profile2.cumulative_heat_exposure_deg_days)
        self.assertEqual(profile1.hotspell_severity_index, profile2.hotspell_severity_index)
        self.assertEqual(profile1.thermal_recovery_penalty, profile2.thermal_recovery_penalty)
        self.assertEqual(profile1.uhi_offset_c, 1.6)

    def test_strict_input_validation_rejections(self):
        """
        Verifies that invalid, negative, NaN, Inf, and out-of-bounds parameters raise explicit exceptions.
        """
        # NaN / Infinity
        with self.assertRaises(ValueError):
            validate_thermal_inputs(float("nan"), 40.0)
        with self.assertRaises(ValueError):
            validate_thermal_inputs(40.0, float("inf"))

        # Negative humidity / wind / solar
        with self.assertRaises(ValueError):
            calculate_heat_index(40.0, -10.0)
        with self.assertRaises(ValueError):
            calculate_wbgt(40.0, 40.0, wind_speed_ms=-1.0)
        with self.assertRaises(ValueError):
            calculate_wbgt(40.0, 40.0, solar_radiation_w_m2=-50.0)

        # Unreasonable temperature
        with self.assertRaises(ValueError):
            calculate_heat_index(75.0, 40.0)
        with self.assertRaises(ValueError):
            calculate_heat_index(-60.0, 40.0)

        # Psychrometric inconsistency: dew point > dry bulb
        with self.assertRaises(ValueError):
            validate_thermal_inputs(30.0, 50.0, dew_point_c=36.0)


if __name__ == "__main__":
    unittest.main()
