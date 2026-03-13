from flask import Blueprint, jsonify
import math

visualization_bp = Blueprint("visualization", __name__)


@visualization_bp.route("/visualization-data", methods=["GET"])
def visualization_data():
    from services.cracktime_service import estimate_crack_time
    from app import get_db

    # 1. Password Length vs Crack Time (mathematical, full charset 95)
    length_vs_crack = []
    for length in range(4, 21):
        est = estimate_crack_time(95, length)
        length_vs_crack.append({
            "length": length,
            "cpuSeconds": est["estimates"]["cpu"]["seconds"],
            "gpuSeconds": est["estimates"]["gpu"]["seconds"],
            "clusterSeconds": est["estimates"]["cluster"]["seconds"],
        })

    # 2. Character Set vs Security
    charset_vs_security = [
        {"charset": "Digits only", "size": 10, "entropyPerChar": round(math.log2(10), 2)},
        {"charset": "Lowercase", "size": 26, "entropyPerChar": round(math.log2(26), 2)},
        {"charset": "Mixed case", "size": 52, "entropyPerChar": round(math.log2(52), 2)},
        {"charset": "Alphanumeric", "size": 62, "entropyPerChar": round(math.log2(62), 2)},
        {"charset": "Full (with special)", "size": 95, "entropyPerChar": round(math.log2(95), 2)},
    ]

    # 3. Entropy vs Strength (from historical data if available)
    entropy_vs_strength = []
    try:
        db = get_db()
        history = list(
            db.test_history.find({}, {"entropy": 1, "strengthLabel": 1, "passwordLength": 1, "_id": 0})
            .sort("testedAt", -1)
            .limit(100)
        )
        entropy_vs_strength = history
    except Exception:
        pass

    # 4. Attack Type vs Success Rate
    attack_type_vs_success = {
        "dictionary": {"total": 0, "found": 0, "successRate": 0},
        "hybrid": {"total": 0, "found": 0, "successRate": 0},
        "bruteforce": {"total": 0, "found": 0, "successRate": 0},
    }
    try:
        db = get_db()
        pipeline = [
            {"$match": {"status": {"$in": ["found", "not_found"]}}},
            {"$group": {
                "_id": "$attackType",
                "total": {"$sum": 1},
                "found": {"$sum": {"$cond": [{"$eq": ["$status", "found"]}, 1, 0]}},
            }},
        ]
        for stat in db.attack_logs.aggregate(pipeline):
            attack_type_vs_success[stat["_id"]] = {
                "total": stat["total"],
                "found": stat["found"],
                "successRate": round(stat["found"] / stat["total"], 2) if stat["total"] > 0 else 0,
            }
    except Exception:
        pass

    return jsonify({
        "lengthVsCrackTime": length_vs_crack,
        "charsetVsSecurity": charset_vs_security,
        "entropyVsStrength": entropy_vs_strength,
        "attackTypeVsSuccess": attack_type_vs_success,
    })
