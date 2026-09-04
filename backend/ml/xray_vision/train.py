"""
X-Ray Vision Classifier — Training Pipeline
=============================================
Trains a ResNet18 CNN (Transfer Learning) on PneumoniaMNIST
for binary classification: Normal vs Pneumonia.

Framework: PyTorch (torchvision)
Dataset: MedMNIST (PneumoniaMNIST) — ~5,000 pediatric chest X-rays
"""

import json
from pathlib import Path
from datetime import datetime, timezone

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.utils.data as data
from torchvision import transforms, models

try:
    import medmnist
    from medmnist import INFO
except ImportError:
    raise RuntimeError("medmnist not installed. Run: pip install medmnist")

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
WEIGHTS_PATH = ARTIFACTS_DIR / "pneumonia_cnn_weights.pth"
METADATA_PATH = ARTIFACTS_DIR / "xray_vision_model.metadata.json"
REPORT_PATH = ARTIFACTS_DIR / "xray_vision_classification_report.txt"

EPOCHS = 3
BATCH_SIZE = 128
LEARNING_RATE = 0.001
CLASS_NAMES = ["Normal", "Pneumonia"]


def build_model():
    """Load pre-trained ResNet18 and modify for grayscale binary classification."""
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    # Accept 1-channel grayscale X-rays instead of 3-channel RGB
    model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
    # Binary classification (Normal vs Pneumonia)
    model.fc = nn.Linear(model.fc.in_features, 2)
    return model


def main():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # ── Data Ingestion ────────────────────────────────────────
    data_flag = "pneumoniamnist"
    info = INFO[data_flag]
    DataClass = getattr(medmnist, info["python_class"])

    data_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])

    train_dataset = DataClass(split="train", transform=data_transform, download=True)
    val_dataset = DataClass(split="val", transform=data_transform, download=True)

    train_loader = data.DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = data.DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # ── Training ──────────────────────────────────────────────
    model = build_model().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    print(f"\nStarting training ({EPOCHS} epochs)...")

    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.squeeze().to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{EPOCHS}], Training Loss: {running_loss/len(train_loader):.4f}")

    # ── Evaluation ────────────────────────────────────────────
    model.eval()
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.squeeze().to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    accuracy = correct / total
    print(f"\nValidation Accuracy: {100 * accuracy:.2f}%")

    # ── Per-class accuracy ────────────────────────────────────
    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    per_class = {}
    for i, name in enumerate(CLASS_NAMES):
        mask = all_labels == i
        if mask.sum() > 0:
            per_class[name] = round(float((all_preds[mask] == i).sum() / mask.sum()), 4)

    # ── Save weights ──────────────────────────────────────────
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), WEIGHTS_PATH)
    print(f"Model saved to {WEIGHTS_PATH}")

    # ── Save report ───────────────────────────────────────────
    report_text = (
        f"X-Ray Vision Classifier — Classification Report\n"
        f"{'='*50}\n"
        f"Model: ResNet18 (Transfer Learning)\n"
        f"Dataset: PneumoniaMNIST ({len(train_dataset)} train, {len(val_dataset)} val)\n"
        f"Epochs: {EPOCHS}\n\n"
        f"Overall Metrics:\n"
        f"  Validation Accuracy: {accuracy:.4f}\n\n"
        f"Per-Class Accuracy:\n"
    )
    for name, acc in per_class.items():
        report_text += f"  {name}: {acc:.4f}\n"

    REPORT_PATH.write_text(report_text, encoding="utf-8")
    print(f"Saved classification report to {REPORT_PATH}")

    # ── Save metadata ─────────────────────────────────────────
    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "samples": len(train_dataset) + len(val_dataset),
        "train_samples": len(train_dataset),
        "val_samples": len(val_dataset),
        "labels": CLASS_NAMES,
        "best_model": "ResNet18 (Transfer Learning)",
        "architecture": "ResNet18",
        "framework": "PyTorch",
        "epochs": EPOCHS,
        "metrics": {
            "accuracy": round(accuracy, 4),
            "per_class_accuracy": per_class,
        },
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Saved metadata to {METADATA_PATH}")


if __name__ == "__main__":
    main()
