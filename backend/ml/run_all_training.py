"""
MediRAG — Master Training Script
==================================
Trains all ML models and generates a combined evaluation report.

Usage:
    python backend/ml/run_all_training.py
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

ML_DIR = Path(__file__).resolve().parent

MODELS = [
    {
        "name": "Health Plan Recommender",
        "dir": ML_DIR / "health_plan_recommender",
        "train_script": "train.py",
        "metadata_path": "artifacts/health_plan_model.metadata.json",
        "report_path": "artifacts/health_plan_classification_report.txt",
    },
    {
        "name": "Symptom Triage Classifier",
        "dir": ML_DIR / "symptom_triage",
        "train_script": "train.py",
        "metadata_path": "artifacts/symptom_triage_model.metadata.json",
        "report_path": "artifacts/symptom_triage_classification_report.txt",
    },
]


def run_training(model_config: dict) -> dict:
    """Train a single model and return its status + metadata."""
    name = model_config["name"]
    model_dir = model_config["dir"]
    script = model_dir / model_config["train_script"]

    print(f"\n{'='*60}")
    print(f"Training: {name}")
    print(f"{'='*60}")

    if not script.exists():
        print(f"  ERROR: Training script not found: {script}")
        return {"name": name, "status": "error", "error": "Script not found"}

    result = subprocess.run(
        [sys.executable, str(script)],
        cwd=str(model_dir),
        capture_output=True,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        print(f"  FAILED (exit code {result.returncode})")
        print(f"  STDERR: {result.stderr}")
        return {
            "name": name,
            "status": "failed",
            "error": result.stderr[:500],
        }

    print(result.stdout)

    # Load metadata
    metadata_path = model_dir / model_config["metadata_path"]
    metadata = {}
    if metadata_path.exists():
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))

    return {
        "name": name,
        "status": "success",
        "metadata": metadata,
    }


def generate_evaluation_report(results: list):
    """Generate a combined markdown evaluation report."""
    report_path = ML_DIR / "evaluation_report.md"

    lines = [
        "# MediRAG — ML Model Evaluation Report",
        "",
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "---",
        "",
    ]

    for r in results:
        lines.append(f"## {r['name']}")
        lines.append("")

        if r["status"] != "success":
            lines.append(f"**Status:** ❌ {r['status']}")
            lines.append(f"**Error:** {r.get('error', 'Unknown')}")
            lines.append("")
            continue

        meta = r.get("metadata", {})
        metrics = meta.get("metrics", {})

        lines.append(f"**Status:** ✅ Trained successfully")
        lines.append(f"**Best Model:** {meta.get('best_model', 'N/A')}")
        lines.append(f"**Training Samples:** {meta.get('samples', 'N/A')}")
        lines.append(f"**CV Folds:** {meta.get('cv_folds', 'N/A')}")
        lines.append("")
        lines.append("### Metrics")
        lines.append("")
        lines.append("| Metric | Score |")
        lines.append("|--------|-------|")
        lines.append(f"| Accuracy | {metrics.get('accuracy', 'N/A')} |")
        lines.append(f"| Weighted F1 | {metrics.get('f1_weighted', 'N/A')} |")
        lines.append(f"| Weighted Precision | {metrics.get('precision_weighted', 'N/A')} |")
        lines.append(f"| Weighted Recall | {metrics.get('recall_weighted', 'N/A')} |")
        lines.append("")

        # Model comparison
        all_results = meta.get("all_model_results", {})
        if all_results:
            lines.append("### Model Comparison")
            lines.append("")
            lines.append("| Model | Accuracy | F1 (weighted) |")
            lines.append("|-------|----------|---------------|")
            for model_name, model_metrics in all_results.items():
                best_marker = " ⭐" if model_name == meta.get("best_model") else ""
                lines.append(
                    f"| {model_name}{best_marker} | "
                    f"{model_metrics.get('accuracy', 'N/A')} | "
                    f"{model_metrics.get('f1_weighted', 'N/A')} |"
                )
            lines.append("")

        # Classes/labels
        if "labels" in meta:
            lines.append(f"**Classes ({len(meta['labels'])}):** {', '.join(meta['labels'])}")
        elif "specialties" in meta:
            lines.append(f"**Specialties ({len(meta['specialties'])}):** {', '.join(meta['specialties'])}")
        lines.append("")
        lines.append("---")
        lines.append("")

    # Summary table
    lines.append("## Summary")
    lines.append("")
    lines.append("| Model | Accuracy | F1 | Status |")
    lines.append("|-------|----------|----|--------|")
    for r in results:
        if r["status"] == "success":
            m = r["metadata"].get("metrics", {})
            lines.append(
                f"| {r['name']} | {m.get('accuracy', '-')} | "
                f"{m.get('f1_weighted', '-')} | ✅ |"
            )
        else:
            lines.append(f"| {r['name']} | - | - | ❌ |")
    lines.append("")

    report_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n{'='*60}")
    print(f"Evaluation report saved to: {report_path}")
    print(f"{'='*60}")

    return report_path


def main():
    print("MediRAG ML Training Pipeline")
    print(f"Python: {sys.executable}")
    print(f"ML directory: {ML_DIR}")

    results = []
    for model_config in MODELS:
        try:
            result = run_training(model_config)
        except Exception as exc:
            result = {
                "name": model_config["name"],
                "status": "error",
                "error": str(exc),
            }
        results.append(result)

    generate_evaluation_report(results)

    all_ok = all(r["status"] == "success" for r in results)
    if all_ok:
        print("\n[OK] All models trained successfully!")
    else:
        print("\n[WARN] Some models failed to train. Check the report.")

    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
