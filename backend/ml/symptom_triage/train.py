"""
Symptom Triage Classifier — Training Pipeline
===============================================
NLP text classification model that predicts the appropriate medical
specialty from free-text symptom descriptions.

Pipeline: TF-IDF Vectorization → Classifier (LogReg / SVM / MultinomialNB)
Evaluation: Stratified k-fold cross-validation with full metrics.
"""

import csv
import json
from pathlib import Path
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
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
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "training_data.csv"
MODEL_DIR = BASE_DIR / "artifacts"
MODEL_PATH = MODEL_DIR / "symptom_triage_model.joblib"
METADATA_PATH = MODEL_DIR / "symptom_triage_model.metadata.json"
REPORT_PATH = MODEL_DIR / "symptom_triage_classification_report.txt"
CONFUSION_MATRIX_PATH = MODEL_DIR / "symptom_triage_confusion_matrix.csv"

N_FOLDS = 5


def load_data(path: Path):
    """Load and clean the training data."""
    df = pd.read_csv(path, quotechar='"', skipinitialspace=True)
    df.columns = df.columns.str.strip()
    df["symptom_text"] = df["symptom_text"].str.strip().str.lower()
    df["specialty"] = df["specialty"].str.strip()
    df = df.dropna(subset=["symptom_text", "specialty"])
    return df


def get_candidate_pipelines():
    """Return candidate NLP pipelines for comparison."""
    tfidf_params = {
        "max_features": 5000,
        "ngram_range": (1, 2),
        "stop_words": "english",
        "sublinear_tf": True,
    }

    return {
        "TF-IDF + Logistic Regression": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf", LogisticRegression(
                max_iter=1000,
                random_state=42,
                class_weight="balanced",
                C=1.0,
            )),
        ]),
        "TF-IDF + Linear SVM": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf", LinearSVC(
                max_iter=2000,
                random_state=42,
                class_weight="balanced",
                C=1.0,
            )),
        ]),
        "TF-IDF + Multinomial NB": Pipeline([
            ("tfidf", TfidfVectorizer(**tfidf_params)),
            ("clf", MultinomialNB(alpha=0.1)),
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
    df = load_data(DATA_PATH)
    X = df["symptom_text"].values
    y = df["specialty"].values

    print(f"Dataset: {len(df)} samples, {len(df['specialty'].unique())} specialties")
    print(f"Specialties: {sorted(df['specialty'].unique())}")
    print(f"Cross-validation: {N_FOLDS}-fold stratified\n")

    # ── Class distribution ────────────────────────────────────
    print("Class distribution:")
    for cls, count in df["specialty"].value_counts().items():
        print(f"  {cls}: {count}")
    print()

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
    labels = sorted(set(y))
    report = classification_report(y, y_pred_cv, labels=labels, zero_division=0)

    report_text = (
        f"Symptom Triage Classifier — Classification Report\n"
        f"{'='*50}\n"
        f"Model: {best_name}\n"
        f"Dataset: {len(df)} samples, {len(labels)} specialties\n"
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
    cm = confusion_matrix(y, y_pred_cv, labels=labels)
    cm_df = pd.DataFrame(cm, index=labels, columns=labels)
    cm_df.to_csv(CONFUSION_MATRIX_PATH)
    print(f"Saved confusion matrix to {CONFUSION_MATRIX_PATH}")

    # ── Save metadata ─────────────────────────────────────────
    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "samples": len(df),
        "specialties": labels,
        "best_model": best_name,
        "cv_folds": N_FOLDS,
        "pipeline": "TF-IDF + Classifier",
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
