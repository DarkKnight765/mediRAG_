"""
X-Ray Vision Classifier — Prediction Script
=============================================
Takes JSON input from stdin with an "image_path" field,
returns predicted class (Normal / Pneumonia) with confidence.

If trained weights are not found, auto-trains on PneumoniaMNIST.
"""

import json
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
WEIGHTS_PATH = ARTIFACTS_DIR / "pneumonia_cnn_weights.pth"

CLASS_NAMES = ["Normal", "Pneumonia"]


def build_model():
    """Build the same ResNet18 architecture used during training."""
    model = models.resnet18(weights=None)
    # Modify first conv layer for 1-channel grayscale input
    model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
    # Binary classification output
    model.fc = nn.Linear(model.fc.in_features, 2)
    return model


def get_transform():
    """Preprocessing pipeline matching training transforms."""
    return transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])


def auto_train():
    """Auto-train the model if weights are missing."""
    import torch.optim as optim
    import torch.utils.data as data

    try:
        import medmnist
        from medmnist import INFO
    except ImportError:
        raise RuntimeError(
            "medmnist not installed. Run: pip install medmnist"
        )

    print("Weights not found. Auto-training on PneumoniaMNIST...", file=sys.stderr)

    data_flag = "pneumoniamnist"
    info = INFO[data_flag]
    DataClass = getattr(medmnist, info["python_class"])

    data_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])

    train_dataset = DataClass(split="train", transform=data_transform, download=True)
    train_loader = data.DataLoader(train_dataset, batch_size=128, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_model().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(3):
        model.train()
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.squeeze().to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), WEIGHTS_PATH)
    print(f"Model saved to {WEIGHTS_PATH}", file=sys.stderr)
    return model


def load_model():
    """Load trained model weights, auto-training if needed."""
    if not WEIGHTS_PATH.exists():
        return auto_train()

    device = torch.device("cpu")
    model = build_model()
    model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
    model.eval()
    return model


def load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        raise RuntimeError("No input provided")
    return json.loads(raw)


def main() -> int:
    payload = load_payload()
    image_path = payload.get("image_path", "")

    if not image_path or not Path(image_path).exists():
        raise RuntimeError(f"Image not found: {image_path}")

    model = load_model()
    transform = get_transform()

    # Load and preprocess the image
    image = Image.open(image_path).convert("L")  # grayscale
    input_tensor = transform(image).unsqueeze(0)  # add batch dim

    # Inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        predicted_idx = torch.argmax(probabilities).item()
        confidence = float(probabilities[predicted_idx])

    response = {
        "prediction": CLASS_NAMES[predicted_idx],
        "confidence": round(confidence, 4),
        "class_probabilities": {
            name: round(float(probabilities[i]), 4)
            for i, name in enumerate(CLASS_NAMES)
        },
        "model_type": "resnet18_cnn",
    }

    print(json.dumps(response))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        raise SystemExit(1)
