# MediRAG — ML Model Evaluation Report

**Generated:** 2026-06-08 12:26 UTC

---

## Health Plan Recommender

**Status:** ✅ Trained successfully
**Best Model:** Logistic Regression
**Training Samples:** 115
**CV Folds:** 5

### Metrics

| Metric | Score |
|--------|-------|
| Accuracy | 0.9391 |
| Weighted F1 | 0.9402 |
| Weighted Precision | 0.9475 |
| Weighted Recall | 0.9391 |

### Model Comparison

| Model | Accuracy | F1 (weighted) |
|-------|----------|---------------|
| KNN (k=3, distance) | 0.8696 | 0.871 |
| Random Forest (n=100) | 0.913 | 0.9114 |
| Logistic Regression ⭐ | 0.9391 | 0.9402 |

**Classes (12):** balanced, balanced_diabetes, endurance_recovery, gentle_recovery, low_sodium_control, low_sodium_sleep_support, sleep_support, vegan_energy, vegetarian_active, vegetarian_balance, vegetarian_sleep_support, weight_management

---

## Symptom Triage Classifier

**Status:** ✅ Trained successfully
**Best Model:** TF-IDF + Logistic Regression
**Training Samples:** 171
**CV Folds:** 5

### Metrics

| Metric | Score |
|--------|-------|
| Accuracy | 0.4503 |
| Weighted F1 | 0.4457 |
| Weighted Precision | 0.4561 |
| Weighted Recall | 0.4503 |

### Model Comparison

| Model | Accuracy | F1 (weighted) |
|-------|----------|---------------|
| TF-IDF + Logistic Regression ⭐ | 0.4503 | 0.4457 |
| TF-IDF + Linear SVM | 0.4444 | 0.4384 |
| TF-IDF + Multinomial NB | 0.4327 | 0.4368 |

**Specialties (15):** Cardiology, Dermatology, ENT, Endocrinology, Gastroenterology, General Practice, Gynecology, Neurology, Ophthalmology, Orthopedics, Pediatrics, Psychiatry, Pulmonology, Rheumatology, Urology

---

## Summary

| Model | Accuracy | F1 | Status |
|-------|----------|----|--------|
| Health Plan Recommender | 0.9391 | 0.9402 | ✅ |
| Symptom Triage Classifier | 0.4503 | 0.4457 | ✅ |
