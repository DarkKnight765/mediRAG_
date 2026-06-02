import json
from pathlib import Path
import sys

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "artifacts" / "health_plan_model.joblib"
TEMPLATES_PATH = BASE_DIR / "plan_templates.json"


def normalize_text(value: object, fallback: str = "none") -> str:
    text = str(value or fallback).strip().lower()
    if not text:
        return fallback
    if text in {"n/a", "na", "none", "null", "nothing", "no"}:
        return "none"
    return text


def load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        raise RuntimeError("No input provided")
    return json.loads(raw)


def main() -> int:
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found: {MODEL_PATH}")

    payload = load_payload()
    model = joblib.load(MODEL_PATH)
    templates = json.loads(TEMPLATES_PATH.read_text(encoding="utf-8"))

    features = pd.DataFrame(
        [
            {
                "age": float(payload.get("age", 30)),
                "weight": float(payload.get("weight", 70)),
                "height": float(payload.get("height", 170)),
                "activity_level": normalize_text(payload.get("activityLevel"), "moderate"),
                "dietary_restrictions": normalize_text(payload.get("dietaryRestrictions"), "none"),
                "sleep_issues": normalize_text(payload.get("sleepIssues"), "none"),
            }
        ]
    )

    label = model.predict(features)[0]
    template = templates.get(label) or templates["balanced"]

    response = {
        **template,
        "metadata": {
            "predicted_plan": label,
            "input_profile": features.iloc[0].to_dict(),
            "model_type": "knn_recommender",
        },
    }

    print(json.dumps(response))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        raise SystemExit(1)
