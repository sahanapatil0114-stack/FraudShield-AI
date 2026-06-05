"""
FraudShield AI - Flask Fraud Detection API
Run: python app.py
API runs on: http://localhost:5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_transaction
import time
import datetime
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]}})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "service": "FraudShield AI Detection API",
        "version": "1.0.0",
        "model": "Heuristic Isolation Forest v1.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })


@app.route('/detect', methods=['POST'])
def detect():
    """
    Analyze a transaction for fraud.
    
    Request body:
    {
        "amount": float,
        "merchant": string,
        "location": string,
        "hour": int (0-23),
        "category": string (optional)
    }
    """
    start_time = time.time()
    
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No JSON body provided"}), 400
    
    # Validate required fields
    required = ["amount", "merchant", "location"]
    for field in required:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    try:
        amount = float(data.get("amount", 0))
        merchant = str(data.get("merchant", "Unknown"))
        location = str(data.get("location", "Unknown"))
        hour = int(data.get("hour", datetime.datetime.now().hour))
        category = str(data.get("category", "general"))
        
        # Run analysis
        result = analyze_transaction(amount, merchant, location, hour, category)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            "success": True,
            "result": result,
            "processing_time_ms": processing_time,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/batch-detect', methods=['POST'])
def batch_detect():
    """
    Analyze multiple transactions at once (CSV upload results).
    
    Request body: {"transactions": [...]}
    """
    data = request.get_json()
    if not data or "transactions" not in data:
        return jsonify({"success": False, "error": "No transactions array provided"}), 400
    
    transactions = data["transactions"]
    results = []
    
    for txn in transactions[:100]:  # Limit to 100 per batch
        try:
            amount = float(txn.get("amount", 0))
            merchant = str(txn.get("merchant", "Unknown"))
            location = str(txn.get("location", "Unknown"))
            hour = int(txn.get("hour", 12))
            category = str(txn.get("category", "general"))
            
            result = analyze_transaction(amount, merchant, location, hour, category)
            results.append({"transaction": txn, "analysis": result})
        except Exception as e:
            results.append({"transaction": txn, "error": str(e)})
    
    return jsonify({
        "success": True,
        "results": results,
        "total": len(results),
        "fraud_count": sum(1 for r in results if r.get("analysis", {}).get("risk_level") == "high"),
        "timestamp": datetime.datetime.utcnow().isoformat()
    })


@app.route('/stats', methods=['GET'])
def stats():
    """Return demo model statistics"""
    return jsonify({
        "success": True,
        "stats": {
            "model_accuracy": 0.9843,
            "precision": 0.9721,
            "recall": 0.9612,
            "f1_score": 0.9666,
            "total_analyzed": random.randint(125000, 130000),
            "fraud_caught": random.randint(8200, 8500),
            "false_positives": random.randint(120, 150),
            "model_version": "v1.0.0",
            "last_trained": "2024-01-15T00:00:00Z"
        }
    })

@app.route('/')
def home():
    return jsonify({
        "message": "FraudShield AI API is running",
        "status": "online",
        "endpoints": [
            "/health",
            "/detect",
            "/batch-detect",
            "/stats"
        ]
    })
if __name__ == '__main__':
    print("=" * 50)
    print("  FraudShield AI - Detection API")
    print("  Running on: http://localhost:5001")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
