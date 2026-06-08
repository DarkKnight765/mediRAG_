"""
Symptom Triage Classifier — Prediction Script
===============================================
Takes JSON input from stdin with a "symptoms" field,
returns predicted specialty with confidence scores.
"""

import json
import sys
from pathlib import Path

import joblib
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "artifacts" / "symptom_triage_model.joblib"


def load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        raise RuntimeError("No input provided")
    return json.loads(raw)


def main() -> int:
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found: {MODEL_PATH}")

    payload = load_payload()
    symptoms = str(payload.get("symptoms", "")).strip().lower()

    if not symptoms:
        raise RuntimeError("No symptoms provided")

    model = joblib.load(MODEL_PATH)

    # Get prediction
    prediction = model.predict([symptoms])[0]

    # Get confidence scores if the classifier supports predict_proba
    confidence = 0.0
    alternatives = []

    try:
        if hasattr(model, "predict_proba"):
            probas = model.predict_proba([symptoms])[0]
            classes = model.classes_
            sorted_indices = np.argsort(probas)[::-1]

            confidence = float(probas[sorted_indices[0]])
            alternatives = [
                {
                    "specialty": str(classes[idx]),
                    "confidence": round(float(probas[idx]), 4),
                }
                for idx in sorted_indices[1:4]
                if float(probas[idx]) > 0.05
            ]
        elif hasattr(model, "decision_function"):
            # For SVM: use decision function scores as rough confidence
            decision = model.decision_function([symptoms])[0]
            classes = model.classes_
            if decision.ndim > 0:
                exp_scores = np.exp(decision - np.max(decision))
                probas = exp_scores / exp_scores.sum()
                sorted_indices = np.argsort(probas)[::-1]
                confidence = float(probas[sorted_indices[0]])
                alternatives = [
                    {
                        "specialty": str(classes[idx]),
                        "confidence": round(float(probas[idx]), 4),
                    }
                    for idx in sorted_indices[1:4]
                    if float(probas[idx]) > 0.05
                ]
            else:
                confidence = 0.75
    except Exception:
        confidence = 0.75

    # Map confidence to urgency level
    urgency = "Low"
    symptom_lower = symptoms.lower()
    emergency_keywords = [
        "chest pain", "difficulty breathing", "loss of consciousness",
        "seizure", "stroke", "fainting", "severe bleeding", "suicidal",
        "worst headache", "sudden vision loss",
    ]
    high_keywords = [
        "blood in", "high fever", "severe pain", "vomiting blood",
        "coughing up blood",
    ]

    if any(kw in symptom_lower for kw in emergency_keywords):
        urgency = "Emergency"
    elif any(kw in symptom_lower for kw in high_keywords):
        urgency = "High"
    elif confidence < 0.5:
        urgency = "Moderate"

    response = {
        "recommendedSpecialty": prediction,
        "confidence": round(confidence, 4),
        "reasoning": f"Based on NLP analysis of symptom text, the most relevant specialty is {prediction}.",
        "alternativeSpecialties": [a["specialty"] for a in alternatives],
        "urgencyLevel": urgency,
        "model_type": "tfidf_classifier",
    }

    print(json.dumps(response))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        raise SystemExit(1)
