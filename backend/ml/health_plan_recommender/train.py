"""
Health Plan Recommender — Training Pipeline
============================================
Trains multiple classifiers (KNN, RandomForest, LogisticRegression),
performs stratified k-fold cross-validation, and selects the best model.
Outputs classification report, confusion matrix, and model metadata.
"""

import csv
import json
from pathlib import Path
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "training_data.csv"
MODEL_DIR = BASE_DIR / "artifacts"
MODEL_PATH = MODEL_DIR / "health_plan_model.joblib"
METADATA_PATH = MODEL_DIR / "health_plan_model.metadata.json"
REPORT_PATH = MODEL_DIR / "health_plan_classification_report.txt"
CONFUSION_MATRIX_PATH = MODEL_DIR / "health_plan_confusion_matrix.csv"

NUMERIC_COLUMNS = ["age", "weight", "height"]
CATEGORICAL_COLUMNS = ["activity_level", "dietary_restrictions", "sleep_issues"]

N_FOLDS = 5


def load_rows(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    if not rows:
        raise RuntimeError("Training data is empty")
    return rows


def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_COLUMNS),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )


def get_candidate_pipelines():
    """Return a dict of model_name -> Pipeline for comparison."""
    return {
        "KNN (k=3, distance)": Pipeline([
            ("preprocess", build_preprocessor()),
            ("model", KNeighborsClassifier(n_neighbors=3, weights="distance")),
        ]),
        "Random Forest (n=100)": Pipeline([
            ("preprocess", build_preprocessor()),
            ("model", RandomForestClassifier(
                n_estimators=100, random_state=42, class_weight="balanced",
            )),
        ]),
        "Logistic Regression": Pipeline([
            ("preprocess", build_preprocessor()),
            ("model", LogisticRegression(
                max_iter=1000, random_state=42, class_weight="balanced",
            )),
        ]),
    }


def evaluate_with_cv(pipeline, X, y, n_folds=N_FOLDS):
    """Run stratified k-fold CV and return aggregated metrics."""
    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)
    y_pred = cross_val_predict(pipeline, X, y, cv=skf)

    acc = accuracy_score(y, y_pred)
    f1 = f1_score(y, y_pred, average="weighted", zero_division=0)
    prec = precision_score(y, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y, y_pred, average="weighted", zero_division=0)

    return {
        "accuracy": round(acc, 4),
        "f1_weighted": round(f1, 4),
        "precision_weighted": round(prec, 4),
        "recall_weighted": round(rec, 4),
        "y_pred": y_pred,
    }


def main():
    rows = load_rows(DATA_PATH)
    X = pd.DataFrame(
        [
            {
                "age": float(row["age"]),
                "weight": float(row["weight"]),
                "height": float(row["height"]),
                "activity_level": row["activity_level"].strip().lower(),
                "dietary_restrictions": row["dietary_restrictions"].strip().lower(),
                "sleep_issues": row["sleep_issues"].strip().lower(),
            }
            for row in rows
        ]
    )
    y = np.array([row["label"].strip() for row in rows])

    print(f"Dataset: {len(rows)} samples, {len(set(y))} classes")
    print(f"Classes: {sorted(set(y))}")
    print(f"Cross-validation: {N_FOLDS}-fold stratified\n")

    # ── Compare candidate models ──────────────────────────────
    candidates = get_candidate_pipelines()
    results = {}

    for name, pipeline in candidates.items():
        print(f"Evaluating: {name}...")
        metrics = evaluate_with_cv(pipeline, X, y)
        results[name] = metrics
        print(f"  Accuracy:  {metrics['accuracy']:.4f}")
        print(f"  F1 (wt):   {metrics['f1_weighted']:.4f}")
        print(f"  Precision: {metrics['precision_weighted']:.4f}")
        print(f"  Recall:    {metrics['recall_weighted']:.4f}")
        print()

    # ── Select best model by weighted F1 ──────────────────────
    best_name = max(results, key=lambda k: results[k]["f1_weighted"])
    best_metrics = results[best_name]
    best_pipeline = candidates[best_name]

    print(f"{'='*50}")
    print(f"Best model: {best_name}")
    print(f"  Accuracy:  {best_metrics['accuracy']:.4f}")
    print(f"  F1 (wt):   {best_metrics['f1_weighted']:.4f}")
    print(f"{'='*50}\n")

    # ── Train final model on full dataset ─────────────────────
    best_pipeline.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_pipeline, MODEL_PATH)

    # ── Generate classification report ────────────────────────
    y_pred_cv = best_metrics["y_pred"]
    report = classification_report(y, y_pred_cv, zero_division=0)

    report_text = (
        f"Health Plan Recommender — Classification Report\n"
        f"{'='*50}\n"
        f"Model: {best_name}\n"
        f"Dataset: {len(rows)} samples, {len(set(y))} classes\n"
        f"Evaluation: {N_FOLDS}-fold stratified cross-validation\n\n"
        f"Overall Metrics:\n"
        f"  Accuracy:           {best_metrics['accuracy']:.4f}\n"
        f"  Weighted F1:        {best_metrics['f1_weighted']:.4f}\n"
        f"  Weighted Precision:  {best_metrics['precision_weighted']:.4f}\n"
        f"  Weighted Recall:     {best_metrics['recall_weighted']:.4f}\n\n"
        f"Per-Class Report:\n{report}\n\n"
        f"Model Comparison:\n"
    )
    for name, m in results.items():
        marker = " <-- BEST" if name == best_name else ""
        report_text += (
            f"  {name}: Acc={m['accuracy']:.4f}, "
            f"F1={m['f1_weighted']:.4f}{marker}\n"
        )

    REPORT_PATH.write_text(report_text, encoding="utf-8")
    print(f"Saved classification report to {REPORT_PATH}")

    # ── Save confusion matrix as CSV ──────────────────────────
    labels = sorted(set(y))
    cm = confusion_matrix(y, y_pred_cv, labels=labels)
    cm_df = pd.DataFrame(cm, index=labels, columns=labels)
    cm_df.to_csv(CONFUSION_MATRIX_PATH)
    print(f"Saved confusion matrix to {CONFUSION_MATRIX_PATH}")

    # ── Save metadata ─────────────────────────────────────────
    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "samples": len(rows),
        "labels": sorted(set(y)),
        "best_model": best_name,
        "numeric_columns": NUMERIC_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
        "cv_folds": N_FOLDS,
        "metrics": {
            "accuracy": best_metrics["accuracy"],
            "f1_weighted": best_metrics["f1_weighted"],
            "precision_weighted": best_metrics["precision_weighted"],
            "recall_weighted": best_metrics["recall_weighted"],
        },
        "all_model_results": {
            name: {k: v for k, v in m.items() if k != "y_pred"}
            for name, m in results.items()
        },
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metadata to {METADATA_PATH}")


if __name__ == "__main__":
    main()
