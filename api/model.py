"""
FraudShield AI - Fraud Detection Model
Rule-based heuristic model simulating ML fraud detection
"""
import numpy as np
import random
import time


def analyze_transaction(amount: float, merchant: str, location: str, hour: int, category: str = "general") -> dict:
    """
    Analyze a transaction and return fraud probability.
    
    Heuristics:
    - Very high amounts → elevated risk
    - Unknown/suspicious merchants → elevated risk
    - Unusual transaction hours (1-5 AM) → elevated risk
    - High-risk locations → elevated risk
    - Crypto / wire transfer categories → elevated risk
    """
    
    score = 0.0
    flags = []
    
    # ── Amount-based scoring ──────────────────────────────────
    if amount > 10000:
        score += 0.40
        flags.append("Extremely high transaction amount")
    elif amount > 5000:
        score += 0.30
        flags.append("Very high transaction amount")
    elif amount > 2000:
        score += 0.20
        flags.append("High transaction amount")
    elif amount > 1000:
        score += 0.10
        flags.append("Above-average transaction amount")
    
    # ── Merchant-based scoring ────────────────────────────────
    suspicious_merchant_keywords = [
        "unknown", "unnamed", "anonymous", "mystery", "phantom", 
        "suspicious", "offshore", "wire", "crypto", "xyz", "test",
        "vendor 0", "merchant #", "store #", "trader"
    ]
    merchant_lower = merchant.lower()
    is_suspicious_merchant = any(kw in merchant_lower for kw in suspicious_merchant_keywords)
    if is_suspicious_merchant:
        score += 0.30
        flags.append("Suspicious or unknown merchant")
    
    # ── Location-based scoring ────────────────────────────────
    high_risk_locations = [
        "nigeria", "russia", "ukraine", "china", "iran", "north korea",
        "unknown", "offshore", "anonymous", "vpn", "tor"
    ]
    location_lower = location.lower()
    is_high_risk_location = any(loc in location_lower for loc in high_risk_locations)
    if is_high_risk_location:
        score += 0.30
        flags.append("High-risk geographic location")
    
    # ── Time-based scoring ────────────────────────────────────
    if 1 <= hour <= 5:
        score += 0.20
        flags.append("Unusual transaction time (late night / early morning)")
    elif hour == 0 or hour == 23:
        score += 0.10
        flags.append("Late-night transaction")
    
    # ── Category-based scoring ────────────────────────────────
    high_risk_categories = ["crypto", "transfer", "wire", "gambling", "forex"]
    if category.lower() in high_risk_categories:
        score += 0.20
        flags.append(f"High-risk transaction category: {category}")
    
    # ── Add small noise for realism ───────────────────────────
    noise = random.uniform(-0.05, 0.05)
    score = max(0.01, min(0.99, score + noise))
    
    # ── Determine risk level ──────────────────────────────────
    if score >= 0.70:
        risk_level = "high"
        status = "fraud"
    elif score >= 0.40:
        risk_level = "medium"
        status = "pending"
    else:
        risk_level = "low"
        status = "safe"
    
    return {
        "fraud_probability": round(score, 4),
        "risk_level": risk_level,
        "risk_score": round(score * 100, 2),
        "status": status,
        "flags": flags,
        "model_version": "v1.0.0",
        "confidence": round(1.0 - abs(score - 0.5) * 0.3, 4)
    }
