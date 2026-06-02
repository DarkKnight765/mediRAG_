import csv
import json
from pathlib import Path
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "training_data.csv"
MODEL_DIR = BASE_DIR / "artifacts"
MODEL_PATH = MODEL_DIR / "health_plan_model.joblib"
METADATA_PATH = MODEL_DIR / "health_plan_model.metadata.json"

NUMERIC_COLUMNS = ["age", "weight", "height"]
CATEGORICAL_COLUMNS = ["activity_level", "dietary_restrictions", "sleep_issues"]


def load_rows(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    if not rows:
        raise RuntimeError("Training data is empty")
    return rows


def build_pipeline():
    preprocess = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_COLUMNS),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )

    model = KNeighborsClassifier(n_neighbors=3, weights="distance")
    return Pipeline([("preprocess", preprocess), ("model", model)])


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
    y = [row["label"].strip() for row in rows]

    pipeline = build_pipeline()
    pipeline.fit(X, y)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "samples": len(rows),
        "labels": sorted(set(y)),
        "numeric_columns": NUMERIC_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metadata to {METADATA_PATH}")


if __name__ == "__main__":
    main()
