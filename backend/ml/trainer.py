"""
backend/ml/trainer.py
Model training and cross-validation evaluation script.
Reports precision, recall, F1, and ROC-AUC against historical + heuristic ground truth.
"""

from typing import Dict, Any
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from backend.ml.features import build_training_dataset, FEATURE_COLUMNS

ARTIFACT_DIR = os.path.dirname(__file__)
MODEL_OUTPUT_PATH = os.path.join(ARTIFACT_DIR, "model.joblib")


def train_model(n_estimators: int = 150, max_depth: int = 10) -> Dict[str, Any]:
    """
    Train Random Forest classifier with 5-fold cross-validation and save artifact.
    """
    seed_csv = os.path.join(os.path.dirname(os.path.dirname(ARTIFACT_DIR)), "data", "seed", "historical_landslides.csv")
    X, y, df = build_training_dataset(seed_csv_path=seed_csv, n_synthetic=1800)

    # Initialize calibrated Random Forest
    rf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=5,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    # 5-fold Stratified Cross-Validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    scores = cross_validate(rf, X, y, cv=cv, scoring=scoring, return_train_score=False)

    # Fit final model on full dataset
    rf.fit(X, y)

    # Feature importances
    importances = {feat: round(float(imp), 4) for feat, imp in zip(FEATURE_COLUMNS, rf.feature_importances_)}

    metrics = {
        "accuracy": round(float(np.mean(scores["test_accuracy"])), 4),
        "precision": round(float(np.mean(scores["test_precision"])), 4),
        "recall": round(float(np.mean(scores["test_recall"])), 4),
        "f1_score": round(float(np.mean(scores["test_f1"])), 4),
        "roc_auc": round(float(np.mean(scores["test_roc_auc"])), 4),
        "sample_count": len(y),
        "positive_samples": int(np.sum(y)),
        "feature_importances": importances
    }

    # Save model artifact
    artifact = {
        "model": rf,
        "features": FEATURE_COLUMNS,
        "metrics": metrics,
        "version": "v1.2-rf-calibrated"
    }
    joblib.dump(artifact, MODEL_OUTPUT_PATH)
    print(f"[ML Trainer] Model saved to {MODEL_OUTPUT_PATH}")
    print(f"[ML Trainer] Cross-Validation Results: ROC-AUC={metrics['roc_auc']}, Precision={metrics['precision']}, Recall={metrics['recall']}, F1={metrics['f1_score']}")

    return metrics


if __name__ == "__main__":
    train_model()
